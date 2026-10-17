"""Finds a second real angle for Performance Plus Tire wheel renders.

Pages publish one og:image. Files named *_Angle.jpg usually have a sibling
*_Side.jpg that is a JPEG of the same finish. HTML 200s are soft 404s, so
this keeps a URL only when the body is a JPEG larger than 8 KB.
"""
import concurrent.futures as cf
import json
import ssl
import urllib.request

REFS = "/vercel/share/v0-project/.v0/refs/"
OUT = REFS + "ppt_angles.json"
ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0"}


def siblings(url):
    name = url.rsplit("/", 1)[-1]
    stem, dot, ext = name.rpartition(".")
    if not dot:
        return url, []
    cands = []
    if stem.endswith("_Angle"):
        cands.append(stem[: -len("_Angle")] + "_Side." + ext)
    else:
        cands.append(stem + "_Side." + ext)
        cands.append(stem + "_Angle." + ext)
    base = url.rsplit("/", 1)[0]
    good = []
    for cand in cands:
        u = f"{base}/{cand}"
        try:
            res = urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=25, context=ctx)
            buf = res.read(12000)
            if buf[:2] == b"\xff\xd8" and int(res.headers.get("content-length") or 0) > 8000:
                good.append(u)
        except Exception:
            pass
    return url, good


def main():
    rows = json.load(open(REFS + "ppt_wheels_premium.json")) + json.load(open(REFS + "ppt_wheels.json"))
    urls = sorted({w["image"] for w in rows if w.get("image")})
    found = {}
    with cf.ThreadPoolExecutor(8) as ex:
        for url, extra in ex.map(siblings, urls):
            if extra:
                found[url] = extra
    json.dump(found, open(OUT, "w"))
    print("checked", len(urls), "with side", len(found))


if __name__ == "__main__":
    main()
