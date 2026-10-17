"""Second pass over spareto_wide.json: pulls the schema.org additionalProperty table
(Fitting Position, Brake Disc Type, Test Mark, Wear Warning Contact, WVA...) and the
vehicle applications. Only InStock items are kept; result -> spareto_wide_enriched.json."""
import re, urllib.request, ssl, json, html, gzip, io, concurrent.futures as cf, collections

ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0", "Accept": "*/*"}
R = "/vercel/share/v0-project/.v0/refs/"


def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60, context=ctx) as r:
        d = r.read()
        if d[:2] == b"\x1f\x8b":
            d = gzip.GzipFile(fileobj=io.BytesIO(d)).read()
        return d.decode("utf-8", "replace")


PROP = re.compile(r"<td itemprop='name'>([^<]+)</td>\s*<td>\s*<span itemprop='value'>\s*([^<]*?)\s*</span>(?:\s*<span itemprop='unitText'>([^<]*)</span>)?", re.S)


def enrich(r):
    try:
        p = get(r["url"])
    except Exception as e:
        r["err"] = str(e)[:40]
        return r
    props = []
    for name, val, unit in PROP.findall(p):
        props.append([html.unescape(name.strip()), html.unescape(val.strip()) + (f" {unit.strip()}" if unit and unit.strip() and name.strip() not in ("Tightening Torque",) else "")])
    r["props"] = props
    d = dict(props)
    fp = (d.get("Fitting Position") or "").lower()
    r["axle"] = "front" if "front" in fp else ("rear" if "rear" in fp else None)
    if not r["axle"]:
        m = re.search(r"(Front|Rear) Axle", p)
        r["axle"] = m.group(1).lower() if m else None
    cars = re.findall(r"applicable for the ([^.]+)\.", r["ogdesc"])
    r["cars"] = cars[0] if cars else None
    oe = re.findall(r"original part numbers? (.+?)\.$", r["ogdesc"])
    r["oe"] = [x.strip() for x in re.split(r",\s*(?:and\s+)?|\s+and\s+", oe[0]) if x.strip()] if oe else []
    r["test"] = d.get("Test Mark") or next((x for x in re.findall(r"E\d 90R-\S+", p)), None)
    r["weight"] = (re.search(r"</span>\s*</td>\s*<td>\s*([\d.]+ Kg)", p) or [None, None])[1]
    return r


def main():
    src = [r for r in json.load(open(R + "spareto_wide.json")) if r["availability"] == "InStock"]
    print("in stock", len(src))
    with cf.ThreadPoolExecutor(8) as ex:
        out = list(ex.map(enrich, src))
    json.dump(out, open(R + "spareto_wide_enriched.json", "w"), ensure_ascii=False)
    print("axle known", sum(1 for r in out if r.get("axle")), "err", sum(1 for r in out if r.get("err")))
    print(collections.Counter(k for r in out for k, v in r.get("props", [])).most_common(30))
    print(collections.Counter((r["kind_hint"], r.get("axle")) for r in out).most_common())


if __name__ == "__main__":
    main()
