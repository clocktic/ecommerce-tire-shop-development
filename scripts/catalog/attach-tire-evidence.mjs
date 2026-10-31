import { readFileSync } from 'node:fs'
import { isDeepStrictEqual, parseArgs } from 'node:util'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { and, eq, inArray } from 'drizzle-orm'

const table = pgTable('products', {
  id: text('id').primaryKey(), data: jsonb('data').notNull(), archived: boolean('archived').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
const { values: options } = parseArgs({ options: { input: { type: 'string', default: '.v0/refs/verified-tires/verified-crosswalk.json' }, apply: { type: 'boolean', default: false } } })
const report = JSON.parse(readFileSync(options.input, 'utf8'))
const matches = report.matches
if (new Set(matches.map(m => m.productId)).size !== matches.length) throw new Error('Duplicate evidence target')
for (const match of matches) {
  const registration = String(match.euRecord?.eprelRegistrationNumber)
  if (match.publicationReady !== false || match.status !== 'identifier-and-specifications-match' ||
    match.directLookup?.status !== 'verified-snapshot' || !/^\d+$/.test(registration) ||
    match.directLookup.url !== `https://eprel.ec.europa.eu/api/products/tyres/${registration}` ||
    !match.pending?.length || !match.usTire || !match.gtin || !match.mpn) {
    throw new Error(`Invalid evidence ${match.productId}`)
  }
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
try {
  const rows = matches.length ? await db.select({ id: table.id, data: table.data }).from(table)
    .where(and(eq(table.archived, true), inArray(table.id, matches.map(m => m.productId)))) : []
  const byId = new Map(rows.map(row => [row.id, row]))
  const updates = []
  const skipped = []
  for (const match of matches) {
    const row = byId.get(match.productId)
    if (!row || row.data.source !== 'verified-tire-drafts-v1' || row.data.brand !== match.brand ||
      row.data.mpn !== match.mpn || row.data.gtin !== match.gtin || !isDeepStrictEqual(row.data.tire, match.usTire)) {
      skipped.push({ id: match.productId, reason: 'Not an unchanged archived source draft' })
      continue
    }
    const evidence = { status: match.status, publicationReady: false, pending: match.pending, record: match.euRecord, directLookup: match.directLookup }
    if (isDeepStrictEqual(row.data.verification?.euEvidence, evidence)) continue
    updates.push({ row, data: { ...row.data, verification: { ...row.data.verification, euEvidence: evidence } } })
  }
  console.log(JSON.stringify({ matched: matches.length, archivedDraftsToEnrich: updates.length, skipped, apply: options.apply }))
  if (options.apply) {
    await db.transaction(async tx => {
      for (const { row, data } of updates) {
        const changed = await tx.update(table).set({ data, updatedAt: new Date() })
          .where(and(eq(table.id, row.id), eq(table.archived, true), eq(table.data, row.data))).returning({ id: table.id })
        if (changed.length !== 1) throw new Error(`Concurrent edit detected for ${row.id}; transaction rolled back`)
      }
    })
    console.log(JSON.stringify({ enriched: updates.length, published: 0, pricesChanged: 0, activeProductsChanged: 0 }))
  }
} finally {
  await pool.end()
}
