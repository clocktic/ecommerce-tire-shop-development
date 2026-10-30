import "server-only"

import { cache } from "react"
import { and, asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import type { Category, Product } from "@/lib/catalog/types"
import type { Market } from "@/lib/markets"

// Storefront reads: archived products are hidden everywhere (pages, sitemap, feeds).
const activeProducts = cache(async (): Promise<Product[]> => {
  const rows = await db
    .select({ data: products.data })
    .from(products)
    .where(eq(products.archived, false))
    .orderBy(asc(products.createdAt))
  return rows.map((r) => r.data)
})

export async function getProducts(market: Market): Promise<Product[]> {
  return (await activeProducts()).filter((p) => p.offers[market])
}

export async function getProductsByCategory(market: Market, category: Category): Promise<Product[]> {
  return (await getProducts(market)).filter((p) => p.category === category)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await db.select({ data: products.data }).from(products)
    .where(and(eq(products.archived, false), eq(products.slug, slug))).limit(1)
  return row?.data
}
