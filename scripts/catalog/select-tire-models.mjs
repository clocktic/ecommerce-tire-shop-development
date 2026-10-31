import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'

// Reuse Next's installed image decoder in this offline audit, without adding an app dependency.
const requireFromNext = createRequire(import.meta.resolve('next/package.json'))
const sharp = requireFromNext('sharp')
const directory = '.v0/refs/verified-tires'
const photoDirectory = path.join(directory, 'photos')
const input = JSON.parse(await readFile(path.join(directory, 'expanded-variants.json'), 'utf8'))
await mkdir(photoDirectory, { recursive: true })
const digest = data => createHash('sha256').update(data).digest('hex')
const normalize = text => text.toLowerCase().replace(/[^a-z0-9]/g, '')
const sizeKey = p => `${p.tire.width}/${p.tire.aspect}R${p.tire.rim}`
const byBrand = new Map()
for (const row of input) {
  if (!row.products.length) continue
  const models = byBrand.get(row.model.brand) ?? new Map()
  const key = normalize(row.products[0].tire.model)
  const prior = models.get(key)
  if (prior) {
    prior.products = [...new Map([...prior.products, ...row.products].map(p => [p.id, p])).values()]
    prior.sourceVariants += row.sourceVariants
  } else models.set(key, structuredClone(row))
  byBrand.set(row.model.brand, models)
}

async function photo(url) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'backend.prioritytire.com') throw new Error('Unapproved image origin')
  const filename = digest(url) + '.webp'
  const file = path.join(photoDirectory, filename)
  let image
  try { image = await readFile(file) } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' })
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image HTTP ${response.status}`)
    if (Number(response.headers.get('content-length')) > 10_000_000) throw new Error('Image exceeds size limit')
    const chunks = []
    let length = 0
    for await (const chunk of response.body) {
      length += chunk.byteLength
      if (length > 10_000_000) throw new Error('Image exceeds size limit')
      chunks.push(chunk)
    }
    const raw = Buffer.concat(chunks)
    const metadata = await sharp(raw, { limitInputPixels: 40_000_000 }).metadata()
    if (metadata.width < 200 || metadata.height < 200) throw new Error('Image resolution is too small')
    image = await sharp(raw, { limitInputPixels: 40_000_000 }).rotate().resize(1000, 1000, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
    await writeFile(file, image)
  }
  const pixels = await sharp(image).flatten({ background: '#fff' }).resize(32, 32, { fit: 'contain', background: '#fff' }).greyscale().raw().toBuffer()
  const { width, height } = await sharp(image).metadata()
  return { sourceUrl: url, file: `photos/${filename}`, sha256: digest(image), width, height, pixels }
}

const selected = []
const coverage = []
const failures = []
const brands = [...byBrand].sort(([a], [b]) => a.localeCompare(b))
let cursor = 0
async function worker() {
  while (cursor < brands.length) {
    const [brand, models] = brands[cursor++]
    const ranked = [...models.values()].sort((a, b) => Number(Boolean(b.model.euUrl)) - Number(Boolean(a.model.euUrl)) || new Set(b.products.map(sizeKey)).size - new Set(a.products.map(sizeKey)).size || b.products.length - a.products.length || a.model.modelKey.localeCompare(b.model.modelKey))
    const approved = []
    for (const row of ranked) {
      if (approved.length === 15) break
      const photos = []
      const urls = [...new Set(row.products.flatMap(p => p.images))].slice(0, 12)
      for (const url of urls) {
        if (photos.length >= 2) break
        try {
          const candidate = await photo(url)
          const duplicate = photos.some(previous => {
            let delta = 0
            for (let i = 0; i < candidate.pixels.length; i++) delta += Math.abs(candidate.pixels[i] - previous.pixels[i])
            return delta / candidate.pixels.length < 3
          })
          if (!duplicate) photos.push(candidate)
        } catch (error) { failures.push({ brand, model: row.model.modelKey, url, error: error.message }) }
      }
      if (photos.length < 2) continue
      row.modelPhotos = photos.map(({ pixels, ...p }) => p)
      approved.push(row)
    }
    selected.push(...approved)
    coverage.push({ brand, eligibleModels: ranked.length, selectedModels: approved.length, targetMet: approved.length >= 12, variants: approved.reduce((n, r) => n + r.products.length, 0), sizeOptionsAcrossModels: approved.reduce((n, r) => n + new Set(r.products.map(sizeKey)).size, 0), modelsWithEUNameMatch: approved.filter(r => r.model.euUrl).length, modelsWithTwoDownloadedPhotos: approved.length })
    console.log(JSON.stringify(coverage.at(-1)))
  }
}
await Promise.all(Array.from({ length: 3 }, worker))
const qualifyingBrands = new Set(coverage.filter(row => row.targetMet).map(row => row.brand))
const chosen = selected.filter(row => qualifyingBrands.has(row.model.brand)).sort((a, b) => a.model.brand.localeCompare(b.model.brand) || a.model.modelKey.localeCompare(b.model.modelKey))
const ids = new Map()
for (const row of chosen) for (const product of row.products) {
  const previous = ids.get(product.id)
  if (previous && JSON.stringify(previous.tire) !== JSON.stringify(product.tire)) throw new Error(`Conflicting article ${product.id}`)
  ids.set(product.id, product)
}
const summary = { brands: qualifyingBrands.size, models: chosen.length, uniqueArticles: ids.size, downloadedModelPhotos: chosen.length * 2, quantityTargetMet: qualifyingBrands.size >= 12 && qualifyingBrands.size <= 15, published: 0, scope: 'Source-backed draft selection, not publication approval. All supported source variants are retained per selected model. Regional verification, commercial terms and photo rights remain pending.' }
await writeFile(path.join(directory, 'catalog-selection.json'), JSON.stringify(chosen))
await writeFile(path.join(directory, 'catalog-coverage.json'), JSON.stringify({ summary, coverage: coverage.sort((a, b) => a.brand.localeCompare(b.brand)), imageFailures: failures, collectionFailures: input.filter(r => r.error).map(r => ({ model: r.model, error: r.error })), skippedVariantCount: input.reduce((n, r) => n + (r.skipped?.length ?? 0), 0) }, null, 2))
console.log(JSON.stringify(summary))
