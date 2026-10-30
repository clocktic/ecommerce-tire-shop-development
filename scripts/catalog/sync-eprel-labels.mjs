import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseArgs, isDeepStrictEqual } from 'node:util'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { buildEprelIndex, matchEprel, brandKey } from './eprel-matching.mjs'

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false } } })
const root = '.v0/refs/eprel'
const register = JSON.parse(readFileSync(`${root}/register.json`, 'utf8'))
const age = Date.now() - Date.parse(register.checkedAt)
if (!Array.isArray(register.records) || !register.records.length || !Number.isFinite(age) || age < 0 || age > 7 * 86400000) throw new Error('Missing or stale EPREL snapshot')
const index = buildEprelIndex(register.records)
const crosswalks = JSON.parse(readFileSync(new URL('./eprel-verified-articles.json', import.meta.url), 'utf8'))
const brands = new Set(register.brands.map(brandKey))
const table = pgTable('products', { id: text('id').primaryKey(), slug: text('slug'), category: text('category'), data: jsonb('data'), archived: boolean('archived'), updatedAt: timestamp('updated_at') })
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
try {
  const rows = (await db.select({ id: table.id, slug: table.slug, data: table.data }).from(table).where(and(eq(table.category, 'tires'), eq(table.archived, false)))).filter(row => row.data.offers?.eu)
  if (!rows.length) throw new Error('EU catalogue is empty')
  const missingBrands = [...new Set(rows.map(r => brandKey(r.data.brand)).filter(b => !brands.has(b)))]
  if (missingBrands.length) throw new Error(`Incomplete registry coverage: ${missingBrands.join(', ')}`)
  const updates = []
  const report = []
  for (const row of rows) {
    const product = row.data
    const result = matchEprel(product, index, crosswalks)
    report.push({ id: row.id, slug: row.slug, brand: product.brand, model: product.tire.model || product.name, mpn: product.mpn || '', gtin: product.gtin || '', size: `${product.tire.width}/${product.tire.aspect} R${product.tire.rim}`, service: `${product.tire.loadIndex}${product.tire.speedRating}${product.tire.extraLoad ? ' XL' : ''}${product.tire.runFlat ? ' Run-flat' : ''}`, status: result.status, eprelIds: result.candidateIds.join(';'), existingEprelId: product.tire.euLabel?.eprelId || '' })
    if (result.status !== 'verified') continue
    const evidence = {
      ...product.verification?.eprel,
      ...(result.crosswalk ? { crosswalk: result.crosswalk } : {}),
      status: 'verified', checkedAt: register.checkedAt,
      sourceUrl: `https://eprel.ec.europa.eu/screen/product/tyres/${result.label.eprelId}`,
      registrationNumber: result.label.eprelId, versionNumber: result.record.versionNumber,
      manufacturerIdentifier: result.record.modelIdentifier,
      commercialName: result.record.additionalDetails?.commercialName,
      catalogManufacturerIdentifier: product.mpn || '',
      match: result.crosswalk ? 'documented catalogue article + GTIN to EU manufacturer identifier and OEM model; size, load, speed, reinforcement and declared run-flat validated' : 'brand + manufacturer identifier (including verified brand-specific formatting) or GTIN + commercial model aliases + size + load + speed; conflicting GTIN, XL and declared run-flat rejected',
    }
    const data = { ...product, tire: { ...product.tire, euLabel: result.label }, verification: { ...product.verification, eprel: evidence } }
    if (!isDeepStrictEqual(product, data)) updates.push({ row, data })
  }
  const statuses = report.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] || 0) + 1 }), {})
  const modelName = article => `${article.brand} ${article.model}`
  const allModels = new Set(report.map(modelName))
  const labelledModels = new Set(report.filter(r => r.status === 'verified').map(modelName))
  const summary = { checkedAt: register.checkedAt, records: register.records.length, euArticles: rows.length, models: allModels.size, labelledModels: labelledModels.size, modelsStillUnconfirmed: [...allModels].filter(name => !labelledModels.has(name)), newLabels: report.filter(r => r.status === 'verified' && !r.existingEprelId).length, statuses, updates: updates.length, apply: values.apply }
  mkdirSync(root, { recursive: true })
  writeFileSync(`${root}/report.json`, JSON.stringify({ summary, articles: report }, null, 2))
  const columns = ['id', 'brand', 'model', 'mpn', 'gtin', 'size', 'service', 'status', 'eprelIds', 'existingEprelId']
  const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`
  writeFileSync(`${root}/unresolved.csv`, [columns, ...report.filter(r => r.status !== 'verified').map(r => columns.map(c => r[c]))].map(row => row.map(quote).join(',')).join('\n'))
  console.log(JSON.stringify(summary))
  console.log(JSON.stringify({ examples: report.filter(r => r.status === 'verified').slice(0, 5) }))
  if (values.apply && updates.length) {
    await db.transaction(async tx => {
      const locked = await tx.select({ id: table.id, slug: table.slug, archived: table.archived, data: table.data }).from(table).where(inArray(table.id, updates.map(u => u.row.id))).for('update')
      const byId = new Map(locked.map(row => [row.id, row]))
      for (const { row } of updates) {
        const current = byId.get(row.id)
        if (!current || current.archived || current.slug !== row.slug || !isDeepStrictEqual(current.data, row.data)) throw new Error(`Concurrent change: ${row.id}; EPREL update rolled back`)
      }
      for (let i = 0; i < updates.length; i += 100) {
        await tx.insert(table).values(updates.slice(i, i + 100).map(({ row, data }) => ({ id: row.id, slug: row.slug, category: 'tires', data, archived: false, updatedAt: new Date() })))
          .onConflictDoUpdate({ target: table.id, set: { data: sql`excluded.data`, updatedAt: new Date() } })
      }
    })
    console.log(JSON.stringify({ applied: updates.length, pricesChanged: 0, inventoryChanged: 0 }))
  }
} finally { await pool.end() }
