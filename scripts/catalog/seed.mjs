// Upserts lib/catalog/opening-catalog.json into the products table. Safe to re-run:
// existing rows are updated by id, admin edits to other rows are left alone.
// Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/catalog/seed.mjs
import { Pool } from "pg"
import { readFileSync } from "node:fs"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}
const pool = new Pool({ connectionString: url.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full"), max: 1 })

const catalog = JSON.parse(readFileSync(new URL("../../lib/catalog/opening-catalog.json", import.meta.url), "utf8"))

const client = await pool.connect()
try {
  await client.query("BEGIN")
  for (const product of catalog) {
    await client.query(
      `INSERT INTO products (id, slug, category, data, archived)
       VALUES ($1, $2, $3, $4::jsonb, false)
       ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, category = EXCLUDED.category, data = EXCLUDED.data, updated_at = now()`,
      [product.id, product.slug, product.category, JSON.stringify({ ...product, source: "opening-catalog" })],
    )
  }
  // Seeded rows use the slug as id; admin-created rows get random hex ids and are never touched.
  const { rowCount: archivedStale } = await client.query(
    `UPDATE products SET archived = true, updated_at = now()
     WHERE archived = false AND id !~ '^[0-9a-f]{16,}$' AND NOT (id = ANY($1::text[]))`,
    [catalog.map((p) => p.id)],
  )
  await client.query("COMMIT")
  console.log(`archived ${archivedStale} stale seeded rows`)
  const { rows } = await client.query("SELECT category, count(*)::int AS n FROM products WHERE archived = false GROUP BY category ORDER BY category")
  console.log(`seeded ${catalog.length} products`, rows)
} catch (e) {
  await client.query("ROLLBACK")
  throw e
} finally {
  client.release()
  await pool.end()
}
