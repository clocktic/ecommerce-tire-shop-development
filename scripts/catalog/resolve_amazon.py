"""Resolve GTIN (UPC/EAN) + clean manufacturer photos via Amazon product pages.

Sets:
  brakes-us  : US brake parts from fi_brakes (amazon.com)
  wheels-us  : US wheels from ppt_wheels_premium + ppt_wheels (amazon.com)
  wheels-eu  : EU wheels from wba_wheels_premium + wba_wheels (amazon.de)

For each item:
  1. search "<brand> <mpn>", keep result cards whose title mentions the MPN
  2. open the product page and accept it ONLY if its "Manufacturer Part Number"
     / "Item model number" equals our MPN after normalisation
  3. take UPC/EAN (GS1 check digit validated) and hiRes image URLs

Output: .v0/refs/amazon_<set>.json  { mpn: {asin, gtin, images, title, cleanMpn} }
"""
import json, re, time, html, urllib.request, urllib.parse, ssl, gzip, io, os, sys

ROOT = "/vercel/share/v0-project"
R = f"{ROOT}/.v0/refs/"
ctx = ssl.create_default_context()
H = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
}
PAUSE = 14


def get(u, lang):
    req = urllib.request.Request(u, headers={**H, "Accept-Language": lang})
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        d = r.read()
        if d[:2] == b"\x1f\x8b":
            d = gzip.GzipFile(fileobj=io.BytesIO(d)).read()
        p = d.decode("utf-8", "replace")
    if "api-services-support@amazon.com" in p or "Robot Check" in p or "validateCaptcha" in p:
        raise RuntimeError("captcha")
    return p


def norm(s):
    return re.sub(r"[^A-Z0-9]", "", (s or "").upper())


def clean_mpn(mpn):
    """Retailers prefix/suffix the real manufacturer number with their own vendor codes."""
    m = re.sub(r"-(PS|HAWK|WIL|BREMBO)$", "", mpn, flags=re.I)
    m = re.sub(r"^(EBC|BBS-EU|OZR|FND|MSW|SPA|3SDM|MAK|TSW|ROT|HRE|NIC)-", "", m, flags=re.I)
    return m.rstrip("#")


def gs1_ok(g):
    d = [int(c) for c in g]
    s = sum(x * (3 if (len(d) - i) % 2 == 0 else 1) for i, x in enumerate(d[:-1]))
    return (10 - s % 10) % 10 == d[-1]


LABELS = r"(?:Manufacturer Part Number|Item model number|Part Number|Herstellernummer|Modellnummer|Artikelnummer)"


def detail(asin, host, lang):
    p = get(f"https://{host}/dp/{asin}", lang)
    text = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", p)))
    cands = re.findall(LABELS + r" ?:? ([A-Za-z0-9./\-]+) ", text)
    gtins = []
    for m in re.finditer(r"\b(?:UPC|EAN|GTIN|Global Trade Identification Number) ?:? ((?:\d{12,14} ?)+)", text):
        for g in m.group(1).split():
            g = g.lstrip("0") if len(g) == 14 else g
            g = g.zfill(12) if len(g) < 12 else g
            if len(g) in (12, 13) and gs1_ok(g):
                gtins.append(g)
    imgs = list(dict.fromkeys(re.findall(r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+)"', p)))
    title = re.search(r"<title>([^<]+)", p)
    return {"mpns": cands, "gtin": gtins[0] if gtins else None, "images": imgs[:4], "title": html.unescape(title.group(1)).strip() if title else ""}


def search(brand, mpn, host, lang, want):
    q = urllib.parse.quote_plus(f"{brand} {mpn}")
    p = get(f"https://{host}/s?k={q}&i=automotive", lang)
    cards = re.split(r'data-asin="', p)[1:]
    scored = []
    for c in cards:
        asin = c[:10]
        if not re.match(r"[A-Z0-9]{10}$", asin):
            continue
        t = re.search(r"<h2[^>]*>(.*?)</h2>", c, re.S)
        title = html.unescape(re.sub(r"<[^>]+>", "", t.group(1))) if t else ""
        scored.append((0 if want in norm(title) else 1, asin, title))
    scored.sort()
    return [(a, t) for _, a, t in scored][:3]


def items(which):
    cat = json.load(open(f"{ROOT}/lib/catalog/opening-catalog.json"))
    if which == "brakes-us":
        return [(p["brand"], p["mpn"]) for p in cat if p["category"] == "brakes" and "us" in p["offers"] and not p.get("gtin")]
    seen, out = set(), []
    if which == "wheels-us":
        for f in ("ppt_wheels_premium.json", "ppt_wheels.json"):
            for w in json.load(open(R + f)):
                if w.get("mpn") and w["mpn"] not in seen:
                    seen.add(w["mpn"]); out.append((w["brand"], w["mpn"]))
    if which == "wheels-eu":
        for f in ("wba_wheels_premium.json", "wba_wheels.json"):
            for w in json.load(open(R + f)):
                if w.get("mpn") and w["mpn"] not in seen:
                    seen.add(w["mpn"]); out.append((w["brand"], w["mpn"]))
    return out


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "brakes-us"
    host, lang = ("www.amazon.de", "de-DE,de;q=0.9") if which.endswith("-eu") else ("www.amazon.com", "en-US,en;q=0.9")
    out_path = R + f"amazon_{which}.json"
    out = json.load(open(out_path)) if os.path.exists(out_path) else {}
    todo = items(which)
    print(which, len(todo), "items", flush=True)
    for brand, mpn in todo:
        prev = out.get(mpn) or {}
        if (prev.get("asin") and not prev.get("needImages")) or prev.get("tries", 0) >= 2:
            continue
        real = clean_mpn(mpn)
        want = norm(real)
        rec = out.get(mpn) or {"asin": None, "cleanMpn": real, "tries": 0}
        try:
            found = None
            for asin, title in search(brand, real, host, lang, want):
                if want not in norm(title) and len(want) > 6:
                    continue
                time.sleep(PAUSE)
                d = detail(asin, host, lang)
                ok = any(norm(c) in (want, want + "PS") or norm(c) + "PS" == want for c in d["mpns"]) or (want in norm(d["title"]) and len(want) >= 8)
                if ok:
                    found = {"asin": asin, "cleanMpn": real, **d}
                    break
            rec = found or {**rec, "tries": rec.get("tries", 0) + 1}
            print(mpn, "=>", (found or {}).get("gtin"), len((found or {}).get("images") or []), (found or {}).get("title", "")[:60], flush=True)
        except RuntimeError as e:
            print(mpn, "BLOCKED", e, flush=True)
            time.sleep(240)
        except Exception as e:
            print(mpn, "ERR", e, flush=True)
            time.sleep(60)
        out[mpn] = rec
        json.dump(out, open(out_path, "w"), indent=1)
        time.sleep(PAUSE)
    print("done", sum(1 for v in out.values() if v.get("asin")), "of", len(todo))


if __name__ == "__main__":
    main()
