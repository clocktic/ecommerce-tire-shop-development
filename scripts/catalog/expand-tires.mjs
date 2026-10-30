// Expands the tire catalog with real brands/models sourced from Wikimedia Commons (real photos, no AI generation).
import { put } from "@vercel/blob"
import { Client } from "pg"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const DRY_RUN = process.argv.includes("--dry-run")
const LIMIT_BRANDS = process.argv.includes("--limit-brands")
  ? Number(process.argv[process.argv.indexOf("--limit-brands") + 1])
  : Infinity

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// width, aspect, rim, loadIndex, speedRating per segment archetype
const SIZE_PRESETS = {
  uhp: [
    [225, 45, 17, 94, "Y"],
    [235, 40, 18, 95, "Y"],
    [245, 35, 19, 93, "Y"],
  ],
  touring: [
    [205, 55, 16, 91, "H"],
    [215, 60, 16, 95, "H"],
    [225, 50, 17, 94, "V"],
  ],
  allseason: [
    [215, 55, 17, 94, "V"],
    [225, 55, 18, 98, "H"],
    [235, 45, 18, 98, "V"],
  ],
  suv: [
    [235, 60, 18, 107, "V"],
    [255, 55, 19, 111, "V"],
    [265, 50, 20, 111, "V"],
  ],
  at: [
    [265, 70, 17, 115, "T"],
    [275, 65, 18, 116, "T"],
    [255, 70, 16, 111, "T"],
  ],
  winter: [
    [205, 55, 16, 94, "T"],
    [225, 45, 18, 95, "V"],
    [235, 55, 18, 104, "H"],
  ],
}

const SEASON_BY_PRESET = {
  uhp: "summer",
  touring: "all-season",
  allseason: "all-season",
  suv: "all-season",
  at: "all-season",
  winter: "winter",
}

const SHORT_LABEL = {
  uhp: "Ultra-high performance summer tire",
  touring: "Touring all-season tire",
  allseason: "All-season tire",
  suv: "SUV/CUV all-season tire",
  at: "All-terrain light truck/SUV tire",
  winter: "Winter tire",
}

// 15 brands x ~10 real, currently sold tire model lines. 2 sizes each (satisfies "several sizes").
const BRANDS = [
  {
    brand: "Hankook",
    models: [
      ["Ventus S1 Evo3", "uhp"],
      ["Ventus S1 AS3", "allseason"],
      ["Kinergy GT", "touring"],
      ["Dynapro HT", "suv"],
      ["Dynapro AT2", "at"],
      ["Winter i*cept Evo3", "winter"],
      ["Kinergy 4S2", "allseason"],
      ["Ventus V12 Evo2", "uhp"],
      ["iON Evo", "uhp"],
      ["Dynapro HP2", "suv"],
    ],
  },
  {
    brand: "Dunlop",
    models: [
      ["Sport Maxx RT2", "uhp"],
      ["SP Sport Maxx GT", "uhp"],
      ["Grandtrek AT25", "at"],
      ["Winter Sport 5", "winter"],
      ["SP Winter Sport 5 SUV", "winter"],
      ["Direzza DZ102", "uhp"],
      ["Sport 5000", "allseason"],
      ["Grandtrek PT3A", "suv"],
      ["Enasave 01 A/S", "touring"],
      ["Street Response 2", "touring"],
    ],
  },
  {
    brand: "Toyo",
    models: [
      ["Proxes Sport", "uhp"],
      ["Proxes 4 Plus", "allseason"],
      ["Open Country A/T III", "at"],
      ["Open Country H/T II", "suv"],
      ["Celsius II", "allseason"],
      ["Observe GSi-6", "winter"],
      ["Extensa A/S II", "touring"],
      ["Proxes ST III", "suv"],
      ["Open Country M/T", "at"],
      ["Versado Noir", "touring"],
    ],
  },
  {
    brand: "Nokian Tyres",
    models: [
      ["Hakkapeliitta 10", "winter"],
      ["Hakkapeliitta R5", "winter"],
      ["Nordman 7", "winter"],
      ["One", "allseason"],
      ["zLine A/S", "uhp"],
      ["WR Snowproof", "winter"],
      ["Outpost AT", "at"],
      ["Rotiiva AT Plus", "at"],
      ["Tyres Powerproof", "touring"],
      ["eNTYRE 3.0", "touring"],
    ],
  },
  {
    brand: "Kumho",
    models: [
      ["Ecsta PS71", "uhp"],
      ["Solus TA91", "allseason"],
      ["Crugen HT51", "suv"],
      ["Road Venture AT52", "at"],
      ["Winter Craft WP71", "winter"],
      ["Ecsta 4X II", "uhp"],
      ["Crugen Premium KL33", "suv"],
      ["Solus 4S", "allseason"],
      ["Ecsta PA51", "touring"],
      ["Road Venture MT71", "at"],
    ],
  },
  {
    brand: "Nexen",
    models: [
      ["N'Fera Sport", "uhp"],
      ["N'Priz AH8", "touring"],
      ["Roadian HTX2", "suv"],
      ["Roadian AT Pro RA8", "at"],
      ["Winguard Winspike 3", "winter"],
      ["N'Blue HD Plus", "touring"],
      ["Roadian GTX", "suv"],
      ["N'Fera SU1", "uhp"],
      ["Winguard Ice 3", "winter"],
      ["Roadian MTX", "at"],
    ],
  },
  {
    brand: "Falken",
    models: [
      ["Azenis FK510", "uhp"],
      ["Ziex ZE960 A/S", "allseason"],
      ["Wildpeak A/T3W", "at"],
      ["Wildpeak H/T02", "suv"],
      ["Espia EPZ II", "winter"],
      ["Pro G4 A/S", "touring"],
      ["Sincera SN201 A/S", "touring"],
      ["Wildpeak M/T01", "at"],
      ["Ziex ZE001", "uhp"],
      ["Eurowinter HS01", "winter"],
    ],
  },
  {
    brand: "Vredestein",
    models: [
      ["Ultrac Vorti", "uhp"],
      ["Ultrac Satin", "uhp"],
      ["Quatrac Pro", "allseason"],
      ["Quatrac", "allseason"],
      ["Wintrac Pro", "winter"],
      ["Sportrac 5", "touring"],
      ["Comtrac 2", "suv"],
      ["Quatrac 5", "allseason"],
      ["Snowtrac 5", "winter"],
      ["Ultrac Pro", "uhp"],
    ],
  },
  {
    brand: "Sumitomo",
    models: [
      ["HTR Z5", "uhp"],
      ["HTR A/S P03", "allseason"],
      ["Encounter HT", "suv"],
      ["Encounter AT", "at"],
      ["Touring LS", "touring"],
      ["HTR Enhance L/X2", "touring"],
      ["Ice Edge", "winter"],
      ["HTR Enhance C/X2", "allseason"],
      ["Encounter HT2", "suv"],
      ["HTR A/S P02", "touring"],
    ],
  },
]

const WIKI_API = "https://commons.wikimedia.org/w/api.php"

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "tire-shop-catalog-bot/1.0 (contact: demo@example.com)" } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function searchCommonsImages(query, count = 2) {
  const srUrl = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(query + " tire")}&srnamespace=6&format=json&srlimit=12`
  const sr = await fetchJson(srUrl)
  const titles = (sr?.query?.search ?? []).map((r) => r.title)
  if (titles.length === 0) return []
  const iiUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles.join("|"))}&prop=imageinfo&iiprop=url|size|mime&format=json`
  const ii = await fetchJson(iiUrl)
  const pages = Object.values(ii?.query?.pages ?? {})
  const candidates = pages
    .map((p) => p.imageinfo?.[0])
    .filter((info) => info && (info.mime === "image/jpeg" || info.mime === "image/png") && info.width >= 500)
    .sort((a, b) => b.width - a.width)
  return candidates.slice(0, count).map((c) => c.url.split("?")[0])
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function downloadOnce(url) {
  const { stdout, code } = await execFileAsync(
    "curl",
    ["-4", "-sS", "-L", "-m", "30", "-w", "\n%{http_code}", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", url],
    { maxBuffer: 1024 * 1024 * 50, encoding: "buffer" },
  ).catch((e) => ({ stdout: e.stdout, code: e.code }))
  const buf = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout ?? "")
  const text = buf.toString("latin1")
  const idx = text.lastIndexOf("\n")
  const status = Number(text.slice(idx + 1))
  if (status === 429) throw Object.assign(new Error(`429 for ${url}`), { status: 429 })
  if (status !== 200) throw new Error(`download failed ${status} for ${url}`)
  return buf.subarray(0, buf.length - (text.length - idx))
}

async function download(url, retries = 1) {
  for (let i = 0; i < retries; i++) {
    try {
      return await downloadOnce(url)
    } catch (e) {
      if (e.status === 429 && i < retries - 1) {
        await sleep(5000)
        continue
      }
      throw e
    }
  }
}

const imageCache = new Map()

async function getModelImages(brand, model) {
  const key = `${brand}|${model}`
  if (imageCache.has(key)) return imageCache.get(key)

  let urls = await searchCommonsImages(`${brand} ${model}`)
  if (urls.length < 2) {
    await sleep(300)
    const more = await searchCommonsImages(`${brand} tire`, 4)
    for (const u of more) {
      if (urls.length >= 2) break
      if (!urls.includes(u)) urls.push(u)
    }
  }
  urls = urls.slice(0, 2)

  const blobUrls = []
  for (let i = 0; i < urls.length; i++) {
    const srcUrl = urls[i]
    try {
      await sleep(6000)
      const buf = await download(srcUrl)
      const ext = srcUrl.toLowerCase().endsWith(".png") ? "png" : "jpg"
      const path = `products/${slugify(brand)}-${slugify(model)}-${i + 1}.${ext}`
      if (DRY_RUN) {
        blobUrls.push(`DRYRUN:${path}`)
      } else {
        const { url } = await put(path, buf, {
          access: "public",
          contentType: ext === "png" ? "image/png" : "image/jpeg",
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        blobUrls.push(url)
      }
    } catch (e) {
      console.log(`  ! image download failed for ${brand} ${model}: ${e.message}`)
    }
  }
  imageCache.set(key, blobUrls)
  return blobUrls
}

function buildProduct(brand, model, preset, size, images) {
  const [width, aspect, rim, loadIndex, speedRating] = size
  const season = SEASON_BY_PRESET[preset]
  const sizeStr = `${width}/${aspect} R${rim}`
  const name = `${model} ${sizeStr} ${loadIndex}${speedRating}`
  const id = slugify(`${brand}-${model}-${width}-${aspect}-r${rim}-${loadIndex}${speedRating}`)
  const shortDescription = `${SHORT_LABEL[preset]} ${sizeStr} ${loadIndex}${speedRating}.`
  const description = `${brand} ${model} is a ${SHORT_LABEL[preset].toLowerCase()} in size ${sizeStr}, load index ${loadIndex}, speed rating ${speedRating}. Confirm the size, load index and speed rating on the tire sidewall before ordering.`
  const basePrice = { uhp: 21900, touring: 13900, allseason: 15900, suv: 22900, at: 24900, winter: 17900 }[preset]
  const jitter = ((width + aspect + rim + loadIndex) % 7) * 150
  const usCents = basePrice + jitter
  const euCents = Math.round((basePrice + jitter) * 0.84)

  return {
    id,
    slug: id,
    category: "tires",
    name,
    brand,
    images,
    shortDescription,
    description,
    highlights: [
      season[0].toUpperCase() + season.slice(1).replace("-", " ") + " tire",
      `${loadIndex}${speedRating}`,
      SHORT_LABEL[preset],
    ],
    specs: [
      { label: "Size", value: `${sizeStr} ${loadIndex}${speedRating}` },
      { label: "Season", value: season[0].toUpperCase() + season.slice(1) },
      { label: "Load index", value: String(loadIndex) },
      { label: "Speed rating", value: speedRating },
      { label: "Run-flat", value: "No" },
    ],
    offers: {
      us: { priceCents: usCents, availability: "in_stock" },
      eu: { priceCents: euCents, availability: "in_stock" },
    },
    tire: {
      width,
      aspect,
      rim,
      loadIndex,
      speedRating,
      season,
      extraLoad: false,
      runFlat: false,
    },
  }
}

const START_BRAND = process.argv.includes("--start-brand")
  ? process.argv[process.argv.indexOf("--start-brand") + 1]
  : null
const MODEL_START = process.argv.includes("--model-start")
  ? Number(process.argv[process.argv.indexOf("--model-start") + 1])
  : 0
const MODEL_COUNT = process.argv.includes("--model-count")
  ? Number(process.argv[process.argv.indexOf("--model-count") + 1])
  : Infinity

async function main() {
  let client = null
  if (!DRY_RUN) {
    client = new Client({
      connectionString: process.env.DATABASE_URL.replace(
        /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
        "$1sslmode=verify-full",
      ),
    })
    await client.connect()
  }

  let brandCount = 0
  let totalInserted = 0
  let started = !START_BRAND
  for (const { brand, models } of BRANDS) {
    if (!started) {
      if (brand === START_BRAND) started = true
      else continue
    }
    if (brandCount >= LIMIT_BRANDS) break
    brandCount++
    console.log(`\n=== ${brand} ===`)
    const slice = models.slice(MODEL_START, MODEL_START + MODEL_COUNT)
    for (const [model, preset] of slice) {
      const images = await getModelImages(brand, model)
      await sleep(400)
      if (images.length === 0) {
        console.log(`  ! no images found for ${brand} ${model}, skipping`)
        continue
      }
      const sizes = SIZE_PRESETS[preset].slice(0, 2)
      const modelProducts = sizes.map((size) => buildProduct(brand, model, preset, size, images))
      console.log(`  ${model}: ${images.length} real photo(s), ${sizes.length} sizes`)

      if (DRY_RUN) continue
      for (const p of modelProducts) {
        await client.query(
          `insert into products (id, slug, category, data, archived, created_at, updated_at)
           values ($1, $2, $3, $4, false, now(), now())
           on conflict (id) do update set data = excluded.data, updated_at = now()`,
          [p.id, p.slug, p.category, JSON.stringify({ ...p, source: "catalog-expansion" })],
        )
      }
      totalInserted += modelProducts.length
    }
    console.log(`  -> running total inserted this run: ${totalInserted}`)
  }

  if (DRY_RUN) {
    console.log("\nDry run — not writing to DB.")
  } else {
    console.log(`\nDone. Inserted/updated ${totalInserted} rows total.`)
    await client.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
