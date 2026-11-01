import fs from "node:fs"
import path from "node:path"
import pg from "pg"
import { put } from "@vercel/blob"

const CATALOG_PATH = "lib/catalog/opening-catalog.json"
const MANIFEST_PATH = "/tmp/wheel-galleries/manifest.json"
const BLOB_DIR = "/tmp/wheel-galleries/blobs"
const CONCURRENCY = 16

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN missing")
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing")
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
const blobFiles = fs.readdirSync(BLOB_DIR).filter((f) => f.endsWith(".jpg"))
console.log(`Uploading ${blobFiles.length} unique wheel gallery images to Vercel Blob...`)

const uploadedMap = new Map()
const uploadQueue = [...blobFiles]
let uploadedCount = 0

async function uploadWorker() {
  while (uploadQueue.length) {
    const fn = uploadQueue.shift()
    if (!fn) break
    const filePath = path.join(BLOB_DIR, fn)
    const buf = fs.readFileSync(filePath)
    const key = `products/v2-${fn}`
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const blob = await put(key, buf, {
          access: "public",
          contentType: "image/jpeg",
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        uploadedMap.set(fn, blob.url)
        uploadedCount++
        if (uploadedCount % 100 === 0 || uploadedCount === blobFiles.length) {
          console.log(`  Uploaded ${uploadedCount}/${blobFiles.length} blobs...`)
        }
        break
      } catch (err) {
        if (attempt === 3) throw err
        await new Promise((r) => setTimeout(r, 800 * attempt))
      }
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => uploadWorker()))
console.log(`All ${uploadedMap.size} unique wheel gallery images uploaded to Vercel Blob.`)

function groupKeyForWheel(p) {
  const m = p.name.match(/^(.*?)\s+(\d{2})x([\d.]+)\s+ET(-?\d+)\s+(.*)$/i)
  const style = m ? m[1].trim() : p.name
  const finish = m ? m[5].trim() : p.wheel.finish
  const src = p.supplierSku ? "WBA" : "PPT"
  return `${src}|||${p.brand}|||${style}|||${finish}`
}

function buildImagesForWheel(p) {
  const primary = p.image || p.images?.[0]
  const gk = groupKeyForWheel(p)
  const entry = manifest[gk]
  if (!entry) return p.images || [primary]
  const urls = [primary]
  for (const [kind, val] of entry.extra) {
    const resolved = kind === "EXTERNAL_URL" ? val : uploadedMap.get(val)
    if (resolved && !urls.includes(resolved)) {
      urls.push(resolved)
    }
  }
  return urls
}

// 1. Update lib/catalog/opening-catalog.json
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"))
let jsonUpdated = 0
for (const p of catalog) {
  if (p.category !== "wheels" || p.archived) continue
  p.images = buildImagesForWheel(p)
  jsonUpdated++
}
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n")
console.log(`Updated ${jsonUpdated} wheels in ${CATALOG_PATH}`)

// 2. Update Neon PostgreSQL products table
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query("SELECT id, slug, data FROM products WHERE archived = false AND category = 'wheels'")
let dbUpdated = 0
for (const r of rows) {
  const p = r.data
  p.images = buildImagesForWheel(p)
  await pool.query("UPDATE products SET data = $1::jsonb, updated_at = now() WHERE id = $2", [JSON.stringify(p), r.id])
  dbUpdated++
}
console.log(`Updated ${dbUpdated} wheels in PostgreSQL products table`)

// 3. Verify distribution
const verifyRes = await pool.query("SELECT data FROM products WHERE archived = false AND category = 'wheels'")
const dist = {}
for (const r of verifyRes.rows) {
  const len = r.data.images?.length || 0
  dist[len] = (dist[len] || 0) + 1
}
console.log("Final PostgreSQL wheel images.length distribution:", dist)
await pool.end()
