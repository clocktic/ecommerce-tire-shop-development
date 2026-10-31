#!/usr/bin/env python3
"""Page the public EPREL tyre register and rank C1 models by distinct sizes."""
import json
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

OUT = Path("/tmp/eprel-models.json")
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://eprel.ec.europa.eu/",
}
BRANDS = [
    "MICHELIN",
    "BRIDGESTONE",
    "CONTINENTAL",
    "GOODYEAR",
    "PIRELLI",
    "YOKOHAMA",
    "HANKOOK",
    "DUNLOP",
    "TOYO",
    "FALKEN",
    "KUMHO",
    "NEXEN",
    "BFGOODRICH",
    "FIRESTONE",
    "NOKIAN TYRES",
]
NOW = int(time.time())


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as res:
        return json.load(res)


def harvest(brand):
    q = urllib.parse.urlencode(
        {
            "supplierOrTrademark": brand,
            "tyreClass": "C1",
            "_page": 1,
            "_limit": 100,
        }
    )
    first = get(f"https://eprel.ec.europa.eu/api/products/tyres?{q}")
    total = first.get("size") or 0
    pages = max(1, (total + 99) // 100)
    models = defaultdict(lambda: {"sizes": set(), "snow": 0, "ice": 0, "n": 0})
    seen_regs = set()

    def take(hits):
        for hit in hits:
            if hit.get("tyreClass") != "C1":
                continue
            if hit.get("status") not in (None, "PUBLISHED"):
                continue
            end = hit.get("onMarketEndDateTS")
            if end and end < NOW:
                continue
            reg = hit.get("eprelRegistrationNumber")
            if reg in seen_regs:
                continue
            seen_regs.add(reg)
            name = ((hit.get("additionalDetails") or {}).get("commercialName") or "").strip()
            if not name:
                continue
            rim = hit.get("rimDiameter")
            try:
                rim_n = float(rim)
            except (TypeError, ValueError):
                continue
            if rim_n < 13 or rim_n > 24:
                continue
            key = name.upper()
            bucket = models[key]
            bucket["name"] = name
            size = hit.get("tyreDesignation") or hit.get("sizeDesignation")
            if size:
                bucket["sizes"].add(size)
            bucket["n"] += 1
            if hit.get("severeSnowTyre"):
                bucket["snow"] += 1
            if hit.get("iceTyre"):
                bucket["ice"] += 1

    take(first.get("hits") or [])
    for page in range(2, pages + 1):
        q = urllib.parse.urlencode(
            {
                "supplierOrTrademark": brand,
                "tyreClass": "C1",
                "_page": page,
                "_limit": 100,
            }
        )
        for attempt in range(4):
            try:
                data = get(f"https://eprel.ec.europa.eu/api/products/tyres?{q}")
                break
            except Exception as exc:
                print(f"  retry {brand} p{page} {exc}", flush=True)
                time.sleep(1.5 * (attempt + 1))
        else:
            print(f"  skip page {brand} {page}", flush=True)
            continue
        take(data.get("hits") or [])
        if page % 5 == 0:
            print(f"  {brand} page {page}/{pages}", flush=True)
        time.sleep(0.15)
    ranked = sorted(models.values(), key=lambda m: len(m["sizes"]), reverse=True)
    return {
        "brand": brand,
        "total": total,
        "models": [
            {
                "name": m["name"],
                "sizes": len(m["sizes"]),
                "regs": m["n"],
                "snow": m["snow"],
                "ice": m["ice"],
            }
            for m in ranked[:40]
        ],
    }


def main():
    out = []
    for brand in BRANDS:
        print(f"harvest {brand}", flush=True)
        try:
            row = harvest(brand)
        except Exception as exc:
            print(f"FAIL {brand} {exc}", flush=True)
            row = {"brand": brand, "error": str(exc), "models": []}
        out.append(row)
        print(
            f"  {brand} total={row.get('total')} top="
            + ", ".join(f"{m['name']}({m['sizes']})" for m in row.get("models", [])[:8]),
            flush=True,
        )
        OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print("wrote", OUT, flush=True)


if __name__ == "__main__":
    main()
