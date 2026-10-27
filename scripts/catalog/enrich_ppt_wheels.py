import urllib.request, ssl, re, json, html, concurrent.futures as cf

ctx = ssl.create_default_context()
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0", "Accept": "text/html"}
pp = json.load(open("/vercel/share/v0-project/.v0/refs/ppt_wheels_premium.json"))


def text_of(u):
    p = urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60, context=ctx).read().decode("utf-8", "ignore")
    p = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", p, flags=re.S)
    imgs = list(dict.fromkeys(re.findall(r'https://www\.performanceplustire\.com/images/[^"\'\s]+?\.(?:jpg|png)', p)))
    t = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", p)))
    return t, imgs


def grab(t, label, pat=r"([^ ]+(?: [^ ]+){0,3}?)"):
    m = re.search(re.escape(label) + r"\s+" + pat + r"(?=\s+(?:Bolt|Backspace|Hub|Center|Offset|Description|Structure|Material|Finish|Weight|Load|Size|$))", t)
    return m.group(1).strip() if m else None


def enrich(w):
    try:
        t, imgs = text_of(w["url"])
    except Exception as e:
        w["err"] = str(e)[:40]
        return w
    m = re.search(r"Hub Bore\s+([\d.]+) inch or ([\d.]+) mm", t)
    w["cb"] = m.group(2) if m else w.get("cb")
    m = re.search(r"Material\s+([A-Za-z ]+?)\s+Structure", t)
    w["material"] = m.group(1).strip() if m else None
    m = re.search(r"Structure\s+([0-9]-Piece|Monoblock|Forged|Flow Formed|Rotary Forged)", t)
    w["structure"] = m.group(1) if m else None
    m = re.search(r"Load Rating\s+([\d,]+)\s*(lbs|kg)", t, re.I)
    w["load"] = (m.group(1).replace(",", ""), m.group(2).lower()) if m else None
    m = re.search(r"Weight\s+([\d.]+)\s*(lbs|kg)", t, re.I)
    w["weight"] = (m.group(1), m.group(2).lower()) if m else None
    m = re.search(r"Backspace\s+([\d.]+) inch", t)
    w["backspace_in"] = m.group(1) if m else None
    m = re.search(r"Center Cap\s+(Included|Not Included|Sold Separately)", t, re.I)
    w["cap"] = m.group(1) if m else None
    m = re.search(r"Description\s+(.{80,900}?)\s+(?:About - |FAQ|Warranty|Reviews|Related|Specifications)", t)
    w["blurb"] = m.group(1).strip() if m else None
    w["gallery"] = [i for i in imgs if re.search(r"_\d{4}\.(jpg|png)$", i)][:4]
    return w


with cf.ThreadPoolExecutor(6) as ex:
    out = list(ex.map(enrich, pp))
json.dump(out, open("/vercel/share/v0-project/.v0/refs/ppt_wheels_premium.json", "w"), ensure_ascii=False)
print("cb", sum(1 for w in out if w.get("cb")), "material", sum(1 for w in out if w.get("material")), "structure", sum(1 for w in out if w.get("structure")), "load", sum(1 for w in out if w.get("load")), "blurb", sum(1 for w in out if w.get("blurb")), "gallery>1", sum(1 for w in out if len(w.get("gallery", [])) > 1), "err", sum(1 for w in out if w.get("err")))
for w in out[:4]:
    print(w["name"], w.get("cb"), w.get("material"), w.get("structure"), w.get("load"), w.get("weight"), w.get("cap"), (w.get("blurb") or "")[:100], w.get("gallery"))
