import "server-only"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as { pgPool?: Pool }

// One pool per server instance; HMR would otherwise open a new pool on every edit.
export const pool = globalForDb.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool

export const db = drizzle(pool, { schema })
