import { readFileSync, writeFileSync } from 'node:fs'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, jsonb, boolean } from 'drizzle-orm/pg-core'
import { and, eq } from 'drizzle-orm'
import { brandKey, mpnKey, manufacturerKeys, modelKey } from './eprel-matching.mjs'

const normalize = value => String(value || '').toUpperCase().replaceAll('+', 'PLUS').replace(/[^A-Z0-9]/g, '')
const records = JSON.parse(readFileSync('.v0/refs/eprel/register.json')).records.filter(r => r.status === 'PUBLISHED' && !r.blocked)
const index = new Map()
for (const record of records) {
  const key = `${brandKey(record.supplierOrTrademark)}:${mpnKey(record.modelIdentifier)}`
  index.set(key, [...(index.get(key) || []), record])
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const table = pgTable('products', { category: text('category'), data: jsonb('data'), archived: boolean('archived') })
try {
  const products = (await drizzle(pool).select({ data: table.data }).from(table).where(and(eq(table.category, 'tires'), eq(table.archived, false)))).map(r => r.data).filter(p => p.offers?.eu)
  const models = new Map()
  for (const p of products) {
    const brand = brandKey(p.brand)
    const model = p.tire.model || p.name
    const key = `${brand}:${normalize(model)}`
    const group = models.get(key) || { brand: p.brand, model, variants: 0, labelled: 0, registry: records.filter(r => brandKey(r.supplierOrTrademark) === brand && modelKey(brand, r.additionalDetails?.commercialName) === modelKey(brand, model)).length, candidates: [] }
    group.variants++
    if (p.tire.euLabel?.eprelId) group.labelled++
    const codes = manufacturerKeys(brand, p.mpn)
    if (!p.tire.euLabel?.eprelId) for (const code of new Set(codes)) for (const r of index.get(`${brand}:${code}`) || []) {
      const dimensions = [r.tyreSection, r.aspectRatio, r.rimDiameter, r.loadCapacityIndex, r.speedCategorySymbol]
      if (JSON.stringify(dimensions) !== JSON.stringify([p.tire.width, p.tire.aspect, p.tire.rim, p.tire.loadIndex, p.tire.speedRating])) continue
      group.candidates.push({ id: p.id, slug: p.slug, mpn: p.mpn, gtin: p.gtin, size: `${p.tire.width}/${p.tire.aspect} R${p.tire.rim}`, service: `${p.tire.loadIndex}${p.tire.speedRating}`, runFlat: p.tire.runFlat, extraLoad: p.tire.extraLoad, registry: { id: r.eprelRegistrationNumber, code: r.modelIdentifier, model: r.additionalDetails?.commercialName, gtin: r.additionalDetails?.gtinIdentifier, runFlat: r.additionalDetails?.unrestrictedMobility, load: r.loadCapacityIndicator, fuel: r.energyClass, wet: r.wetGripClass, noise: r.externalRollingNoiseValue } })
    }
    models.set(key, group)
  }
  const result = [...models.values()]
  writeFileSync('.v0/refs/eprel/coverage-audit.json', JSON.stringify(result, null, 2))
  console.log(JSON.stringify({ models: result.length, labelledModels: result.filter(m => m.labelled).length, candidateModels: result.filter(m => m.candidates.length).length, examples: result.filter(m => m.candidates.length).map(m => ({ model: `${m.brand} ${m.model}`, labelled: m.labelled, candidates: m.candidates.length, example: m.candidates[0] })) }, null, 2))
} finally { await pool.end() }
