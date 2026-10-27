"""Collects extra product angles from Spareto variant galleries.

The first harvest kept a single og:image. Product pages list several variant
image ids; each id's /original/ file is a real photo of that part, not a
category cover. Writes images[] back onto spareto_wide_enriched.json.
"""
import concurrent.futures as cf
import json
import re
import ssl
import urllib.request

PATH = "/vercel/share/v0-project/.v0/refs/spareto_wide_enriched.json"
ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0", "Accept": "text/html"}


def originals(url):
    try:
        page = urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=40, context=ctx).read().decode("utf-8", "replace")
    except Exception as e:
        return url, None, str(e)[:60]
    ids = list(dict.fromkeys(re.findall(r"variants/images/(\d{3}/\d{3}/\d{3})/(?:original|large)/([^\"'\s]+)", page)))
    # Keep one file per image id. Prefer the original rendition.
    seen = []
    for image_id, name in ids:
        name = name.split("?")[0]
        if not re.search(r"\.(?:jpg|jpeg|png|webp)$", name, re.I):
            continue
        seen.append(f"https://cdn.spareto.com/variants/images/{image_id}/original/{name}")
    return url, list(dict.fromkeys(seen))[:6], None


def main():
    rows = json.load(open(PATH))
    targets = [r for r in rows if r.get("url") and r.get("gtin") and "InStock" in (r.get("availability") or "")]
    print("targets", len(targets), flush=True)
    found = {}
    done = 0
    with cf.ThreadPoolExecutor(8) as ex:
        for url, images, err in ex.map(originals, [r["url"] for r in targets]):
            done += 1
            if images:
                found[url] = images
            if done % 80 == 0:
                print(done, "multi", sum(1 for v in found.values() if len(v) > 1), flush=True)
    n = 0
    for r in rows:
        images = found.get(r.get("url"))
        if images:
            r["images"] = images
            n += 1
    json.dump(rows, open(PATH, "w"), ensure_ascii=False)
    print("updated", n, "with 2+", sum(1 for v in found.values() if len(v) > 1), "errors", len(targets) - len(found))


if __name__ == "__main__":
    main()
