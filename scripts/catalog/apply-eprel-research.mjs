import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { parseArgs, isDeepStrictEqual } from 'node:util'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core'
import { inArray, eq } from 'drizzle-orm'
import { prepareResearchUpdate } from './eprel-research-update.mjs'

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false } } })
const decisions = JSON.parse(readFileSync(new URL('./eprel-verified-articles.json', import.meta.url), 'utf8'))
assert.equal(new Set(decisions.map(d => d.productId)).size, decisions.length, 'Duplicate articles')
const table = pgTable('products', { id: text('id').primaryKey(), slug: text('slug'), category: text('category'), data: jsonb('data'), archived: boolean('archived'), updatedAt: timestamp('updated_at') })
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
const root = '.v0/refs/eprel'
mkdirSync(root, { recursive: true })
try {
  const rows = await db.select().from(table).where(inArray(table.id, decisions.map(d => d.productId)))
  const updates = []
  const officialResponses = []
  for (const decision of decisions) {
    const row = rows.find(r => r.id === decision.productId)
    assert(row && !row.archived && row.category === 'tires' && row.data.offers?.eu, `Inactive EU article: ${decision.productId}`)
    const url = `https://eprel.ec.europa.eu/api/products/tyres/${decision.eprelId}`
    const response = await fetch(url, { headers: { Accept: 'application/json', Referer: 'https://eprel.ec.europa.eu/' }, signal: AbortSignal.timeout(15000) })
    assert(response.ok, `EPREL ${decision.eprelId}: HTTP ${response.status}`)
    const body = await response.text()
    const record = JSON.parse(body)
    const checkedAt = new Date().toISOString()
    const data = prepareResearchUpdate(row.data, record, decision, checkedAt)
    officialResponses.push({ url, checkedAt, sha256: createHash('sha256').update(body).digest('hex'), record })
    if (!isDeepStrictEqual(data, row.data)) updates.push({ row, data, decision })
  }
  const report = {
    checkedAt: new Date().toISOString(), apply: values.apply, verifiedArticles: decisions.length,
    verifiedModels: new Set(decisions.map(d => `${d.brand} ${d.catalogModel}`)).size,
    pendingUpdates: updates.length, applied: 0, pricesChanged: 0, inventoryChanged: 0,
    articles: decisions.map(d => ({ id: d.productId, model: `${d.brand} ${d.catalogModel}`, eprelId: d.eprelId, corrections: d.corrections, sourceUrl: d.sourceUrl })),
    officialResponses,
  }
  if (values.apply && updates.length) {
    const backup = `${root}/research-before-${Date.now()}.json`
    writeFileSync(backup, JSON.stringify(updates.map(u => u.row), null, 2), { flag: 'wx' })
    await db.transaction(async tx => {
      const locked = await tx.select().from(table).where(inArray(table.id, updates.map(u => u.row.id))).for('update')
      for (const { row, data } of updates) {
        const current = locked.find(r => r.id === row.id)
        assert(current && !current.archived && current.category === row.category && current.slug === row.slug && isDeepStrictEqual(current.data, row.data), `Concurrent change: ${row.id}`)
        await tx.update(table).set({ data, updatedAt: new Date() }).where(eq(table.id, row.id))
      }
    })
    report.applied = updates.length
    report.backup = backup
  }
  writeFileSync(`${root}/research-${values.apply ? 'applied' : 'plan'}.json`, JSON.stringify(report, null, 2))
  const { officialResponses: omitted, ...summary } = report
  console.log(JSON.stringify(summary, null, 2))
} finally {
  await pool.end()
}
