import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { validTireDraft, validateSelectionTarget } from './tire-draft-validation.mjs'

const directory = '.v0/refs/verified-tires'
const selected = JSON.parse(await readFile(`${directory}/catalog-selection.json`, 'utf8'))
const source = JSON.parse(await readFile(`${directory}/expanded-variants.json`, 'utf8'))
const coverage = JSON.parse(await readFile(`${directory}/catalog-coverage.json`, 'utf8'))
const modelKey = p => `${p.brand}:${p.tire.model.toLowerCase().replace(/[^a-z0-9]/g, '')}`
const expected = new Map()
for (const batch of source) for (const p of batch.products) {
  const ids = expected.get(modelKey(p)) ?? new Set()
  ids.add(p.id)
  expected.set(modelKey(p), ids)
}
validateSelectionTarget(selected)
let articles = 0
let photos = 0
for (const batch of selected) {
  const actual = new Set(batch.products.map(p => p.id))
  assert.deepEqual(actual, expected.get(modelKey(batch.products[0])), 'Selected model lost supported source variants')
  assert.ok(batch.products.every(validTireDraft), 'Invalid article in selection')
  const sourceImages = new Set(batch.products.flatMap(p => p.images))
  for (const photo of batch.modelPhotos) {
    assert.match(photo.file, /^photos\/[a-f0-9]{64}\.webp$/)
    const buffer = await readFile(`${directory}/${photo.file}`)
    assert.equal(createHash('sha256').update(buffer).digest('hex'), photo.sha256)
    assert.ok(sourceImages.has(photo.sourceUrl), 'Photo does not belong to selected model gallery')
    photos++
  }
  articles += batch.products.length
}
assert.equal(coverage.summary.models, selected.length)
assert.equal(coverage.summary.downloadedModelPhotos, photos)
assert.equal(coverage.summary.quantityTargetMet, true)
assert.equal(new Set(selected.map(b => b.model.brand)).size, coverage.summary.brands)
console.log(JSON.stringify({ verifiedBrands: coverage.summary.brands, verifiedModels: selected.length, verifiedArticles: articles, verifiedPhotos: photos, allSupportedSourceVariantsRetained: true }))
