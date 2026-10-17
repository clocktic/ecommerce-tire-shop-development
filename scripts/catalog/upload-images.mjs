// Copies every source image referenced by .v0/refs/catalog_build.json into Vercel Blob and
// writes lib/catalog/opening-catalog.json with the Blob urls. Re-runs skip already-uploaded
// urls via the manifest in .v0/refs/image_manifest.json.
// Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/catalog/upload-images.mjs
import { put } from "@vercel/blob"
import { readFileSync, writeFileSync, existsSync } from "node:fs"

const REFS = "/vercel/share/v0-project/.v0/refs/"
const OUT = "/vercel/share/v0-project/lib/catalog/opening-catalog.json"
const MANIFEST = REFS + "image_manifest.json"

const catalog = JSON.parse(readFileSync(REFS + "catalog_build.json", "utf8"))
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0"
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }

async function fetchImage(url) {
  const referer = new URL(url).origin + "/"
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "image/*,*/*", Referer: referer }, redirect: "follow" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const type = sniff(buf) || (res.headers.get("content-type") || "").split(";")[0].trim()
  if (!EXT[type] || buf.length < 2000) throw new Error(`bad image ${type} ${buf.length}b`)
  return { buf, type }
}

// Some CDNs serve images as application/octet-stream; trust the bytes over the header.
function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg"
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return "image/png"
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp"
  if (buf.toString("ascii", 4, 12) === "ftypavif") return "image/avif"
  return null
}

let done = 0
let failed = 0
const queue = []
for (const p of catalog) p.images.forEach((src, i) => queue.push({ p, src, i }))
const total = queue.length

async function worker() {
  while (queue.length) {
    const { p, src, i } = queue.shift()
    if (manifest[src]) {
      done++
      continue
    }
    try {
      const { buf, type } = await fetchImage(src)
      const blob = await put(`products/${p.slug}-${i + 1}.${EXT[type]}`, buf, { access: "public", contentType: type, addRandomSuffix: false, allowOverwrite: true })
      manifest[src] = blob.url
    } catch (e) {
      failed++
      manifest[src] = null
      console.log(`FAIL ${p.slug} #${i + 1} ${src.slice(0, 90)} -> ${e.message}`)
    }
    done++
    if (done % 50 === 0) {
      console.log(`${done}/${total} (failed ${failed})`)
      writeFileSync(MANIFEST, JSON.stringify(manifest))
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
writeFileSync(MANIFEST, JSON.stringify(manifest))

const final = []
let dropped = 0
for (const p of catalog) {
  const images = p.images.map((s) => manifest[s]).filter(Boolean)
  if (!images.length) {
    dropped++
    continue
  }
  final.push({ ...p, images })
}
writeFileSync(OUT, JSON.stringify(final, null, 1))
console.log(`uploaded ${total - failed}/${total}; products ${final.length} (dropped ${dropped} without any image) -> ${OUT}`)
