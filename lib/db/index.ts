import "server-only"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as { pgPool?: Pool }

// pg treats sslmode=require as verify-full today and warns that the alias will
// weaken later. That warning is surfaced as a preview error, so pin the current
// strict behavior on the string before the driver parses it.
function databaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return url.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
}

// One pool per server instance; HMR would otherwise open a new pool on every edit.
export const pool = globalForDb.pgPool ?? new Pool({ connectionString: databaseUrl(), max: 5 })
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool

export const db = drizzle(pool, { schema })
