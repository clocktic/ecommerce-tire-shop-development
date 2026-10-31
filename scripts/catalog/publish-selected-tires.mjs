import { readFileSync } from 'node:fs'
import { parseArgs, isDeepStrictEqual } from 'node:util'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core'
import { eq, inArray, sql } from 'drizzle-orm'
import { sourcePriceIssue } from './tire-price-confirmation.mjs'

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false } } })
const batches = JSON.parse(readFileSync('.v0/refs/verified-tires/catalog-selection.json', 'utf8'))
const photos = JSON.parse(readFileSync('lib/catalog/reference-data.json', 'utf8'))
const selected = new Map()
for (const batch of batches) for (const p of batch.products) {
  if (!Number.isSafeInteger(p.offers?.us?.priceCents) || p.offers.us.priceCents <= 0) throw new Error(`Invalid source price: ${p.id}`)
  const prior = selected.get(p.id)
  if (prior && (prior.mpn !== p.mpn || JSON.stringify(prior.tire) !== JSON.stringify(p.tire))) throw new Error(`Conflicting article: ${p.id}`)
  if (!prior || p.offers.us.priceCents < prior.offers.us.priceCents) selected.set(p.id, p)
}
if (selected.size !== 7860) throw new Error('Unexpected selection size')
const response = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', { signal: AbortSignal.timeout(20000) })
if (!response.ok) throw new Error('ECB rate unavailable')
const xml = await response.text()
const rate = Number(xml.match(/currency=['"]USD['"] rate=['"]([\d.]+)['"]/)?.[1])
const date = xml.match(/time=['"]([\d-]+)['"]/)?.[1]
const age = Date.now() - Date.parse(`${date}T00:00:00Z`)
if (!(rate > 0.5 && rate < 2 && age >= 0 && age < 7 * 86400000)) throw new Error('Invalid or stale ECB rate')
const table = pgTable('products', { id: text('id').primaryKey(), slug: text('slug'), category: text('category'), data: jsonb('data'), archived: boolean('archived'), updatedAt: timestamp('updated_at') })
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
try {
  const rows = await db.select({ id: table.id, slug: table.slug, data: table.data, archived: table.archived }).from(table).where(eq(table.category, 'tires'))
  const byId = new Map(rows.map(r => [r.id, r]))
  const sourceById = new Map()
  const targets = [...selected.values()].map(source => {
    const matches = byId.has(source.id) ? [byId.get(source.id)] : rows.filter(r => r.data.brand.toLowerCase() === source.brand.toLowerCase() && r.data.mpn === source.mpn)
    if (matches.length !== 1) throw new Error(`Missing or ambiguous database article: ${source.id}`)
    const row = matches[0]
    if (sourceById.has(row.id)) throw new Error(`Duplicate selection: ${row.id}`)
    sourceById.set(row.id, source)
    return row
  })
  const publishableTargets = targets.filter(row => !sourcePriceIssue(sourceById.get(row.id)))
  const updates = publishableTargets.map(row => {
    const source = sourceById.get(row.id)
    if (!['verified-tire-drafts-v1', 'opening-catalog'].includes(row.data.source) || row.data.mpn !== source.mpn || row.data.brand !== source.brand) throw new Error(`Unexpected database article: ${row.id}`)
    const conflicts = ['width', 'aspect', 'rim', 'loadIndex', 'speedRating', 'extraLoad', 'runFlat'].filter(field => row.data.tire[field] !== source.tire[field])
    if (conflicts.length && row.data.source !== 'opening-catalog') throw new Error(`Specification mismatch: ${row.id} / ${conflicts.join(', ')}`)
    const base = conflicts.length ? { ...source, id: row.id, slug: row.slug, source: row.data.source, verification: { ...source.verification, correctedOriginalSpecification: row.data.tire } } : row.data
    const keepInventory = row.data.source === 'opening-catalog' && !conflicts.length
    const images = photos.find(m => m.brand === source.brand && m.name === source.tire.model)?.images
    if (!images || images.length < 2) throw new Error(`Missing photos: ${row.id}`)
    const previous = row.data.verification?.publicationPricing
    const usd = source.offers.us.priceCents
    const pricing = previous?.sourcePriceCents === usd ? previous : {
      basis: 'minimum-saved-source-price', sourceCurrency: 'USD', sourcePriceCents: usd,
      sourceUrls: source.verification.sources.filter(url => new URL(url).hostname.endsWith('prioritytire.com')),
      sourceCheckedAt: source.verification.checkedAt,
      eurMethod: 'USD converted at ECB reference rate; not an EU competitor quotation', usdPerEur: rate, rateDate: date,
      rateSource: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
    }
    const data = { ...base, images, tire: { ...base.tire, model: source.tire.model }, offers: {
      ...row.data.offers,
      us: { priceCents: usd, availability: keepInventory ? row.data.offers.us.availability : 'out_of_stock' },
      eu: { priceCents: Math.round(usd / pricing.usdPerEur), availability: keepInventory ? row.data.offers.eu?.availability || 'out_of_stock' : 'out_of_stock' },
    }, verification: { ...base.verification, publicationPricing: pricing, status: 'published-source-priced', inventoryConfirmed: false } }
    return { row, data }
  }).filter(({ row, data }) => row.archived || !isDeepStrictEqual(row.data, data))
  console.log(JSON.stringify({ selected: targets.length, eligible: publishableTargets.length, skippedUnconfirmed: targets.length - publishableTargets.length, updates: updates.length, usdPerEur: rate, rateDate: date, apply: values.apply, inventory: 'out_of_stock', unrelatedProductsModified: 0 }))
  if (values.apply) {
    await db.transaction(async tx => {
      if (!updates.length) return
      const locked = await tx.select({ id: table.id, slug: table.slug, data: table.data, archived: table.archived }).from(table).where(inArray(table.id, updates.map(u => u.row.id))).for('update')
      const lockedById = new Map(locked.map(row => [row.id, row]))
      for (const { row } of updates) {
        const current = lockedById.get(row.id)
        if (!current || current.archived !== row.archived || current.slug !== row.slug || !isDeepStrictEqual(current.data, row.data)) throw new Error(`Concurrent change: ${row.id}; publication rolled back`)
      }
      for (let i = 0; i < updates.length; i += 100) {
        await tx.insert(table).values(updates.slice(i, i + 100).map(({ row, data }) => ({ id: row.id, slug: row.slug, category: 'tires', data, archived: false, updatedAt: new Date() })))
          .onConflictDoUpdate({ target: table.id, set: { data: sql`excluded.data`, archived: false, updatedAt: new Date() } })
      }
    })
    console.log(JSON.stringify({ publishedUpdated: updates.length, us: publishableTargets.length, eu: publishableTargets.length }))
  }
} finally { await pool.end() }
