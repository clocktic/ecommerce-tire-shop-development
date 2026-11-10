import { NextResponse } from "next/server"
import type { Category } from "@/lib/catalog"
import {
  buildStampedProductsCsv,
  loadActiveCatalogProducts,
  selectTopPopularByCategory,
} from "@/lib/stamped-export"

export const dynamic = "force-dynamic"

/**
 * Stamped.io Product Catalog CSV feed (`/api/stamped/products.csv`).
 * Supports:
 * - `/api/stamped/products.csv` -> all active products (6,485)
 * - `/api/stamped/products.csv?preset=top450` -> 150 tires + 150 wheels + 150 brakes by popularity
 * - `/api/stamped/products.csv?category=tires&limit=150` -> top N popular products for a category
 * - `&market=us` or `&market=eu` -> market-specific URLs & prices
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawMarket = searchParams.get("market")
  const explicitMarket = rawMarket === "eu" || rawMarket === "us" ? rawMarket : null
  const preset = searchParams.get("preset")
  const rawCat = searchParams.get("category")
  const category: Category | null =
    rawCat === "tires" || rawCat === "wheels" || rawCat === "brakes" ? rawCat : null
  const limitParam = Number.parseInt(searchParams.get("limit") || "", 10)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : null

  const allProducts = await loadActiveCatalogProducts()
  const marketFiltered = explicitMarket
    ? allProducts.filter((p) => Boolean(p.offers?.[explicitMarket]))
    : allProducts

  let selected = marketFiltered
  let filename = explicitMarket
    ? `stamped-products-${explicitMarket}.csv`
    : "stamped-products.csv"

  if (preset === "top450") {
    const perCat = limit ?? 150
    selected = [
      ...selectTopPopularByCategory(marketFiltered, "tires", perCat),
      ...selectTopPopularByCategory(marketFiltered, "wheels", perCat),
      ...selectTopPopularByCategory(marketFiltered, "brakes", perCat),
    ]
    filename = explicitMarket
      ? `stamped-products-top-450-${explicitMarket}.csv`
      : "stamped-products-top-450.csv"
  } else if (category) {
    selected = selectTopPopularByCategory(
      marketFiltered,
      category,
      limit ?? marketFiltered.length,
    )
    const suffix = limit ? `-${limit}` : ""
    const mkt = explicitMarket ? `-${explicitMarket}` : ""
    filename = `stamped-products-${category}${suffix}${mkt}.csv`
  }

  const csv = buildStampedProductsCsv(selected, explicitMarket)

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
