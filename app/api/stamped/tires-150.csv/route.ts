import { NextResponse } from "next/server"
import {
  buildStampedProductsCsv,
  loadActiveCatalogProducts,
  selectTopPopularByCategory,
} from "@/lib/stamped-export"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawMarket = searchParams.get("market")
  const explicitMarket = rawMarket === "eu" || rawMarket === "us" ? rawMarket : null

  const allProducts = await loadActiveCatalogProducts()
  const pool = explicitMarket
    ? allProducts.filter((p) => Boolean(p.offers?.[explicitMarket]))
    : allProducts

  const selected = selectTopPopularByCategory(pool, "tires", 150)
  const csv = buildStampedProductsCsv(selected, explicitMarket)
  const filename = explicitMarket
    ? `stamped-products-tires-150-${explicitMarket}.csv`
    : "stamped-products-tires-150.csv"

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
