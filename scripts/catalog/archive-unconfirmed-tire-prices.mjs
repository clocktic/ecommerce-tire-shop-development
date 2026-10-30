import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { parseArgs, isDeepStrictEqual } from 'node:util'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { and, eq, inArray } from 'drizzle-orm'
import { publishedPriceIssue } from './tire-price-confirmation.mjs'

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false } } })
const batches = JSON.parse(readFileSync('.v0/refs/verified-tires/catalog-selection.json', 'utf8'))
const sources = new Map()
const identity = p => `${p.brand.toLowerCase()}:${p.mpn}`
for (const batch of batches) for (const p of batch.products) {
  const key = identity(p)
  if (sources.has(key) && !isDeepStrictEqual(sources.get(key), p)) throw new Error(`Conflicting source article: ${key}`)
  sources.set(key, p)
}
const table = pgTable('products', { id: text('id').primaryKey(), slug: text('slug'), category: text('category'), archived: boolean('archived'), data: jsonb('data'), updatedAt: timestamp('updated_at') })
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
try {
  const rows = (await db.select({ id: table.id, slug: table.slug, data: table.data }).from(table).where(and(eq(table.category, 'tires'), eq(table.archived, false)))).filter(r => r.data.offers?.us || r.data.offers?.eu)
  const decisions = rows.map(row => ({ row, reason: publishedPriceIssue(row.data, sources.get(identity(row.data))) }))
  const removed = decisions.filter(d => d.reason)
  const retained = decisions.filter(d => !d.reason)
  const model = p => `${p.brand}:${p.tire.model || p.name}`
  const beforeModels = new Set(rows.map(r => model(r.data)))
  const afterModels = new Set(retained.map(r => model(r.row.data)))
  const summary = { activeBefore: rows.length, archive: removed.length, retain: retained.length, modelsBefore: beforeModels.size, modelsAfter: afterModels.size, usRetained: retained.filter(r => r.row.data.offers.us).length, euRetained: retained.filter(r => r.row.data.offers.eu).length, reasons: removed.reduce((a, d) => ({ ...a, [d.reason]: (a[d.reason] || 0) + 1 }), {}), apply: values.apply }
  mkdirSync('.v0/refs/price-review', { recursive: true })
  const snapshot = { checkedAt: new Date().toISOString(), summary, archived: removed.map(({ row, reason }) => ({ ...row, reason })), retainedIds: retained.map(d => d.row.id) }
  writeFileSync(`.v0/refs/price-review/${values.apply ? 'applied-plan' : 'dry-run'}.json`, JSON.stringify(snapshot))
  console.log(JSON.stringify(summary))
  if (values.apply && removed.length) {
    await db.transaction(async tx => {
      const locked = await tx.select({ id: table.id, archived: table.archived, data: table.data }).from(table).where(inArray(table.id, rows.map(r => r.id))).for('update')
      const byId = new Map(locked.map(r => [r.id, r]))
      for (const row of rows) {
        const current = byId.get(row.id)
        if (!current || current.archived || !isDeepStrictEqual(current.data, row.data)) throw new Error(`Concurrent edit: ${row.id}; archive rolled back`)
      }
      for (let i = 0; i < removed.length; i += 200) {
        await tx.update(table).set({ archived: true, updatedAt: new Date() }).where(inArray(table.id, removed.slice(i, i + 200).map(d => d.row.id)))
      }
    })
    console.log(JSON.stringify({ archived: removed.length, deleted: 0, retained: retained.length, pricesChanged: 0, eprelChanged: 0 }))
  }
} finally { await pool.end() }
