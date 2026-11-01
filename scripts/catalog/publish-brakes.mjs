import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { put } from "@vercel/blob"
import pg from "pg"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../..")
const BRAKES_PATH = resolve(ROOT, ".v0/refs/brakes_raw/brakes_catalog_270.json")
const BLOB_MAP_PATH = resolve(ROOT, ".v0/refs/brakes_raw/blob_map.json")
const OPENING_CATALOG_PATH = resolve(ROOT, "lib/catalog/opening-catalog.json")

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async function fetchImageBuffer(url) {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 20)
  const localCache = `/tmp/ops_cache/${hash}.bin`
  if (existsSync(localCache)) {
    const buf = readFileSync(localCache)
    if (buf.length >= 1500) {
      return { buf, contentType: url.endsWith(".png") ? "image/png" : "image/jpeg" }
    }
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, accept: "image/*,*/*;q=0.8" },
        signal: AbortSignal.timeout(25000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ct = res.headers.get("content-type") || "image/jpeg"
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1500) throw new Error(`Too small (${buf.length}B)`)
      return { buf, contentType: ct.split(";")[0].trim() }
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 400 * attempt))
    }
  }
}

function extFrom(url, contentType) {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("webp")) return "webp"
  const m = url.split("?")[0].match(/\.(jpe?g|png|webp)$/i)
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg"
}

async function main() {
  const brakes = JSON.parse(readFileSync(BRAKES_PATH, "utf8"))
  const blobMap = existsSync(BLOB_MAP_PATH)
    ? JSON.parse(readFileSync(BLOB_MAP_PATH, "utf8"))
    : {}

  const uniqueUrls = [...new Set(brakes.flatMap((p) => p.images))]
  console.log(`Total brake products: ${brakes.length}, unique image URLs: ${uniqueUrls.length}`)

  const todoUrls = uniqueUrls.filter((u) => !blobMap[u])
  console.log(`Uploading ${todoUrls.length} new images to Vercel Blob (${uniqueUrls.length - todoUrls.length} cached)...`)

  let idx = 0
  let uploaded = 0
  let failed = 0

  async function worker() {
    while (idx < todoUrls.length) {
      const srcUrl = todoUrls[idx++]
      try {
        const { buf, contentType } = await fetchImageBuffer(srcUrl)
        const ext = extFrom(srcUrl, contentType)
        const hash = createHash("sha1").update(srcUrl).digest("hex").slice(0, 20)
        const blob = await put(`products/brakes/${hash}.${ext}`, buf, {
          access: "public",
          contentType,
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        blobMap[srcUrl] = blob.url
        uploaded++
        if (uploaded % 25 === 0) {
          writeFileSync(BLOB_MAP_PATH, JSON.stringify(blobMap, null, 2))
          console.log(`  uploaded ${uploaded}/${todoUrls.length}`)
        }
      } catch (err) {
        failed++
        console.warn(`  [warn] failed ${srcUrl}: ${err.message}`)
      }
    }
  }

  await Promise.all(Array.from({ length: 12 }, () => worker()))
  writeFileSync(BLOB_MAP_PATH, JSON.stringify(blobMap, null, 2))
  console.log(`Blob upload complete: ${uploaded} uploaded, ${failed} failed`)

  // Map images strictly to verified Blob URLs and require >= 2 images per product
  const verifiedBrakes = []
  for (const p of brakes) {
    const mapped = p.images.map((u) => blobMap[u]).filter(Boolean)
    const uniq = [...new Set(mapped)]
    if (uniq.length >= 2) {
      p.images = uniq
      verifiedBrakes.push(p)
    } else {
      console.warn(`  [skip] ${p.slug} had only ${uniq.length} verified Blob images`)
    }
  }
  console.log(`Verified brakes with >=2 clean images: ${verifiedBrakes.length}`)

  // Update lib/catalog/opening-catalog.json (keep non-brakes + append verifiedBrakes)
  const existingCatalog = JSON.parse(readFileSync(OPENING_CATALOG_PATH, "utf8"))
  const nonBrakes = existingCatalog.filter((p) => p.category !== "brakes")
  const nextCatalog = [...nonBrakes, ...verifiedBrakes]
  writeFileSync(OPENING_CATALOG_PATH, `${JSON.stringify(nextCatalog, null, 2)}\n`)
  console.log(`Updated opening-catalog.json: ${nonBrakes.length} existing + ${verifiedBrakes.length} brakes = ${nextCatalog.length} total`)

  // Upsert into Postgres products table without touching existing tires/wheels
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  const connectionString = rawUrl.replace(
    /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  )
  const pool = new pg.Pool({ connectionString, max: 4 })
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query("DELETE FROM products WHERE category = 'brakes'")
    for (const p of verifiedBrakes) {
      await client.query(
        `INSERT INTO products (id, slug, category, archived, data, created_at, updated_at)
         VALUES ($1, $2, $3, false, $4::jsonb, now(), now())
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           category = EXCLUDED.category,
           archived = false,
           data = EXCLUDED.data,
           updated_at = now()`,
        [p.id, p.slug, p.category, JSON.stringify(p)],
      )
    }
    await client.query("COMMIT")
    const summary = await client.query(
      "SELECT category, count(*)::int as count FROM products WHERE archived = false GROUP BY category ORDER BY category",
    )
    console.log("Live DB active products by category:", summary.rows)
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
