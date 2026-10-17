"""Merges the harvested reference data into Product records (lib/catalog/types.ts).

Sources live in .v0/refs/ (gitignored harvest output). Output: .v0/refs/catalog_build.json
with SOURCE image urls; scripts/catalog/upload-images.mjs swaps them for Blob urls and
writes the final lib/catalog/opening-catalog.json.
"""
import os, sys
import json, re, collections, math

R = "/vercel/share/v0-project/.v0/refs/"
GBP_EUR = 1.15  # Blackcircles / Wheelbase quote in GBP; the EU store sells in EUR.

EU_LANGS = ["de", "fr", "it", "es", "nl"]

T = {
    "de": {
        "summer": "Sommerreifen", "winter": "Winterreifen", "all-season": "Ganzjahresreifen",
        "xl": "Verstärkt (XL)", "runflat": "Runflat", "size_check": "Prüfen Sie die Größe auf der Reifenflanke vor der Bestellung.",
        "tire_short": "{season} {size} {svc} von {brand}.", "tire_desc": "{brand} {model} in {size} {svc}. {season}. Herstellernummer {mpn}.{gtin} {size_check}",
        "label": "EU-Reifenlabel {fuel}/{wet}/{noise} dB", "snow": "3PMSF-Schneeflocke",
        "wheel_short": "Leichtmetallfelge {dia}\" {w}J ET{et}, {pcd}, {finish}.", "wheel_desc": "{brand} {model} {dia}x{w} ET{et}, Lochkreis {pcd}, Mittenbohrung {cb} mm, Finish {finish}. {constr} Preis pro Felge.",
        "cast": "Gussfelge", "flow": "Flowforming-Felge", "forged": "Schmiedefelge", "load": "Traglast {kg} kg", "tuv": "TÜV-Gutachten", "per_wheel": "Preis pro Felge",
        "pads": "Bremsbelagsatz", "discs": "Bremsscheibe", "pads-and-discs": "Bremsscheiben- und Belagsatz", "kit": "Big-Brake-Kit",
        "front": "Vorderachse", "rear": "Hinterachse", "front-rear": "Vorder- und Hinterachse", "oe": "Ersetzt OE-Nummern",
        "brake_short": "{kind}, {axle}. {fit}.", "brake_desc": "{brand} {kind} {mpn} für die {axle_l}. {fit}.{oe} Passform vor der Bestellung am Fahrzeug prüfen.",
        "fits": "Passend für", "ece": "ECE R90-geprüft", "sensor": "mit Verschleißsensor", "vented": "innenbelüftet", "solid": "massiv",
    },
    "fr": {
        "summer": "Pneu été", "winter": "Pneu hiver", "all-season": "Pneu toutes saisons",
        "xl": "Renforcé (XL)", "runflat": "Runflat", "size_check": "Vérifiez la dimension sur le flanc du pneu avant de commander.",
        "tire_short": "{season} {size} {svc} de {brand}.", "tire_desc": "{brand} {model} en {size} {svc}. {season}. Référence fabricant {mpn}.{gtin} {size_check}",
        "label": "Étiquette UE {fuel}/{wet}/{noise} dB", "snow": "Marquage 3PMSF",
        "wheel_short": "Jante alu {dia}\" {w}J ET{et}, {pcd}, {finish}.", "wheel_desc": "{brand} {model} {dia}x{w} ET{et}, entraxe {pcd}, alésage {cb} mm, finition {finish}. {constr} Prix par jante.",
        "cast": "Jante coulée", "flow": "Jante flow-forming", "forged": "Jante forgée", "load": "Charge {kg} kg", "tuv": "Homologation TÜV", "per_wheel": "Prix par jante",
        "pads": "Jeu de plaquettes de frein", "discs": "Disque de frein", "pads-and-discs": "Kit disques et plaquettes", "kit": "Kit gros freins",
        "front": "Essieu avant", "rear": "Essieu arrière", "front-rear": "Essieux avant et arrière", "oe": "Remplace les références OE",
        "brake_short": "{kind}, {axle}. {fit}.", "brake_desc": "{brand} {kind} {mpn} pour l'{axle_l}. {fit}.{oe} Vérifiez l'application sur le véhicule avant de commander.",
        "fits": "Compatible", "ece": "Homologué ECE R90", "sensor": "avec témoin d'usure", "vented": "ventilé", "solid": "plein",
    },
    "it": {
        "summer": "Pneumatico estivo", "winter": "Pneumatico invernale", "all-season": "Pneumatico 4 stagioni",
        "xl": "Rinforzato (XL)", "runflat": "Runflat", "size_check": "Verifica la misura sul fianco del pneumatico prima di ordinare.",
        "tire_short": "{season} {size} {svc} di {brand}.", "tire_desc": "{brand} {model} in {size} {svc}. {season}. Codice produttore {mpn}.{gtin} {size_check}",
        "label": "Etichetta UE {fuel}/{wet}/{noise} dB", "snow": "Marcatura 3PMSF",
        "wheel_short": "Cerchio in lega {dia}\" {w}J ET{et}, {pcd}, {finish}.", "wheel_desc": "{brand} {model} {dia}x{w} ET{et}, interasse {pcd}, foro centrale {cb} mm, finitura {finish}. {constr} Prezzo per cerchio.",
        "cast": "Cerchio fuso", "flow": "Cerchio flow-forming", "forged": "Cerchio forgiato", "load": "Portata {kg} kg", "tuv": "Omologazione TÜV", "per_wheel": "Prezzo per cerchio",
        "pads": "Kit pastiglie freno", "discs": "Disco freno", "pads-and-discs": "Kit dischi e pastiglie", "kit": "Kit freni maggiorati",
        "front": "Asse anteriore", "rear": "Asse posteriore", "front-rear": "Asse anteriore e posteriore", "oe": "Sostituisce i codici OE",
        "brake_short": "{kind}, {axle}. {fit}.", "brake_desc": "{brand} {kind} {mpn} per l'{axle_l}. {fit}.{oe} Verifica l'applicazione sul veicolo prima di ordinare.",
        "fits": "Compatibile con", "ece": "Omologato ECE R90", "sensor": "con sensore di usura", "vented": "ventilato", "solid": "pieno",
    },
    "es": {
        "summer": "Neumático de verano", "winter": "Neumático de invierno", "all-season": "Neumático todo tiempo",
        "xl": "Reforzado (XL)", "runflat": "Runflat", "size_check": "Comprueba la medida en el flanco del neumático antes de pedir.",
        "tire_short": "{season} {size} {svc} de {brand}.", "tire_desc": "{brand} {model} en {size} {svc}. {season}. Referencia del fabricante {mpn}.{gtin} {size_check}",
        "label": "Etiqueta UE {fuel}/{wet}/{noise} dB", "snow": "Marcado 3PMSF",
        "wheel_short": "Llanta de aleación {dia}\" {w}J ET{et}, {pcd}, {finish}.", "wheel_desc": "{brand} {model} {dia}x{w} ET{et}, patrón {pcd}, buje {cb} mm, acabado {finish}. {constr} Precio por llanta.",
        "cast": "Llanta fundida", "flow": "Llanta flow-forming", "forged": "Llanta forjada", "load": "Carga {kg} kg", "tuv": "Homologación TÜV", "per_wheel": "Precio por llanta",
        "pads": "Juego de pastillas de freno", "discs": "Disco de freno", "pads-and-discs": "Kit de discos y pastillas", "kit": "Kit de frenos grandes",
        "front": "Eje delantero", "rear": "Eje trasero", "front-rear": "Eje delantero y trasero", "oe": "Sustituye a las referencias OE",
        "brake_short": "{kind}, {axle}. {fit}.", "brake_desc": "{brand} {kind} {mpn} para el {axle_l}. {fit}.{oe} Comprueba la aplicación en el vehículo antes de pedir.",
        "fits": "Compatible con", "ece": "Homologado ECE R90", "sensor": "con sensor de desgaste", "vented": "ventilado", "solid": "macizo",
    },
    "nl": {
        "summer": "Zomerband", "winter": "Winterband", "all-season": "All-seasonband",
        "xl": "Versterkt (XL)", "runflat": "Runflat", "size_check": "Controleer de maat op de zijkant van de band voordat u bestelt.",
        "tire_short": "{season} {size} {svc} van {brand}.", "tire_desc": "{brand} {model} in {size} {svc}. {season}. Fabrikantnummer {mpn}.{gtin} {size_check}",
        "label": "EU-bandenlabel {fuel}/{wet}/{noise} dB", "snow": "3PMSF-markering",
        "wheel_short": "Lichtmetalen velg {dia}\" {w}J ET{et}, {pcd}, {finish}.", "wheel_desc": "{brand} {model} {dia}x{w} ET{et}, steekmaat {pcd}, naafgat {cb} mm, afwerking {finish}. {constr} Prijs per velg.",
        "cast": "Gegoten velg", "flow": "Flow-forming velg", "forged": "Gesmede velg", "load": "Draagvermogen {kg} kg", "tuv": "TÜV-keuring", "per_wheel": "Prijs per velg",
        "pads": "Remblokkenset", "discs": "Remschijf", "pads-and-discs": "Remschijven- en remblokkenset", "kit": "Big-brake-kit",
        "front": "Vooras", "rear": "Achteras", "front-rear": "Voor- en achteras", "oe": "Vervangt OE-nummers",
        "brake_short": "{kind}, {axle}. {fit}.", "brake_desc": "{brand} {kind} {mpn} voor de {axle_l}. {fit}.{oe} Controleer de toepassing op het voertuig voordat u bestelt.",
        "fits": "Geschikt voor", "ece": "ECE R90-gekeurd", "sensor": "met slijtage-indicator", "vented": "geventileerd", "solid": "massief",
    },
    "es-419": {
        "summer": "Llanta de verano", "winter": "Llanta de invierno", "all-season": "Llanta all-season",
        "xl": "Reforzada (XL)", "runflat": "Run-flat", "size_check": "Confirma la medida en el costado de la llanta antes de pedir.",
        "tire_short": "{season} {size} {svc} de {brand}.", "tire_desc": "{brand} {model} en {size} {svc}. {season}. Parte {mpn}.{gtin} {size_check}",
        "label": "UTQG {utqg}", "snow": "Marcado 3PMSF",
        "wheel_short": "Rin de aluminio {dia}\" {w}J ET{et}, {pcd}, {finish}.", "wheel_desc": "{brand} {model} {dia}x{w} ET{et}, patrón {pcd}, centro {cb} mm, acabado {finish}. {constr} Precio por rin.",
        "cast": "Rin fundido", "flow": "Rin flow-formed", "forged": "Rin forjado", "load": "Carga {kg} kg", "tuv": "", "per_wheel": "Precio por rin",
        "pads": "Juego de balatas", "discs": "Disco de freno", "pads-and-discs": "Kit de discos y balatas", "kit": "Kit de frenos grandes",
        "front": "Eje delantero", "rear": "Eje trasero", "front-rear": "Eje delantero y trasero", "oe": "Reemplaza referencias OE",
        "brake_short": "{kind}, {axle}. {fit}.", "brake_desc": "{brand} {kind} {mpn} para el {axle_l}. {fit}.{oe} Confirma la aplicación en el vehículo antes de pedir.",
        "fits": "Compatible con", "ece": "", "sensor": "con sensor de desgaste", "vented": "ventilado", "solid": "sólido",
    },
}
EN = {
    "summer": "Summer tire", "winter": "Winter tire", "all-season": "All-season tire", "xl": "Extra load (XL)", "runflat": "Run-flat",
    "cast": "Cast alloy wheel", "flow": "Flow-formed alloy wheel", "forged": "Forged alloy wheel",
    "pads": "Brake pad set", "discs": "Brake disc", "pads-and-discs": "Pads and rotors kit", "kit": "Big brake kit",
    "caliper": "Brake caliper", "drum": "Brake drum", "shoes": "Brake shoe set", "hose": "Brake hose", "sensor": "Brake pad wear sensor",
    "front": "Front axle", "rear": "Rear axle", "front-rear": "Front and rear axle",
}
# Part kinds added after the first build; same keys as the storefront dictionaries.
MORE_KINDS = {
    "de": {"caliper": "Bremssattel", "drum": "Bremstrommel", "shoes": "Bremsbackensatz", "hose": "Bremsschlauch", "sensor": "Verschleißsensor"},
    "fr": {"caliper": "Étrier de frein", "drum": "Tambour de frein", "shoes": "Jeu de mâchoires de frein", "hose": "Flexible de frein", "sensor": "Témoin d'usure"},
    "it": {"caliper": "Pinza freno", "drum": "Tamburo freno", "shoes": "Kit ganasce freno", "hose": "Tubo freno", "sensor": "Sensore usura"},
    "es": {"caliper": "Pinza de freno", "drum": "Tambor de freno", "shoes": "Juego de zapatas de freno", "hose": "Latiguillo de freno", "sensor": "Sensor de desgaste"},
    "nl": {"caliper": "Remklauw", "drum": "Remtrommel", "shoes": "Remschoenenset", "hose": "Remslang", "sensor": "Slijtagesensor"},
    "es-419": {"caliper": "Cáliper de freno", "drum": "Tambor de freno", "shoes": "Juego de zapatas de freno", "hose": "Manguera de freno", "sensor": "Sensor de desgaste"},
}
for _l, _m in MORE_KINDS.items():
    T[_l].update(_m)


def slugify(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def cents(x):
    return int(round(float(x) * 100))


def pretty_eur(gbp):
    return int(math.floor(float(gbp) * GBP_EUR)) * 100 + 90


def title_brand(b):
    special = {"bfgoodrich": "BFGoodrich", "trw": "TRW", "ate": "ATE", "bbs": "BBS", "oz": "OZ Racing", "ebc": "EBC", "powerstop": "PowerStop", "stoptech": "StopTech", "r1": "R1 Concepts", "wilwood": "Wilwood"}
    k = b.lower().strip()
    return special.get(k, b.strip().title() if b.isupper() or b.islower() else b.strip())


out = []
seen_slugs = set()


def add(p):
    base = p["slug"]
    n = 2
    while p["slug"] in seen_slugs:
        p["slug"] = f"{base}-{n}"
        n += 1
    p["id"] = p["slug"]
    seen_slugs.add(p["slug"])
    out.append(p)


# ---------------------------------------------------------------- EU tyres
sl = json.load(open(R + "eu_tyres_shortlist.json"))
ep = {r[0]: r for r in json.load(open(R + "eprel_resolved.json")) if r[1] not in ("MISS", "ERR")}
viewer = json.load(open(R + "bc_viewer_models.json"))
pt = json.load(open(R + "prioritytire.json"))
eu_tire_gtin = json.load(open(R + "eu_tire_gtin.json"))


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def pt_photo_match(brand, model):
    key = norm(brand + model)
    for m in pt:
        if norm(m["name"]) == key:
            return m
    toks = [t for t in re.split(r"[\s\-\.()+/]+", model.lower()) if len(t) > 1]
    for m in pt:
        n = norm(m["name"])
        if norm(brand) in n and all(norm(t) in n for t in toks):
            return m
    return None


eu_img_stats = collections.Counter()
for i, f in enumerate(sl):
    v = f["variant"]
    brand = title_brand(f["brand"])
    model = f["model"]
    size = f"{v['width']}/{v['aspect']} R{v['rim']}"
    svc = f"{v['load']}{v['speed']}{' XL' if v['xl'] else ''}"
    vw = viewer.get(f["brand"] + "|" + model, {})
    if "slug" in vw:
        imgs = [f"https://images.blackcircles.com/tyre-viewer/{vw['slug']}{s}.webp" for s in ["_960", "-30_960", "-90_960"] if s in vw["sizes"]]
        eu_img_stats["viewer"] += 1
    else:
        m = pt_photo_match(brand, model)
        if m and m.get("images"):
            imgs = m["images"][:3]
            eu_img_stats["pt"] += 1
        else:
            imgs = [f["image"]]
            eu_img_stats["bc-small"] += 1
    e = ep.get(i)
    label = None
    if e:
        label = {"fuelEfficiency": e[6], "wetGrip": e[7], "noiseDb": int(e[8]), "noiseClass": e[9], "snowGrip": bool(e[10]), "iceGrip": bool(e[11]), "eprelId": str(e[2])}
    season = f["season"]
    gtin = eu_tire_gtin.get(str(v["sku"]))
    desc = (f.get("description") or "").strip()
    highlights = [EN[season], svc] + ([EN["xl"]] if v["xl"] else []) + ([EN["runflat"]] if v["runflat"] else [])
    if label:
        highlights.append(f"EU label {label['fuelEfficiency']} / {label['wetGrip']} / {label['noiseDb']} dB")
        if label["snowGrip"]:
            highlights.append("3PMSF snow grip")
    specs = [
        {"label": "Size", "value": f"{size} {svc}"},
        {"label": "Season", "value": EN[season].replace(" tire", "")},
        {"label": "Load index", "value": str(v["load"])},
        {"label": "Speed rating", "value": v["speed"]},
        {"label": "Run-flat", "value": "Yes" if v["runflat"] else "No"},
    ] + ([{"label": "EPREL", "value": label["eprelId"]}] if label else []) + ([{"label": "EAN", "value": gtin}] if gtin else [])
    tr = {}
    for lang in EU_LANGS:
        t = T[lang]
        hl = [t[season], svc] + ([t["xl"]] if v["xl"] else []) + ([t["runflat"]] if v["runflat"] else [])
        if label:
            hl.append(t["label"].format(fuel=label["fuelEfficiency"], wet=label["wetGrip"], noise=label["noiseDb"]))
            if label["snowGrip"]:
                hl.append(t["snow"])
        tr[lang] = {
            "shortDescription": t["tire_short"].format(season=t[season], size=size, svc=svc, brand=brand),
            "description": t["tire_desc"].format(brand=brand, model=model, size=size, svc=svc, season=t[season], mpn=v["sku"], gtin=f" EAN {gtin}." if gtin else "", size_check=t["size_check"]),
            "highlights": hl,
        }
    add({
        "slug": slugify(f"{brand} {model} {size} {svc}"), "category": "tires", "name": f"{model} {size} {svc}", "brand": brand,
        **({"gtin": gtin} if gtin else {}), "mpn": v["sku"], "images": imgs,
        "shortDescription": f"{EN[season]} {size} {svc}." + (f" EU label {label['fuelEfficiency']}/{label['wetGrip']}/{label['noiseDb']} dB." if label else ""),
        "description": (desc + " " if desc else "") + f"{brand} {model} in {size} {svc}. {EN[season]}." + (f" EAN {gtin}." if gtin else "") + " Confirm the size on your sidewall before ordering.",
        "highlights": highlights, "specs": specs,
        "offers": {"eu": {"priceCents": pretty_eur(v["price"]), "availability": "in_stock"}},
        "translations": tr,
        "tire": {"width": v["width"], "aspect": v["aspect"], "rim": v["rim"], "loadIndex": v["load"], "speedRating": v["speed"], "season": season, "extraLoad": bool(v["xl"]), "runFlat": bool(v["runflat"]), **({"euLabel": label} if label else {})},
    })
print("EU tyres", len(out), dict(eu_img_stats))

# ---------------------------------------------------------------- US tires
POPULAR = ["205/55R16", "225/45R17", "225/40R18", "235/45R18", "215/55R17", "225/65R17", "235/65R17", "265/70R17", "275/55R20", "245/40R18", "225/50R17", "235/55R19", "245/45R19", "275/65R18", "285/45R22", "195/65R15", "215/60R16", "235/60R18", "255/35R19", "265/65R18", "275/60R20", "245/35R20", "235/40R19", "265/35R19", "285/70R17", "255/40R19", "225/60R17", "215/50R17"]
SEASON_PT = {"Summer": "summer", "Winter": "winter"}
n_us = 0
for m in pt:
    vs = [v for v in m["variants"] if "InStock" in v["availability"] and v.get("gtin") and v.get("mpn")]
    if not vs:
        continue
    vs.sort(key=lambda v: (POPULAR.index(v["size"]) if v["size"] in POPULAR else 99, v["price"]))
    picked = []
    for v in vs:
        if v["size"] in [p["size"] for p in picked]:
            continue
        picked.append(v)
        if len(picked) == 2:
            break
    brand = m["brand"]
    model = m["name"].replace(brand, "").strip()
    desc = (m.get("description") or "").strip()
    for v in picked:
        pr = v["props"]
        mm = re.match(r"(\d+)/(\d+)R(\d+)", v["size"])
        if not mm:
            continue
        w, a, r = map(int, mm.groups())
        li_m = re.match(r"\s*(\d+)", pr.get("Load Index") or "")
        li = int(li_m.group(1)) if li_m else 0
        sr = (pr.get("Speed Rating") or "").strip()[:1]
        if not li or not sr:
            continue
        xl = pr.get("Load Range", "").upper() in ("XL", "RF")
        rf = pr.get("Run Flat", "No") == "Yes"
        season = SEASON_PT.get(pr.get("Season", ""), "all-season")
        utqg = None
        um = re.match(r"^(\d{2,3})(AA|A|B|C)(A|B|C)$", (pr.get("UTQG") or "").replace(" ", ""))
        if um:
            utqg = {"treadwear": int(um.group(1)), "traction": um.group(2), "temperature": um.group(3)}
        size = f"{w}/{a} R{r}"
        svc = f"{li}{sr}{' XL' if xl else ''}"
        highlights = [EN[season], svc] + ([EN["xl"]] if xl else []) + ([EN["runflat"]] if rf else [])
        if utqg:
            highlights.append(f"UTQG {utqg['treadwear']} {utqg['traction']} {utqg['temperature']}")
        if pr.get("Tire Type"):
            highlights.append(pr["Tire Type"])
        specs = [
            {"label": "Size", "value": f"{v['size']} {svc}"},
            {"label": "Season", "value": pr.get("Season", "")},
            {"label": "Load index", "value": str(li)},
            {"label": "Speed rating", "value": sr},
            {"label": "Run-flat", "value": "Yes" if rf else "No"},
        ] + ([{"label": "Tread depth", "value": pr["Tread Depth"] + '"'}] if pr.get("Tread Depth") else []) + ([{"label": "Overall diameter", "value": pr["Overall Diameter"] + '"'}] if pr.get("Overall Diameter") else [])
        t = T["es-419"]
        add({
            "slug": slugify(f"{brand} {model} {size} {svc}"), "category": "tires", "name": f"{model} {size} {svc}", "brand": brand,
            "gtin": v["gtin"], "mpn": v["mpn"], "images": m["images"][:3],
            "shortDescription": f"{EN[season]} {size} {svc}." + (f" UTQG {utqg['treadwear']} {utqg['traction']} {utqg['temperature']}." if utqg else ""),
            "description": (desc + " " if desc else "") + f"{brand} {model} in {v['size']} {svc}. {EN[season]}. Manufacturer part {v['mpn']}, UPC {v['gtin']}. Confirm the size on your sidewall before ordering.",
            "highlights": highlights, "specs": specs,
            "offers": {"us": {"priceCents": cents(v["price"]), "availability": "in_stock"}},
            "translations": {"es-419": {
                "shortDescription": t["tire_short"].format(season=t[season], size=size, svc=svc, brand=brand),
                "description": t["tire_desc"].format(brand=brand, model=model, size=size, svc=svc, season=t[season], mpn=v["mpn"], gtin=f" UPC {v['gtin']}.", size_check=t["size_check"]),
                "highlights": [t[season], svc] + ([t["xl"]] if xl else []) + ([t["runflat"]] if rf else []) + ([t["label"].format(utqg=f"{utqg['treadwear']} {utqg['traction']} {utqg['temperature']}")] if utqg else []),
            }},
            "tire": {"width": w, "aspect": a, "rim": r, "loadIndex": li, "speedRating": sr, "season": season, "extraLoad": xl, "runFlat": rf, **({"utqg": utqg} if utqg else {})},
        })
        n_us += 1
print("US tires", n_us)

# ---------------------------------------------------------------- US wheels


def load_optional(name):
    try:
        return json.load(open(R + name))
    except FileNotFoundError:
        return {}


def amazon_hit(table, mpn):
    h = table.get(mpn) or table.get(mpn.rstrip("#"))
    return h if h and h.get("asin") else None


amz_wheels_us = load_optional("amazon_wheels-us.json")
amz_wheels_eu = load_optional("amazon_wheels-eu.json")
amz_brakes_us = load_optional("amazon_brakes-us.json")

pp = json.load(open(R + "ppt_wheels_premium.json")) + json.load(open(R + "ppt_wheels.json"))
seen_ppt = set()
n_us_w = 0
for w in pp:
    if w["mpn"] in seen_ppt or not w.get("image"):
        continue
    seen_ppt.add(w["mpn"])
    hit = amazon_hit(amz_wheels_us, w["mpn"])
    gtin = hit["gtin"] if hit else None
    try:
        dia, wid, et = int(float(w["diameter"])), float(w["width"]), int(float(w["offset"]))
    except (TypeError, ValueError, KeyError):
        continue
    if not re.match(r"^\d+x[\d.]+$", w.get("bolt") or ""):
        continue
    cb = float(w["cb"]) if w.get("cb") else None
    structure = (w.get("structure") or "").lower()
    constr_key = "forged" if "forged" in structure or "forged" in w["line"].lower() else ("flow" if "flow" in structure or "flow" in w["line"].lower() else "cast")
    constr = {"cast": "Cast", "flow": "Flow-formed", "forged": "Forged"}[constr_key]
    model = w["line"].replace(w["brand"], "").replace(w["finish"], "").strip()
    wid_s = f"{wid:g}"
    specs = [
        {"label": "Size", "value": f"{dia}x{wid_s}"}, {"label": "Bolt pattern", "value": w["bolt"]}, {"label": "Offset", "value": f"ET{et}"},
    ] + ([{"label": "Center bore", "value": f"{cb:g} mm"}] if cb else []) + [
        {"label": "Finish", "value": w["finish"]}, {"label": "Material", "value": w.get("material") or "Aluminum"}, {"label": "Structure", "value": w.get("structure") or "1-Piece"},
    ] + ([{"label": "Backspacing", "value": w["backspace_in"] + '"'}] if w.get("backspace_in") else []) + ([{"label": "Center cap", "value": w["cap"]}] if w.get("cap") else []) + ([{"label": "Load rating", "value": w["load"]}] if w.get("load") else []) + ([{"label": "UPC", "value": gtin}] if gtin else [])
    t = T["es-419"]
    add({
        "slug": slugify(f"{w['brand']} {model} {dia}x{wid_s} {w['bolt']} et{et} {w['finish']}"), "category": "wheels", "name": f"{model} {dia}x{wid_s} ET{et} {w['finish']}", "brand": w["brand"],
        **({"gtin": gtin} if gtin else {}), "mpn": w["mpn"], "images": ([w["image"]] + [g for g in (w.get("gallery") or []) if g != w["image"]])[:3],
        "shortDescription": f"{EN[constr_key]} {dia}x{wid_s} ET{et}, {w['bolt']}, {w['finish']}.",
        "description": f"{w['brand']} {model} in {dia}x{wid_s} with ET{et} offset, {w['bolt']} bolt pattern" + (f" and {cb:g} mm center bore" if cb else "") + f". {w.get('material') or 'Aluminum'}, {w.get('structure') or '1-piece'} construction, {w['finish']} finish. Manufacturer part {w['mpn']}." + (f" UPC {gtin}." if gtin else "") + " Price per wheel.",
        "highlights": [f"{dia}x{wid_s} ET{et}", w["bolt"], w["finish"], constr, "Price per wheel"], "specs": specs,
        "offers": {"us": {"priceCents": cents(w["price"]), "availability": "in_stock"}},
        "translations": {"es-419": {
            "shortDescription": t["wheel_short"].format(dia=dia, w=wid_s, et=et, pcd=w["bolt"], finish=w["finish"]),
            "description": t["wheel_desc"].format(brand=w["brand"], model=model, dia=dia, w=wid_s, et=et, pcd=w["bolt"], cb=f"{cb:g}" if cb else "-", finish=w["finish"], constr=t[constr_key] + "."),
            "highlights": [f"{dia}x{wid_s} ET{et}", w["bolt"], w["finish"], t[constr_key], t["per_wheel"]],
        }},
        "wheel": {"diameter": dia, "width": wid, "boltPattern": w["bolt"], "offset": et, "centerBore": cb or 0, "finish": w["finish"], "construction": constr, "approvals": {}},
    })
    n_us_w += 1
print("US wheels", n_us_w)

# ---------------------------------------------------------------- EU wheels
wb = [w for w in json.load(open(R + "wba_wheels_premium.json")) + json.load(open(R + "wba_wheels.json")) if w.get("image") and w.get("priceGbp")]
seen_wba = set()
n_eu_w = 0
for w in wb:
    if w["mpn"] in seen_wba:
        continue
    seen_wba.add(w["mpn"])
    hit = amazon_hit(amz_wheels_eu, w["mpn"])
    gtin = hit["gtin"] if hit else None
    try:
        dia, wid, et = int(float(w["size"])), float(w["width"]), int(float(w["offset"]))
        cb = float(w["bore"])
        load = int(float(w["load"])) if w.get("load") and float(w["load"]) > 0 else None
    except (TypeError, ValueError):
        continue
    pcd = w["pcd1"].split(",")[0].strip()
    if not re.match(r"^\d+x[\d.]+$", pcd):
        continue
    model, finish = w["model"], w["colour"]
    wid_s = f"{wid:g}"
    d = (w.get("description") or "").lower()
    constr_key = "forged" if "forged" in d or "forged" in model.lower() else ("flow" if "flow" in d else "cast")
    constr = {"cast": "Cast", "flow": "Flow-formed", "forged": "Forged"}[constr_key]
    approvals = {"eu": "TÜV"} if (w.get("tuv") or "").strip() else {}
    specs = [
        {"label": "Size", "value": f"{dia}x{wid_s}"}, {"label": "Bolt pattern", "value": pcd}, {"label": "Offset", "value": f"ET{et}"},
        {"label": "Centre bore", "value": f"{cb:g} mm"}, {"label": "Finish", "value": finish}, {"label": "Construction", "value": constr},
    ] + ([{"label": "Load rating", "value": f"{load} kg"}] if load else []) + ([{"label": "Weight", "value": f"{float(w['weight']):g} kg"}] if w.get("weight") and float(w["weight"]) > 0 else []) + ([{"label": "EAN", "value": gtin}] if gtin else [])
    tr = {}
    for lang in EU_LANGS:
        t = T[lang]
        tr[lang] = {
            "shortDescription": t["wheel_short"].format(dia=dia, w=wid_s, et=et, pcd=pcd, finish=finish),
            "description": t["wheel_desc"].format(brand=w["brand"], model=model, dia=dia, w=wid_s, et=et, pcd=pcd, cb=f"{cb:g}", finish=finish, constr=t[constr_key] + "." + (f" EAN {gtin}." if gtin else "")),
            "highlights": [f"{dia}x{wid_s} ET{et}", pcd, finish, t[constr_key]] + ([t["load"].format(kg=load)] if load else []) + ([t["tuv"]] if approvals else []) + [t["per_wheel"]],
        }
    add({
        "slug": slugify(f"{w['brand']} {model} {dia}x{wid_s} {pcd} et{et} {finish}"), "category": "wheels", "name": f"{model} {dia}x{wid_s} ET{et} {finish}", "brand": w["brand"],
        **({"gtin": gtin} if gtin else {}), "mpn": w["mpn"].rstrip("#"), "images": [w["image"]],
        "shortDescription": f"{EN[constr_key]} {dia}x{wid_s} ET{et}, {pcd}, {finish}.",
        "description": f"{w['brand']} {model} in {dia}x{wid_s} with ET{et} offset, {pcd} bolt pattern and {cb:g} mm centre bore. {finish} finish" + (f", {load} kg load rating per wheel" if load else "") + ". " + ("TÜV approved. " if approvals else "") + (f"EAN {gtin}. " if gtin else "") + "Price per wheel.",
        "highlights": [f"{dia}x{wid_s} ET{et}", pcd, finish, constr] + ([f"{load} kg load rating"] if load else []) + (["TÜV approved"] if approvals else []) + ["Price per wheel"],
        "specs": specs,
        "offers": {"eu": {"priceCents": pretty_eur(w["priceGbp"]), "availability": "in_stock"}},
        "translations": tr,
        "wheel": {"diameter": dia, "width": wid, "boltPattern": pcd, "offset": et, "centerBore": cb, "finish": finish, "construction": constr, **({"loadRatingKg": load} if load else {}), "approvals": approvals},
    })
    n_eu_w += 1
print("EU wheels", n_eu_w)

# ---------------------------------------------------------------- US brakes
fi_all = json.load(open(R + "fi_brakes.json"))
by_mpn = collections.OrderedDict()
for f in fi_all:
    if "InStock" not in f["availability"] or not f.get("price"):
        continue
    r = by_mpn.setdefault(f["mpn"], {**f, "vehicles": []})
    if f.get("vehicle") and f["vehicle"] not in r["vehicles"]:
        r["vehicles"].append(f["vehicle"])


def veh_label(slug):
    m = re.match(r"(\d{4})-([a-z]+)-(.+)", slug)
    if not m:
        return slug
    make = {"gmc": "GMC", "bmw": "BMW", "ram": "RAM", "mercedes": "Mercedes-Benz"}.get(m.group(2), m.group(2).title())
    raw = m.group(3).replace("-", " ")
    model = raw.upper() if len(raw) <= 5 else raw.title()
    return f"{m.group(1)} {make} {model}"


def brake_kind(name):
    n = name.lower()
    if "big brake" in n or "bbk" in n or re.search(r"\bw/\s*calipers?\b|\bwith calipers?\b|\bcaliper kit\b", n):
        return "kit"
    if re.search(r"\bcalipers?\b", n):
        return "caliper"
    if "rotor" in n and "pad" in n:
        return "pads-and-discs"
    if "kit" in n:
        return "pads-and-discs"
    if "rotor" in n or "disc" in n:
        return "discs"
    if "hose" in n or "line" in n:
        return "hose"
    if "sensor" in n:
        return "sensor"
    return "pads"


def brake_axle(name):
    n = name.lower()
    if re.search(r"front\s*(&|and|/)\s*rear", n):
        return "front", True
    if "rear" in n:
        return "rear", False
    return "front", False


brand_groups = collections.defaultdict(list)
for r in by_mpn.values():
    brand_groups[r["name"].split()[0]].append(r)
us_brakes = []
for b, rs in brand_groups.items():
    rs.sort(key=lambda r: -len(r["vehicles"]))
    us_brakes += rs[: {"PowerStop": 18, "EBC": 12, "Hawk": 8, "Brembo": 8, "Wilwood": 6, "StopTech": 6}.get(b, 4)]
for r in us_brakes:
    brand = title_brand(r["name"].split()[0])
    kind = brake_kind(r["name"])
    axle, both = brake_axle(r["name"])
    model = re.sub(r"^\S+\s+(Power Stop\s+|Brakes\s+)?", "", r["name"]).strip()
    model = re.sub(r"\s+Kit Number\s+", " ", model)
    model = re.sub(r"\s+(Front|Rear)$", "", model) if re.search(r"\b(Front|Rear)\b.*\s(Front|Rear)$", model) else model
    mpn_slug = re.sub(rf"^{re.escape(brand)}-", "", r["mpn"], flags=re.I)
    fit = [veh_label(v) for v in r["vehicles"]][:12]
    axle_en = EN["front-rear"] if both else EN[axle]
    hit = amazon_hit(amz_brakes_us, r["mpn"])
    gtin = hit["gtin"] if hit else None
    # Prefer the manufacturer's own photos (via Amazon hi-res) over the reseller's watermarked shot.
    images = (hit["images"][:3] if hit and hit.get("images") else [r["image"].replace("/thumb/", "/web/")])
    mpn_real = hit["cleanMpn"] if hit and hit.get("cleanMpn") else r["mpn"]
    t = T["es-419"]
    axle_t = t["front-rear"] if both else t[axle]
    add({
        "slug": slugify(f"{brand} {mpn_slug}"), "category": "brakes", "name": model, "brand": brand,
        **({"gtin": gtin} if gtin else {}), "mpn": mpn_real, "images": images,
        "shortDescription": f"{EN[kind]}, {axle_en.lower()}. Fits {fit[0] if fit else 'listed vehicles'}" + (f" and {len(fit)-1} more" if len(fit) > 1 else "") + ".",
        "description": f"{brand} {model}. {EN[kind]} for the {axle_en.lower()}. Manufacturer part {mpn_real}." + (f" UPC {gtin}." if gtin else "") + f" Verified fitment: {', '.join(fit) if fit else 'see list'}. Confirm your trim, brake package and rotor diameter before ordering.",
        "highlights": [EN[kind], axle_en] + fit[:2] + [f"MPN {mpn_real}"],
        "specs": [{"label": "Type", "value": EN[kind]}, {"label": "Axle", "value": axle_en}, {"label": "MPN", "value": mpn_real}] + ([{"label": "UPC", "value": gtin}] if gtin else []),
        "offers": {"us": {"priceCents": cents(r["price"]), "availability": "in_stock"}},
        "translations": {"es-419": {
            "shortDescription": t["brake_short"].format(kind=t[kind], axle=axle_t.lower(), fit=f"{t['fits']} {fit[0]}" if fit else t["fits"]),
            "description": t["brake_desc"].format(brand=brand, kind=t[kind].lower(), mpn=mpn_real, axle_l=axle_t.lower(), fit=f"{t['fits']}: {', '.join(fit)}" if fit else "", oe=""),
            "highlights": [t[kind], axle_t] + fit[:2] + [f"MPN {mpn_real}"],
        }},
        "brake": {"kind": kind, "axle": axle, "fitment": fit, "approvals": {}},
    })
print("US brakes", len(us_brakes), "with UPC", sum(1 for r in us_brakes if amazon_hit(amz_brakes_us, r["mpn"])))

# ---------------------------------------------------------------- EU brakes
# Axle per part, derived from the OE numbers each part replaces (VAG 1J0/1K0 698 151 =
# front pads, 1J0 615 601 = rear solid disc, etc.).
EU_AXLE = {
    "0 986 494 524": "front", "0 986 494 019": "front", "0 986 424 797": "front", "0 986 494 284": "front", "0 986 424 825": "front",
    "GDB1330": "front", "GDB1515": "front", "DF2805": "rear", "0 986 479 R94": "front", "0 986 479 C81": "front",
    "09.C892.11": "front", "09.A444.11": "front", "DF5083S": "front", "0 986 479 431": "front", "0 986 424 523": "front",
    "0 986 478 875": "front", "09.C896.11": "front", "0 986 494 692": "front", "0 986 479 645": "rear", "0 986 494 736": "rear",
}
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from brake_axle import infer_axle  # noqa: E402

KIND_FROM_NAME = {"Brake Disc": "discs", "Brake Pad Set, disc brake": "pads", "Brake Caliper": "caliper", "Warning Contact, brake pad wear": "sensor", "Brake Drum": "drum", "Brake Shoe Set": "shoes", "Brake Hose": "hose"}
# Balanced shelf per brand: enough depth for front + rear of every part kind without
# drowning the category in 400 near-identical discs.
EU_BRAKE_CAP = {("discs", "front"): 7, ("discs", "rear"): 6, ("pads", "front"): 7, ("pads", "rear"): 6, ("caliper", "front"): 4, ("caliper", "rear"): 4, ("drum", "rear"): 3, ("shoes", "rear"): 3, ("sensor", "front"): 3, ("sensor", "rear"): 2, ("hose", "front"): 2, ("hose", "rear"): 2}

eu_candidates = []
for r in json.load(open(R + "spareto_wide_enriched.json")):
    if "InStock" not in (r.get("availability") or "") or not r.get("price") or not r.get("gtin"):
        continue
    axle, src = infer_axle(r)
    if not axle:
        continue
    eu_candidates.append({**r, "kind": r.get("kind_hint") or KIND_FROM_NAME.get(r["name"], "pads"), "axle": axle, "axle_src": src})
for r in json.load(open(R + "eu_brakes_pick.json")):
    if r["mpn"] in {c["mpn"] for c in eu_candidates}:
        continue
    oe = re.findall(r"original part numbers? (.+?)\.$", r.get("oe_desc") or "")
    oe_list = [x.strip() for x in re.split(r",\s*(?:and\s+)?|\s+and\s+", oe[0])] if oe else []
    test = next((x for x in (r.get("trade") or []) if "90R" in x.replace(" ", "")), None)
    eu_candidates.append({**r, "kind": "discs" if "Disc" in r["name"] else "pads", "axle": EU_AXLE.get(r["mpn"], "front"), "axle_src": "oe-manual", "oe": [o for o in oe_list if o], "test": test})

# Items with a vehicle list and an approval mark first; then shortest OE-verified ones.
eu_candidates.sort(key=lambda r: (0 if r.get("cars") else 1, 0 if r.get("test") else 1, 0 if r["axle_src"] == "fitting-position" else 1, float(r["price"])))
eu_counts = collections.Counter()
sp = []
for r in eu_candidates:
    k = (title_brand(r["brand"]), r["kind"], r["axle"])
    if eu_counts[k] >= EU_BRAKE_CAP.get((r["kind"], r["axle"]), 2):
        continue
    eu_counts[k] += 1
    sp.append(r)
print("EU brake candidates", len(eu_candidates), "selected", len(sp), collections.Counter((r["kind"], r["axle"]) for r in sp))

n_eu_b = 0
for r in sp:
    kind, axle = r["kind"], r["axle"]
    brand = title_brand(r["brand"])
    props = dict(r.get("props") or [])
    cars = r.get("cars")
    oe_list = [o for o in (r.get("oe") or []) if o][:6]
    car = cars.replace(", and ", " / ").replace(" and ", " / ").replace(", ", " / ").title().replace("Vw", "VW").replace("Bmw", "BMW").replace("Ds", "DS") if cars else None
    fit = ([car] if car else []) + (["OE " + ", ".join(oe_list)] if oe_list else [])
    test = props.get("Test Mark") or r.get("test")
    approvals = {"eu": test} if test else ({"eu": "ECE R90"} if kind in ("pads", "shoes") else {})
    od = props.get("Outer Diameter") or dict(r.get("specs") or []).get("Outer Diameter")
    dd = int(float(od)) if od and re.match(r"^[\d.]+$", str(od)) else None
    disc_type = (props.get("Brake Disc Type") or "").lower()
    vented = "vent" in disc_type
    specs = [{"label": "Type", "value": EN[kind]}, {"label": "Axle", "value": EN[axle]}, {"label": "MPN", "value": r["mpn"]}, {"label": "EAN", "value": r["gtin"]}]
    for k, lab in [("WVA Number", "WVA"), ("Material", "Material"), ("Wear Warning Contact", "Wear indicator"), ("Height", "Height (mm)"), ("Width", "Width (mm)"), ("Thickness", "Thickness (mm)"), ("Brake Disc Type", "Disc type"), ("Outer Diameter", "Diameter (mm)"), ("Brake Disc Thickness", "Disc thickness (mm)"), ("Number of Holes", "Holes"), ("Centering Diameter", "Centre bore (mm)"), ("Brake Caliper Type", "Caliper type"), ("Piston Diameter", "Piston diameter"), ("Brake System", "Brake system"), ("Inner diameter", "Inner diameter (mm)"), ("Drum diameter", "Drum diameter (mm)"), ("Length", "Length (mm)"), ("Thread Size 1", "Thread 1"), ("Thread Size 2", "Thread 2"), ("Number of wear indicators", "Wear indicators"), ("Fitting Position", "Fitting position")]:
        if props.get(k):
            specs.append({"label": lab, "value": props[k]})
    if test:
        specs.append({"label": "Approval", "value": test})
    sensor = "integrated" in (props.get("Wear Warning Contact") or "")
    highlights = [EN[kind], EN[axle]] + ([f"Ø{dd} mm, {'vented' if vented else 'solid'}"] if dd else ([disc_type] if disc_type else [])) + [f"EAN {r['gtin']}"] + (["ECE R90 approved"] if approvals else []) + (["Wear sensor"] if sensor else [])
    tr = {}
    for lang in EU_LANGS:
        t = T[lang]
        # German capitalises nouns; the other languages read better in lowercase mid-sentence.
        lc = (lambda s: s) if lang == "de" else (lambda s: s.lower())
        fit_t = f"{t['fits']} {car}" if car else ""
        tr[lang] = {
            "name": f"{t[kind]} {r['mpn']} — {lc(t[axle])}",
            "shortDescription": f"{t[kind]}, {lc(t[axle])}." + (f" {fit_t}." if fit_t else ""),
            "description": t["brake_desc"].format(brand=brand, kind=lc(t[kind]), mpn=r["mpn"], axle_l=lc(t[axle]), fit=fit_t, oe=f" {t['oe']} {', '.join(oe_list)}." if oe_list else "").replace(" .", ".").replace("..", "."),
            "highlights": [t[kind], t[axle]] + ([f"Ø{dd} mm, {t['vented'] if vented else t['solid']}"] if dd else []) + [f"EAN {r['gtin']}"] + ([t["ece"]] if approvals else []) + ([t["sensor"]] if sensor else []),
        }
    add({
        "slug": slugify(f"{brand} {r['mpn']}"), "category": "brakes", "name": f"{EN[kind]} {r['mpn']} — {EN[axle].lower()}", "brand": brand,
        "gtin": r["gtin"], "mpn": r["mpn"], "images": (r.get("images") or [r["image"]])[:3],
        "shortDescription": f"{EN[kind]}, {EN[axle].lower()}." + (f" Fits {car}." if car else (f" Replaces OE {oe_list[0]}." if oe_list else "")),
        "description": f"{brand} {EN[kind].lower()} {r['mpn']} for the {EN[axle].lower()}." + (f" Fits {car}." if car else "") + (f" Replaces OE numbers {', '.join(oe_list)}." if oe_list else "") + f" EAN {r['gtin']}." + (f" {test}." if test else "") + " Confirm the application to your vehicle before ordering — brake parts are axle- and model-specific.",
        "highlights": highlights, "specs": specs,
        "offers": {"eu": {"priceCents": cents(r["price"]), "availability": "in_stock"}},
        "translations": tr,
        "brake": {"kind": kind, "axle": axle, "fitment": fit, **({"discDiameterMm": dd} if dd else {}), "approvals": approvals},
    })
    n_eu_b += 1
print("EU brakes", n_eu_b, collections.Counter(title_brand(r["brand"]) for r in sp))

json.dump(out, open(R + "catalog_build.json", "w"), ensure_ascii=False)
print("TOTAL", len(out), collections.Counter((p["category"], tuple(p["offers"].keys())) for p in out))
print("images", sum(len(p["images"]) for p in out))
