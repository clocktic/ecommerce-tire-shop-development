import { COMPANY } from "@/lib/company"
import { escapeFeedXml as esc } from "@/lib/feeds/us-feed-format"
import type { Top500Feed } from "@/lib/feeds/us-top500"

// A human-readable view of the US Top-N feed for reviewing the selection before
// (re)submitting it to Merchant Center. Served with noindex; GMC never reads it.
export function renderTop500Preview(feed: Top500Feed, files: { xml: string; txt: string; lang?: string }): string {
  const { items } = feed
  const lang = files.lang ?? "en"
  const count = (fn: (i: (typeof items)[number]) => boolean) => items.filter(fn).length
  const stats = [
    ["Items", items.length],
    ["Tires", count((i) => i.product.category === "tires")],
    ["Wheels", count((i) => i.product.category === "wheels")],
    ["Brakes", count((i) => i.product.category === "brakes")],
    ["Brands", new Set(items.map((i) => i.product.brand)).size],
    ["With GTIN", count((i) => Boolean(i.product.gtin))],
  ] as const

  const isCumulative = feed.mode === "cumulative"
  const batch = feed.batch ?? (items.length === 500 ? 2 : 3)
  const batches = [
    { b: 0, label: "Master (Cumulative)", href: `/feeds/google-us-${esc(lang)}-master.html` },
    { b: 2, label: "Batch 2 · 500", href: `/feeds/google-us-${esc(lang)}-top500.html` },
    { b: 3, label: "Batch 3 · +600", href: `/feeds/google-us-${esc(lang)}-top600.html` },
    { b: 4, label: "Batch 4 · +600 (+Commercial)", href: `/feeds/google-us-${esc(lang)}-batch4-600.html` },
    { b: 5, label: "Batch 5 · +600", href: `/feeds/google-us-${esc(lang)}-batch5-600.html` },
    { b: 6, label: "Batch 6 · +600", href: `/feeds/google-us-${esc(lang)}-batch6-600.html` },
  ]
  const stepLinks = batches
    .map((entry) => {
      const active = isCumulative ? entry.b === 0 : entry.b === batch
      return `<a class="${active ? "" : "alt"}" href="${entry.href}">${entry.label}</a>`
    })
    .join("")
  const heading = isCumulative
    ? `US Master Cumulative · ${items.length} Products (Single GMC Source)`
    : batch <= 2
      ? `US Top ${items.length} (Batch 2)`
      : `US Batch ${batch} · +${items.length} New Products (0% Overlap)`

  const rows = items
    .map((item, index) => {
      const f = item.flat
      const tier = item.entry.tier
      return `<tr data-cat="${f.custom_label_0}" data-q="${esc(`${f.title} ${f.brand} ${f.gtin} ${f.mpn} ${f.id}`.toLowerCase())}">
<td class="n">${index + 1}</td>
<td><img src="${esc(item.image)}" alt="" loading="lazy" width="56" height="56"></td>
<td><a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.title)}</a><div class="sub">${esc(f.product_type)}</div></td>
<td class="price">$${esc(item.price.replace(" USD", ""))}</td>
<td><span class="pill ${f.availability}">${esc(f.availability.replace("_", " "))}</span></td>
<td class="mono">${esc(f.gtin || "—")}<div class="sub">${esc(f.mpn || "")}</div></td>
<td><span class="pill tier-${tier}">${tier}</span><div class="sub nowrap">${esc(f.custom_label_1)} · ${esc(f.custom_label_2)}</div></td>
<td class="n">${Math.round(item.entry.score)}</td>
</tr>`
    })
    .join("\n")

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(COMPANY.tradingName)} · ${esc(heading)} feed</title>
<style>
:root{--bg:#0b0d10;--card:#13171c;--line:#232a33;--fg:#e7ecf2;--mut:#8b96a5;--acc:#f5b301;--ok:#3ecf8e;--warn:#f0a030}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
header{padding:28px 24px 8px;max-width:1280px;margin:0 auto}h1{margin:0 0 4px;font-size:22px}p{margin:0;color:var(--mut)}
.files{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center}.files a{color:var(--bg);background:var(--acc);padding:7px 12px;border-radius:8px;font-weight:600;text-decoration:none}
.files a.alt{background:transparent;color:var(--fg);border:1px solid var(--line)}
.files .sep{width:1px;height:22px;background:var(--line);margin:0 4px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;max-width:1280px;margin:18px auto;padding:0 24px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}.stat b{display:block;font-size:22px}.stat span{color:var(--mut);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.bar{display:flex;gap:8px;flex-wrap:wrap;max-width:1280px;margin:0 auto 12px;padding:0 24px}
.bar input{flex:1;min-width:220px;background:var(--card);border:1px solid var(--line);color:var(--fg);padding:9px 12px;border-radius:8px}
.bar button{background:var(--card);border:1px solid var(--line);color:var(--fg);padding:9px 14px;border-radius:8px;cursor:pointer}.bar button[aria-pressed=true]{border-color:var(--acc);color:var(--acc)}
.wrap{max-width:1280px;margin:0 auto 40px;padding:0 24px;overflow-x:auto}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}th{font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em;position:sticky;top:0;background:var(--card)}
td img{border-radius:8px;background:#fff;object-fit:contain;display:block}td a{color:var(--fg);text-decoration:none;font-weight:600}td a:hover{color:var(--acc)}
.sub{color:var(--mut);font-size:12px;margin-top:2px}.nowrap{white-space:nowrap}.n{color:var(--mut);text-align:right}.price{font-weight:700;white-space:nowrap}.mono{font-family:ui-monospace,Menlo,monospace;font-size:12px}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid var(--line);white-space:nowrap}
.in_stock{color:var(--ok)}.preorder,.out_of_stock{color:var(--warn)}.tier-pinned{color:var(--bg);background:var(--acc);border-color:var(--acc)}.tier-bestseller{color:var(--acc)}
</style>
</head>
<body>
<header>
<h1>${esc(heading)} · Google Merchant Center feed</h1>
<p>Generated ${esc(feed.generatedAt)} · 100% unique SKUs excluding all earlier GMC batches · ranked by US bestseller lines, top replacement sizes, seasonal demand, store orders and reviews.</p>
<div class="files"><a href="${esc(files.xml)}">Download XML (${items.length})</a><a class="alt" href="${esc(files.txt)}">Download TXT (${items.length})</a><span class="sep" aria-hidden="true"></span>${stepLinks}</div>
</header>
<section class="stats" aria-label="Feed summary">${stats.map(([label, value]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`).join("")}</section>
<div class="bar">
<input id="q" type="search" aria-label="Search the feed" placeholder="Search title, brand, GTIN, MPN…">
${["all", "tires", "wheels", "brakes"].map((c) => `<button type="button" data-filter="${c}" aria-pressed="${c === "all"}">${c[0].toUpperCase()}${c.slice(1)}</button>`).join("")}
</div>
<div class="wrap">
<table>
<thead><tr><th>#</th><th aria-label="Image"></th><th>Title</th><th>Price</th><th>Availability</th><th>GTIN / MPN</th><th>Tier · labels</th><th>Score</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
<script>
const q=document.getElementById("q"),rows=[...document.querySelectorAll("tbody tr")],btns=[...document.querySelectorAll("[data-filter]")];let cat="all";
function apply(){const t=q.value.trim().toLowerCase();for(const r of rows){r.hidden=!((cat==="all"||r.dataset.cat===cat)&&(!t||r.dataset.q.includes(t)))}}
q.addEventListener("input",apply);for(const b of btns)b.addEventListener("click",()=>{cat=b.dataset.filter;btns.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));apply()});
</script>
</body>
</html>
`
}
