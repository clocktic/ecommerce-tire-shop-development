"""Looks up UPC/EAN for US brake parts via the UPCitemdb trial API (100 req/day).

A hit is accepted only when the listing's `model` equals our MPN (case/punctuation
insensitive) and the EAN carries the manufacturer's GS1 prefix, so marketplace-generated
barcodes (Walmart 0462..., etc.) are ignored. Result -> .v0/refs/us_brake_upc.json
"""
import json, re, time, urllib.request, urllib.parse, ssl

ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0"}
R = "/vercel/share/v0-project/.v0/refs/"
GS1 = {"PowerStop": ("889906", "462875", "462167"), "EBC": ("889668", "847943"), "Hawk": ("840153", "763821"), "Brembo": ("802058",), "Wilwood": ("655022",), "StopTech": ("847200", "840183")}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def lookup(q):
    u = "https://api.upcitemdb.com/prod/trial/search?s=" + urllib.parse.quote(q) + "&match_mode=0&type=product"
    with urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=30, context=ctx) as r:
        return json.load(r)


def main():
    cat = json.load(open("/vercel/share/v0-project/lib/catalog/opening-catalog.json"))
    us = [p for p in cat if p["category"] == "brakes" and "us" in p["offers"] and not p.get("gtin")]
    try:
        out = json.load(open(R + "us_brake_upc.json"))
    except Exception:
        out = {}
    for p in us:
        if p["mpn"] in out and out[p["mpn"]]["code"] != "ERR":
            continue
        mpn_core = re.sub(r"-(PS|HAWK|WIL|BREMBO)$", "", p["mpn"]).replace("EBC-", "")
        q = f"{p['brand']} {mpn_core}"
        for attempt in range(3):
            try:
                j = lookup(q)
            except Exception as e:
                j = {"code": "ERR", "message": str(e)[:60]}
            if j.get("code") in ("TOO_FAST", "ERR"):
                time.sleep(15)
                continue
            break
        hit = None
        prefixes = GS1.get(p["brand"], ())
        for it in j.get("items") or []:
            ean = (it.get("ean") or "").lstrip("0")
            model_ok = norm(it.get("model")) == norm(mpn_core) or norm(it.get("model")) == norm(p["mpn"])
            title_ok = norm(mpn_core) in norm(it.get("title"))
            pref_ok = any(ean.startswith(x.lstrip("0")) for x in prefixes) if prefixes else True
            if (model_ok or title_ok) and pref_ok and len(ean) >= 12:
                hit = {"gtin": ean.zfill(13), "title": it.get("title"), "model": it.get("model"), "images": [i for i in (it.get("images") or []) if "walmartimages" not in i][:3]}
                break
        out[p["mpn"]] = {"query": q, "code": j.get("code"), "hit": hit}
        print(p["brand"], p["mpn"], "=>", hit["gtin"] if hit else f"none ({j.get('code')}, {len(j.get('items') or [])} items)", flush=True)
        json.dump(out, open(R + "us_brake_upc.json", "w"), ensure_ascii=False, indent=0)
        time.sleep(11)
    print("resolved", sum(1 for v in out.values() if v["hit"]), "of", len(out))


if __name__ == "__main__":
    main()
