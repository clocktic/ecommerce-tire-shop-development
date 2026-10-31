import "server-only"

import { cache } from "react"
import { and, asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import type { Category, Product } from "@/lib/catalog/types"
import type { Market } from "@/lib/markets"
import { readDatabase, type DatabaseReadResult } from "@/lib/db/availability"

// Storefront reads: archived products are hidden everywhere (pages, sitemap, feeds).
// Cache the result, not a rejected promise that React can replay during rendering.
const activeProducts = cache(() => readDatabase(async (): Promise<Product[]> => {
  const rows = await db
    .select({ data: products.data })
    .from(products)
    .where(eq(products.archived, false))
    .orderBy(asc(products.createdAt))
  return rows.map((r) => r.data)
}))

export async function readProducts(market: Market): Promise<DatabaseReadResult<Product[]>> {
  const result = await activeProducts()
  return result.ok ? { ok: true, data: result.data.filter((p) => p.offers[market]) } : result
}

export async function readProductsByCategory(market: Market, category: Category): Promise<DatabaseReadResult<Product[]>> {
  const result = await readProducts(market)
  return result.ok ? { ok: true, data: result.data.filter((p) => p.category === category) } : result
}

export const readProductBySlug = cache((slug: string) => readDatabase(async (): Promise<Product | undefined> => {
  const [row] = await db.select({ data: products.data }).from(products)
    .where(and(eq(products.archived, false), eq(products.slug, slug))).limit(1)
  return row?.data
}))

function requireAvailable<T>(result: DatabaseReadResult<T>): T {
  if (!result.ok) throw new Error("Catalog unavailable: database quota exceeded")
  return result.data
}

// Checkout and machine-readable feeds must fail closed, never return empty stock.
export async function getProducts(market: Market): Promise<Product[]> {
  return requireAvailable(await readProducts(market))
}

export async function getProductsByCategory(market: Market, category: Category): Promise<Product[]> {
  return requireAvailable(await readProductsByCategory(market, category))
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return requireAvailable(await readProductBySlug(slug))
}
