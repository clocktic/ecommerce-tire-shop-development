import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { boolean, jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'

const table = pgTable('products', {
  id: text('id').primaryKey(), slug: text('slug').notNull(), category: text('category').notNull(),
  data: jsonb('data').notNull(), archived: boolean('archived').notNull(),
})
const batches = JSON.parse(readFileSync('.v0/refs/verified-tires/us-variants.json', 'utf8'))
const unique = new Map()
for (const batch of batches) {
  for (const product of batch.products) {
    const t = product.tire
    if (product.source !== 'verified-tire-drafts-v1' || product.verification?.status !== 'draft' ||
      !product.mpn || !product.supplierSku || new Set(product.images).size < 2 ||
      !Number.isInteger(t?.utqg?.treadwear) || !/^(AA|A|B|C)$/.test(t.utqg.traction) || !/^[ABC]$/.test(t.utqg.temperature) ||
      !Number.isInteger(product.offers?.us?.priceCents) || product.offers.us.priceCents <= 0 || product.offers.eu) {
      throw new Error(`Invalid US draft ${product.id}`)
    }
    const prior = unique.get(product.id)
    if (prior && JSON.stringify(prior.tire) !== JSON.stringify(product.tire)) {
      throw new Error(`Conflicting manufacturer article ${product.id}`)
    }
    unique.set(product.id, product)
  }
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
try {
  const existing = await db.select({ data: table.data }).from(table).where(eq(table.category, 'tires'))
  const known = new Set(existing.filter(({ data }) => data.mpn && data.offers?.us).map(({ data }) => `${data.brand.toLowerCase()}:${data.mpn}`))
  const candidates = [...unique.values()].filter(p => !known.has(`${p.brand.toLowerCase()}:${p.mpn}`))
  console.log(JSON.stringify({ validated: unique.size, alreadyPresent: unique.size - candidates.length, newArchivedDrafts: candidates.length, apply: process.argv.includes('--apply') }))
  if (process.argv.includes('--apply')) {
    let inserted = 0
    await db.transaction(async tx => {
      for (let i = 0; i < candidates.length; i += 100) {
        const rows = await tx.insert(table).values(candidates.slice(i, i + 100).map(data => ({ id: data.id, slug: data.slug, category: 'tires', data, archived: true }))).onConflictDoNothing().returning({ id: table.id })
        inserted += rows.length
      }
    })
    console.log(JSON.stringify({ insertedArchivedDrafts: inserted, published: 0, existingProductsModified: 0 }))
  }
} finally {
  await pool.end()
}
