import "server-only"

import { cache } from "react"
import { and, asc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders, products } from "@/lib/db/schema"
import type { Category, Product } from "@/lib/catalog/types"
import { orderBrakeProducts } from "@/lib/catalog"
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
  if (!result.ok) return result
  const filtered = result.data.filter((p) => p.category === category)
  return { ok: true, data: category === "brakes" ? orderBrakeProducts(filtered) : filtered }
}

const SOLD_STATUSES = ["paid", "shipped", "delivered"]

const unitsSoldBySlug = cache(async (): Promise<Map<string, number>> => {
  try {
    const rows = await db
      .select({ slug: orderItems.productSlug, units: sql<number>`sum(${orderItems.quantity})::int` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(inArray(orders.status, SOLD_STATUSES))
      .groupBy(orderItems.productSlug)
    return new Map(rows.map((r) => [r.slug, Number(r.units)]))
  } catch {
    return new Map()
  }
})

// Best sellers first, then in-stock items spread across brands so the rail never
// fills up with near-identical sizes of one model.
function rankForCategory(items: Product[], market: Market, sold: Map<string, number>): Product[] {
  const withPhoto = items.filter((p) => p.images[0] && !p.sample && p.offers[market]?.availability !== "out_of_stock")
  const best = withPhoto
    .filter((p) => (sold.get(p.slug) ?? 0) > 0)
    .sort((a, b) => (sold.get(b.slug) ?? 0) - (sold.get(a.slug) ?? 0))
  const bestSlugs = new Set(best.map((p) => p.slug))
  const byBrand = new Map<string, Product[]>()
  for (const p of withPhoto) {
    if (bestSlugs.has(p.slug)) continue
    const list = byBrand.get(p.brand) ?? []
    list.push(p)
    byBrand.set(p.brand, list)
  }
  const rest: Product[] = []
  const queues = [...byBrand.values()]
  for (let round = 0; queues.some((q) => q.length > round); round++) {
    for (const q of queues) if (q[round]) rest.push(q[round])
  }
  return [...best, ...rest]
}

export async function readPopularProducts(market: Market, limit = 20): Promise<DatabaseReadResult<Product[]>> {
  const result = await readProducts(market)
  if (!result.ok) return result
  const sold = await unitsSoldBySlug()
  const tires = rankForCategory(result.data.filter((p) => p.category === "tires"), market, sold)
  const wheels = rankForCategory(result.data.filter((p) => p.category === "wheels"), market, sold)
  const mixed: Product[] = []
  for (let i = 0; mixed.length < limit && (i < tires.length || i < wheels.length); i++) {
    if (tires[i]) mixed.push(tires[i])
    if (wheels[i] && mixed.length < limit) mixed.push(wheels[i])
  }
  return { ok: true, data: mixed }
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
