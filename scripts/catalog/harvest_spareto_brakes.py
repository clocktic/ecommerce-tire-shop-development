"""Harvest EU brake parts (all kinds, front and rear) from Spareto sitemaps.

Reads the pre-downloaded URL lists in /tmp (all_products.txt, brake_pads_urls.txt,
brake_discs_urls.txt) and samples per brand x kind. Keeps only records with a real
EAN, an image and an InStock/BackOrder availability.
"""
import re, urllib.request, ssl, json, html, gzip, io, random, sys, time, concurrent.futures as cf

ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0", "Accept": "*/*", "Accept-Language": "en-US,en;q=0.9"}
OUT = "/vercel/share/v0-project/.v0/refs/spareto_wide.json"

BRANDS = ["brembo", "ate", "zimmermann", "textar", "ferodo", "trw", "bosch", "hella-pagid", "jurid", "mintex", "ebc-brakes", "bilstein", "ebc"]
KINDS = {
    "brake-disc": ("discs", 16),
    "brake-pad-set-disc-brake": ("pads", 14),
    "brake-caliper": ("caliper", 10),
    "brake-drum": ("drum", 4),
    "brake-shoe-set": ("shoes", 4),
    "brake-hose": ("hose", 4),
    "warning-contact-brake-pad-wear": ("sensor", 4),
    "brake-set-disc-brakes": ("pads-and-discs", 8),
    "brake-pad-set-disc-brake-disc-kit": ("pads-and-discs", 8),
}


def get(u, n=4000000):
    with urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60, context=ctx) as r:
        d = r.read(n)
        if d[:2] == b"\x1f\x8b":
            d = gzip.GzipFile(fileobj=io.BytesIO(d)).read()
        return d.decode("utf-8", "replace")


def g(p, pat):
    m = re.search(pat, p, re.S)
    return m.group(1) if m else None


def parse(u, p):
    rec = {
        "url": u,
        "mpn": g(p, r"itemprop='mpn'>([^<]+)<"),
        "gtin": g(p, r"content='(\d{8,14})' itemprop='gtin13'"),
        "name": g(p, r"<span itemprop='name'>([^<]+)<"),
        "brand": g(p, r'<img alt="([^"]+)" style="height: 2\.4rem"'),
        "price": g(p, r'itemprop="price" content="([\d.]+)"'),
        "currency": g(p, r'itemprop="priceCurrency" content="([A-Z]{3})"'),
        "availability": g(p, r"schema\.org/(\w+)' itemprop='availability'"),
        "image": g(p, r"<meta content='(https://cdn\.spareto\.com/variants/images/[^']+)' property='og:image'>"),
        "ogdesc": html.unescape(g(p, r"<meta content='([^']+)' property='og:description'>") or ""),
    }
    specs = re.findall(r"<t[hd][^>]*>\s*([^<]{2,60}?)\s*</t[hd]>\s*<td[^>]*>\s*([^<]{1,120}?)\s*</td>", p)
    rec["specs"] = [(html.unescape(a.strip()), html.unescape(b.strip())) for a, b in specs][:40]
    imgs = list(dict.fromkeys(re.findall(r'https://cdn\.spareto\.com/variants/images/[^"\'\s]+\.(?:jpg|jpeg|png|webp)(?:\?\d+)?', p)))
    rec["images"] = [i for i in imgs if "/original/" in i][:4] or imgs[:4]
    return rec


def load_urls():
    urls = set()
    for f in ["/tmp/all_products.txt", "/tmp/brake_pads_urls.txt", "/tmp/brake_discs_urls.txt"]:
        try:
            with open(f) as fh:
                for line in fh:
                    if "/products/" in line:
                        urls.add(line.strip())
        except FileNotFoundError:
            pass
    return urls


def main():
    random.seed(11)
    urls = load_urls()
    print("urls", len(urls))
    try:
        done = json.load(open(OUT))
    except Exception:
        done = []
    have = {r["url"] for r in done}
    plan = []
    for b in BRANDS:
        for kslug, (kind, want) in KINDS.items():
            pat = re.compile(rf"/products/{b}-{kslug}/[^/]+$")
            cands = [u for u in urls if pat.search(u) and u not in have]
            random.shuffle(cands)
            # Over-sample: many are back-ordered, lack EAN or an image.
            plan += [(u, kind) for u in cands[: want * 4]]
    print("plan", len(plan))

    def work(item):
        u, kind = item
        try:
            r = parse(u, get(u))
        except Exception:
            return None
        if not r["mpn"] or not r["gtin"] or not r["image"] or r["availability"] not in ("InStock", "BackOrder"):
            return None
        r["kind_hint"] = kind
        return r

    out = list(done)
    with cf.ThreadPoolExecutor(8) as ex:
        for i, r in enumerate(ex.map(work, plan)):
            if r:
                out.append(r)
            if i % 100 == 0:
                print(i, len(out), flush=True)
                json.dump(out, open(OUT, "w"), ensure_ascii=False)
    json.dump(out, open(OUT, "w"), ensure_ascii=False)
    from collections import Counter
    print("harvested", len(out))
    print(Counter((r["brand"], r["kind_hint"]) for r in out).most_common())
    print(Counter(r["availability"] for r in out))


if __name__ == "__main__":
    main()
