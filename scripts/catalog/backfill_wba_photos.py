"""Wheelbase leaves `wheelPhoto1` empty for some brands (OZ, MSW, Sparco, MAK, 3SDM, HRE)
but still ships the manufacturer render as og:image on the colour page.
Fills `image` on wba_wheels_premium.json records that lack one."""
import json, re, ssl, urllib.request, concurrent.futures as cf

R = "/vercel/share/v0-project/.v0/refs/"
ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0"}


def og_image(url):
    try:
        p = urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=60, context=ctx).read().decode("utf-8", "replace")
    except Exception as e:
        return url, None
    m = re.search(r'og:image" content="(https://cdn\d*\.wheelbasealloys\.com/product-images/product-[^"]+)"', p)
    return url, m.group(1) if m else None


w = json.load(open(R + "wba_wheels_premium.json"))
urls = sorted({x["url"] for x in w if not x.get("image")})
print(len(urls), "pages")
found = {}
with cf.ThreadPoolExecutor(4) as ex:
    for url, img in ex.map(og_image, urls):
        found[url] = img
        print("ok" if img else "--", url.split("alloy-wheels/")[1], flush=True)
n = 0
for x in w:
    if not x.get("image") and found.get(x["url"]):
        x["image"] = found[x["url"]]
        n += 1
json.dump(w, open(R + "wba_wheels_premium.json", "w"), indent=1)
print("filled", n, "still missing", sum(1 for x in w if not x.get("image")))
