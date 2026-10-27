import sys
import re, urllib.request, ssl, json, html, random
ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept": "*/*", "Accept-Language": "en-US,en;q=0.9"}
def get(u, n=3000000):
    req = urllib.request.Request(u, headers=H)
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        return r.read(n).decode("utf-8","replace")

# Popular US wheel lines by brand; pick common passenger / truck sizes and bolt patterns.
brands = {
 "Fuel": ["Rebel_D680","Rebel_D679","Maverick_D538","Contra_D615","Vapor_D569","Blitz_D673","Siege_D704","Covert_D694"],
 "Method": ["305_NV","315","701_Trail","MR312","316","702_Trail"],
 "American_Racing": ["AR172_Baja","VN215","AR23","VN805","AR62_Outlaw_II"],
 "Enkei": ["RPF1","TS-5","Raijin","TS-10","Kojin","Giotto","Vanquish"],
 "Konig": ["Hypergram","Dekagram","Ampliform","Oversteer","Hexaform"],
 "KMC": ["KM542_Impact","KM544_Mesa","KM718_Summit","KM540_Recon","KM535_Grenade_Off-Road"],
 "Rotiform": ["BLQ","LAS-R","KPS","CCV","RSE"],
 "Niche": ["Misano_M117","Targa_M129","Methos_M194","Staccato_M183","Serene_NC282"],
 "Black_Rhino": ["Arsenal","Abrams","Boxer","Warlord","Rival_BR025","Chamber"],
 "Motegi": ["MR116","MR131","MR143_CS6","MR142"],
 "Moto_Metal": ["MO970","MO962","MO976"],
 "Helo": ["HE791_Maxx","HE878","HE900"],
 "Ultra": ["114-The-Chief","Hunter_195","Carnage_Beadlock_112"],
 "Asanti": ["Viceroy","Monarch","Black_Label_ABL-27_Dynasty"],
 "Dub": ["Directa","Shot_Calla","Royalty"],
 "Cragar": ["61C_S-S","Soft_8_397","Street_Pro_391"],
 "Pro_Comp": ["Series-05-Torq","Series-69-Vertigo"],
}
def parse(u, p):
    g = lambda pat: (lambda m: m.group(1) if m else None)(re.search(pat, p, re.S))
    rec = {
      "url": u,
      "title": html.unescape(g(r'<meta property="og:title" content="([^"]+)"') or ""),
      "image": g(r'<meta property="og:image" content="([^"]+)"'),
      "price": g(r'<meta itemprop="price" content="([\d.]+)"'),
      "mpn": g(r'itemprop="mpn" content="mpn:([^"]+)"'),
      "name": g(r'"position": 4,\s*"name": "([^"]+)"'),
      "line": g(r'"position": 3,\s*"name": "([^"]+)"'),
    }
    # spec table
    specs = dict(re.findall(r'<(?:td|th|span|div)[^>]*>\s*(Diameter|Width|Bolt Pattern|Offset|Center Bore|Backspacing|Finish|Load Rating|Weight|Construction|Material|Lug Count|Lip Size|Style)\s*:?\s*</(?:td|th|span|div)>\s*<(?:td|span|div)[^>]*>\s*([^<]{1,80}?)\s*</(?:td|span|div)>', p))
    rec["specs"] = {k: html.unescape(v.strip()) for k,v in specs.items()}
    # name encodes "Brand Line 18x8 5x114.3 50 ET 72.56 CB Finish"
    m = re.search(r'(\d{2}(?:\.5)?)x(\d{1,2}(?:\.\d)?)\s+([\dx.\-/ ]+?)\s+(-?\d+(?:\.\d+)?)\s*ET\s*(?:([\d.]+)\s*CB\s*)?(.*)$', rec["name"] or "")
    if m:
        rec["diameter"], rec["width"], rec["bolt"], rec["offset"], rec["cb"], rec["finish"] = m.group(1), m.group(2), m.group(3).strip(), m.group(4), m.group(5), m.group(6).strip()
    return rec


PREMIUM = {
 "Enkei": ["GTC02","RPF1","Raijin","PF09","TY-5","PF01","RS05RR","TS9","Kojin","TFR"],
 "Rotiform": ["CGN-RC211","SCP-RC214","LTN-J","RPS","BPU","TDX-RC215","KPR"],
 "Niche": ["Serene-NC282","Kanan","Riviera-NC286","Modena","Rise","Manta-NC600"],
 "Forgestar": ["F14","CF5","CF5V","CF10","F14C","X14"],
 "TSW_Alloy": ["Nurburgring","Valencia","Jarama","Bathurst","Interlagos","Turbina","Sebring","Silverstone","Chrono"],
 "Konig": ["Hypergram","Oversteer","Ampliform","Countergram","Freeform","Hexaform","Heliogram","Hyperspec"],
 "XXR": ["530","527","531","570","565","550","575","559"],
 "Motegi": ["MR160-Battle-VI","MR116","MR142","MR144","MR135","MR118","MR162-Zentoku","MR161-Kojin"],
 "Fifteen52": ["Analog-HD","Wander-Mx"],
 "Fuel": ["FF20","FF16","FF19","FF11","FF21","FF15"],
 "Momo": ["RF-01","RF-10","Suburban","Tracker"],
 "Method": ["MR703","MR305_NV","MR317","MR309_Grid","MR701"],
 "Weld": ["Ventura","Laguna","Belmont","Fulcrum"],
 "Victor_Equipment": ["Baden","Zehn","Lemans","Stabil"],
 "Beyern": ["Antler","Ritz","Mesh","Rapp"],
 "Mandrus": ["Stirling","Wolf","Mannheim","Simplex"],
}
if "--premium" in sys.argv:
    brands = PREMIUM
    OUT = "/vercel/share/v0-project/.v0/refs/ppt_wheels_premium.json"
else:
    OUT = "/vercel/share/v0-project/.v0/refs/ppt_wheels.json"
out=[]
for brand, lines in brands.items():
    try:
        sm = get(f"https://www.performanceplustire.com/sitemap_products_Wheels_{brand}.xml", 20000000)
    except Exception as e:
        print("SM ERR", brand, e); continue
    locs = re.findall(r'<loc>([^<]+)</loc>', sm)
    for line in lines:
        key = line.replace("_","[-_ ]").replace("-","[-_ ]")
        cands = [l for l in locs if re.search(r'/Wheels/' + brand.replace("_","[-_]") + r'[-_]' + key + r'[-_]', l, re.I)]
        # prefer common sizes: 17-20", 5x114.3 / 5x112 / 5x120 / 5x127 / 6x139.7 / 6x135 / 5x150 / 8x170 / 8x180
        pref = [l for l in cands if re.search(r'[-_](17|18|19|20)x', l) and re.search(r'5x114[-.]3|5x112|5x120|5x127|6x139[-.]7|6x135|5x150|8x170|8x180|5x100|5x108|5x139[-.]7', l)]
        pick = pref[:40] if pref else cands[:40]
        if not pick:
            print("no-match", brand, line, len(cands)); continue
        # pick diverse finishes/sizes: take up to 4 per line
        random.seed(brand+line)
        random.shuffle(pick)
        taken=0
        seen_finish=set()
        for u in pick:
            if taken >= 4: break
            try:
                rec = parse(u, get(u))
            except Exception as e:
                print("ERR", u, str(e)[:50]); continue
            if not rec["mpn"] or not rec["price"] or not rec["image"]: continue
            fkey = (rec.get("finish"), rec.get("diameter"))
            if fkey in seen_finish: continue
            seen_finish.add(fkey)
            rec["brand"] = brand.replace("_"," ")
            out.append(rec); taken+=1
            print(f"OK {rec['brand']} | {rec['name']} | {rec['mpn']} | ${rec['price']}")
json.dump(out, open(OUT,"w"), ensure_ascii=False)
print("saved", len(out))
