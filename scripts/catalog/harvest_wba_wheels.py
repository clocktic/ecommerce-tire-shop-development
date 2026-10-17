import re, urllib.request, ssl, json, html, sys
ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "*/*", "Accept-Language": "en-GB,en;q=0.9"}
def get(u, n=6000000):
    req = urllib.request.Request(u, headers=H)
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        return r.read(n).decode("utf-8","replace")

sm = get("https://www.wheelbasealloys.com/alloy-wheels/sitemap-wheels")
links = sorted(set(re.findall(r'href="(/alloy-wheels/[a-z0-9\-]+/[a-z0-9\-]+)"', sm)))
by_brand = {}
for l in links:
    by_brand.setdefault(l.split("/")[2], []).append(l)
print("brands", len(by_brand))

# Popular European wheel brands and lines
wanted = {
 "bbs": ["ci-r","ch-r","sr","lm","cc-r","xr"],
 "oz-racing": ["ultraleggera","superturismo-lm","leggera-hlt","hyper-gt-hlt","formula-hlt","rally-racing","alleggerita-hlt"],
 "borbet": ["y","bl5","cw3","lv5","a","bly"],
 "dezent": ["tz","tr","td","te","tn","tm"],
 "aez": ["crest","straight","north","atlanta","leipzig","montreal"],
 "rial": ["x10","lucca","kodiak","m10"],
 "autec": ["uteca","mugano","wizard","ionik"],
 "ronal": ["r41","r50","r67","r57"],
 "enkei": ["rpf1","ts5","raijin","nt03"],
 "calibre": ["motion","cc-u","altus","exile","t-sport","vintage"],
 "fox-racing": ["mbm","bma","fx004","fx8"],
 "riviera": ["rv130","rv120","rf2","rf3","rv135"],
 "ispiri": ["ffr1","ffr6","csr2","ffp1"],
 "wolfrace": ["assassin","munich","genesis"],
 "alutec": ["grip","raptr","tormenta","ikenu"],
 "mak": ["stuttgart","luft","konig","allianz","wolf"],
 "momo": ["rf-01","quantum","win-pro"],
 "japan-racing": ["jr11","jr3","jr28","jr21","jr18"],
 "rotiform": ["blq","las-r","kps","ozr"],
 "msw": ["msw-85","msw-71","msw-79"],
 "ats": ["streetrallye","racelight","perfektion"],
 "dotz": ["revvo","spa","misano","mugello"],
 "cms": ["c25","c27","c30"],
 "brock": ["b32","rc34","b40"],
}

PREMIUM = {
 "oz-racing": ["ultraleggera","superturismo-lm","leggera-hlt","hyper-gt-hlt","formula-hlt","rally-racing","alleggerita-hlt-5f","challenge-hlt","estrema-gt-hlt","gran-turismo-hlt","hyper-xt-hlt","aspen-hlt","assetto-gara","ares"],
 "bbs": ["ci-r","ch-r","ch-r-ii","sr","sx","xr","cc-r"],
 "vossen": ["hf-1","hf-2","hf-3","hf-5","hf-7","hf6-1","hf6-4","hfx-1"],
 "vossen-forged": ["evo-1","evo-2","evo-3","s17-01","m-x1","m-x2","lc2-c1"],
 "hre-forged": ["520-series-520","520-series-522","520-series-527","ff04","ff10","ff11","p101","p104"],
 "rotiform": ["r109-blq","r110-blq","r139-kps","r142-las-r","r155-lsr","r141-rse","avs","fra"],
 "msw-by-oz": ["25","27t","29","30","31","41","42","43"],
 "fondmetal": ["9evo","9rr","9rs","aidon","alke","atena","768-primacy","770-edge"],
 "sparco": ["drs","ff1","ff2","ff3","podio","pro-corsa","record","trofeo-4"],
 "tsw": ["bathurst","sebring","sector","neptune","clypse","tw001-daytona","tw005-goodwood","tw006-imola"],
 "japan-racing": ["jr11","jr18","jr21","jr23","jr25","jr26","jr3","jr28"],
 "mak": ["stuttgart","luft","konig","allianz","wolf","birmingham","davinci","evo"],
 "niche": ["m116-misano","m117-misano","m124-milan","m146-essen","m150-verona","m181-cannes","m190-gamma"],
 "enkei": ["rpf1","ts5","raijin","nt03","gtc02","tsp6"],
 "concaver": ["cvr1","cvr2","cvr3","cvr4","cvr5"],
 "3sdm": ["0-01","0-04","0-05","0-06","0-08","0-09"],
}
if "--premium" in sys.argv:
    wanted = PREMIUM
    OUT = "/vercel/share/v0-project/.v0/refs/wba_wheels_premium.json"
else:
    OUT = "/vercel/share/v0-project/.v0/refs/wba_wheels.json"
out=[]
for brand, lines in wanted.items():
    cands = by_brand.get(brand, [])
    if not cands:
        print("no-brand", brand); continue
    for line in lines:
        path = f"/alloy-wheels/{brand}/{line}"
        if path not in cands:
            alt = [c for c in cands if c.split("/")[3].startswith(line)]
            if not alt:
                print("no-line", brand, line); continue
            path = alt[0]
        try:
            mp = get("https://www.wheelbasealloys.com" + path)
        except Exception as e:
            print("ERR", path, str(e)[:50]); continue
        colours = sorted(set(re.findall(r'href="(' + re.escape(path) + r'/[a-z0-9\-]+)"', mp)))
        prods = []
        for cpath in colours[:3]:
            try:
                cp = get("https://www.wheelbasealloys.com" + cpath)
            except Exception:
                continue
            sizes = sorted(set(re.findall(r'href="(' + re.escape(cpath) + r'/\d{2}-inch)"', cp)))
            pref = [s for s in sizes if re.search(r'/(17|18|19|20)-inch', s)] or sizes
            for spath in pref[:2]:
                try:
                    sp = get("https://www.wheelbasealloys.com" + spath)
                except Exception:
                    continue
                m = re.search(r'window\.productData = (\{.*?\});\s*</script>', sp, re.S)
                if not m: continue
                try:
                    data = json.loads(m.group(1))
                except Exception:
                    continue
                for pr in data.get("products") or []:
                    pr["_path"] = spath
                    prods.append(pr)
        if not prods:
            print("no-data", path); continue
        # pick distinct colour x size variants, up to 4 per line, prefer 17-20"
        seen=set(); taken=0
        for pr in sorted(prods, key=lambda x: (x["attributes"].get("wheelSize") not in ("18","19","17","20"), x["attributes"].get("wheelSize"))):
            a = pr["attributes"]; s = pr.get("stock") or {}
            key = (a.get("wheelColour"), a.get("wheelSize"))
            if key in seen: continue

            price = float(s.get("sellPrice") or 0)
            if price <= 0: continue
            seen.add(key); taken+=1
            out.append({
              "brand": a.get("wheelBrand"), "model": a.get("wheelModel"), "colour": a.get("wheelColour"),
              "mpn": a.get("partCode"), "description": a.get("itemDescription") or a.get("description"),
              "width": a.get("wheelWidth"), "size": a.get("wheelSize"), "offset": a.get("wheelMinOffset"), "offsetMax": a.get("wheelMaxOffset"),
              "pcd1": a.get("wheelPcd1"), "pcd2": a.get("wheelPcd2"), "bore": a.get("wheelBore"), "load": a.get("wheelLoad"), "weight": a.get("wheelWeight"),
              "tuv": a.get("wheelTuv"), "origin": a.get("wheelOrigin"), "image": a.get("wheelPhoto1"),
              "priceGbp": price, "rrpGbp": float(s.get("sellRRP") or 0), "inStock": s.get("inStock"),
              "url": "https://www.wheelbasealloys.com" + pr.get("_path", path),
            })
            if taken >= 5: break
        print(f"OK {brand}/{line}: {taken} variants")
json.dump(out, open(OUT,"w"), ensure_ascii=False)
print("saved", len(out))
