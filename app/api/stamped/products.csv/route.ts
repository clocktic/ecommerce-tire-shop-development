import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { offerFor } from "@/lib/catalog"
import { absoluteUrl } from "@/lib/seo"
import { stampedProductId } from "@/lib/stamped"

export const dynamic = "force-dynamic"

function csvCell(value: string | number | undefined | null): string {
  const str = value == null ? "" : String(value).replace(/\r?\n/g, " ").trim()
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Stamped.io Product Catalog CSV feed (`/api/stamped/products.csv`).
 * Provides every active product with its deterministic numeric `productId`,
 * `productSKU` (slug), `productTitle`, `productBrand`, `productType`,
 * `productBarcode` (GTIN / MPN), `productPrice`, `productUrl`, `productImageUrl`,
 * and `productDescription`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const marketParam = searchParams.get("market") === "eu" ? "eu" : "us"

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.archived, false))

  const header = [
    "productId",
    "productSKU",
    "productHandle",
    "productTitle",
    "productBrand",
    "productType",
    "productBarcode",
    "productPrice",
    "productUrl",
    "productImageUrl",
    "productDescription",
  ].join(",")

  const lines: string[] = [header]

  for (const row of rows) {
    const p = row.data
    if (!p || p.sample) continue
    const offer = offerFor(p, marketParam) ?? offerFor(p, "us") ?? offerFor(p, "eu")
    const market = offer === offerFor(p, "eu") && !offerFor(p, marketParam) ? "eu" : marketParam
    const price = offer ? (offer.priceCents / 100).toFixed(2) : "0.00"
    const imageUrl = p.images?.[0] ? absoluteUrl(p.images[0]) : ""
    const productUrl = absoluteUrl(`/${market}/en/product/${p.slug}`)
    const barcode = p.gtin || p.mpn || p.supplierSku || ""

    lines.push(
      [
        csvCell(stampedProductId(p.slug)),
        csvCell(p.slug),
        csvCell(p.slug),
        csvCell(`${p.brand} ${p.name}`),
        csvCell(p.brand),
        csvCell(p.category),
        csvCell(barcode),
        csvCell(price),
        csvCell(productUrl),
        csvCell(imageUrl),
        csvCell(p.shortDescription || p.description),
      ].join(","),
    )
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stamped-products-${marketParam}.csv"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
