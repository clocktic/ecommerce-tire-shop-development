import "server-only"

import { cache } from "react"
import { and, asc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { POPULAR_MODELS, type PopularModel } from "@/lib/catalog/popular-models"
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// One representative listing per curated model: the model name must be followed
// by a size (digit), so "Pilot Sport 4" never swallows "Pilot Sport 4S" or "4 SUV".
// Among sizes, take the median-priced in-stock one to avoid odd extremes.
function pickModels(items: Product[], models: PopularModel[], market: Market): Product[] {
  const picked: Product[] = []
  for (const { brand, model } of models) {
    const pattern = new RegExp(`^${escapeRegExp(model)}\\s+\\d`, "i")
    const variants = items
      .filter((p) => p.brand === brand && pattern.test(p.name) && p.images[0] && !p.sample)
      .filter((p) => p.offers[market]?.availability !== "out_of_stock")
      .sort((a, b) => (a.offers[market]?.priceCents ?? 0) - (b.offers[market]?.priceCents ?? 0))
    const choice = variants[Math.floor((variants.length - 1) / 2)]
    if (choice) picked.push(choice)
  }
  return picked
}

export async function readPopularProducts(market: Market, limit = 20): Promise<DatabaseReadResult<Product[]>> {
  const result = await readProducts(market)
  if (!result.ok) return result
  const curated = POPULAR_MODELS[market]
  const tires = pickModels(result.data.filter((p) => p.category === "tires"), curated.tires, market)
  const wheels = pickModels(result.data.filter((p) => p.category === "wheels"), curated.wheels, market)
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

export interface SitemapProductEntry {
  slug: string
  markets: Market[]
}

const activeSitemapProducts = cache(() =>
  readDatabase(async (): Promise<SitemapProductEntry[]> => {
    const rows = await db
      .select({
        slug: products.slug,
        hasUs: sql<boolean>`(${products.data}->'offers'->'us') IS NOT NULL`,
        hasEu: sql<boolean>`(${products.data}->'offers'->'eu') IS NOT NULL`,
      })
      .from(products)
      .where(
        and(
          eq(products.archived, false),
          sql`COALESCE((${products.data}->>'sample')::boolean, false) = false`,
        ),
      )
      .orderBy(asc(products.createdAt))

    return rows.map((r) => {
      const m: Market[] = []
      if (r.hasUs) m.push("us")
      if (r.hasEu) m.push("eu")
      return { slug: r.slug, markets: m }
    })
  }),
)

export async function getSitemapProducts(market: Market): Promise<SitemapProductEntry[]> {
  const all = requireAvailable(await activeSitemapProducts())
  return all.filter((p) => p.markets.includes(market))
}
