"""Resolves EAN/GTIN for EU tyres from the Blackcircles variant page JSON-LD.

The Blackcircles SKU is the manufacturer article number we already store as MPN.
Result -> .v0/refs/eu_tire_gtin.json  { mpn: gtin13 }
"""
import json, re, urllib.request, ssl, gzip, io, concurrent.futures as cf

ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0", "Accept": "text/html", "Accept-Language": "en-GB,en;q=0.9"}
R = "/vercel/share/v0-project/.v0/refs/"


def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60, context=ctx) as r:
        d = r.read()
        if d[:2] == b"\x1f\x8b":
            d = gzip.GzipFile(fileobj=io.BytesIO(d)).read()
        return d.decode("utf-8", "replace")


def gs1_check(code):
    digits = [int(c) for c in code]
    s = sum(d * (3 if (len(digits) - i) % 2 == 0 else 1) for i, d in enumerate(digits[:-1]))
    return (10 - s % 10) % 10 == digits[-1]


def main():
    bc = json.load(open(R + "blackcircles.json"))
    models = bc if isinstance(bc, list) else list(bc.values())
    by_sku = {}
    for m in models:
        for v in m.get("variants") or []:
            by_sku[v["sku"]] = v["url"]
    cat = json.load(open("/vercel/share/v0-project/lib/catalog/opening-catalog.json"))
    need = [p["mpn"] for p in cat if p["category"] == "tires" and "eu" in p["offers"] and not p.get("gtin")]
    print("need", len(need), "with url", sum(1 for m in need if m in by_sku))

    def work(mpn):
        u = by_sku.get(mpn)
        if not u:
            return mpn, None
        try:
            p = get(u)
        except Exception:
            return mpn, None
        m = re.search(r'"gtin":"(\d{12,14})"', p)
        if not m:
            return mpn, None
        g = m.group(1).lstrip("0")
        g = g.zfill(13) if len(g) <= 13 else g
        sku_ok = f'"sku":"{mpn}"' in p
        return mpn, g if sku_ok and gs1_check(g) else None

    out = {}
    with cf.ThreadPoolExecutor(6) as ex:
        for mpn, g in ex.map(work, need):
            if g:
                out[mpn] = g
    json.dump(out, open(R + "eu_tire_gtin.json", "w"), indent=0)
    print("resolved", len(out), "of", len(need))


if __name__ == "__main__":
    main()
