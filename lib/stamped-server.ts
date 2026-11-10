import "server-only"

import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders, products } from "@/lib/db/schema"
import { storePath, type Store } from "@/lib/i18n/config"
import { absoluteUrl, publicImageUrl } from "@/lib/seo"
import {
  STAMPED_PUBLIC_API_KEY,
  STAMPED_STORE_HASH,
  stampedProductId,
} from "@/lib/stamped"

export const STAMPED_PRIVATE_API_KEY =
  process.env.STAMPED_API_KEY_PRIVATE ||
  "86dea2047b1b741252ab2c321e8a6d81ac25ffc3ca125d98e44158e50c46613f"

function splitCustomerName(fullName?: string | null): { firstName: string; lastName: string } {
  const trimmed = (fullName ?? "").trim()
  if (!trimmed) return { firstName: "Customer", lastName: "" }
  const parts = trimmed.split(/\s+/)
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" "),
  }
}

/**
 * Pushes an order into Stamped.io's Review Request queue via the Stamped REST API v2
 * (`POST https://stamped.io/api/v2/{storeHash}/survey/reviews`), enriched with full
 * product catalog metadata (description, brand, category, GTIN/MPN barcode, tags)
 * so Stamped registers the products in its Products catalog and Google Shopping Product Ratings.
 * Safe to call from payment confirmation or shipment/fulfillment handlers; never throws.
 */
export async function pushOrderToStamped(options: {
  orderId?: string
  orderNumber?: string
}): Promise<boolean> {
  try {
    if (!STAMPED_PUBLIC_API_KEY || !STAMPED_PRIVATE_API_KEY || !STAMPED_STORE_HASH) {
      return false
    }

    const whereClause = options.orderId
      ? eq(orders.id, options.orderId)
      : options.orderNumber
        ? eq(orders.orderNumber, options.orderNumber)
        : null
    if (!whereClause) return false

    const [order] = await db.select().from(orders).where(whereClause).limit(1)
    if (!order || !order.email) return false

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
    if (!items.length) return false

    const slugs = Array.from(new Set(items.map((i) => i.productSlug).filter(Boolean)))
    const productRows = slugs.length
      ? await db.select().from(products).where(inArray(products.slug, slugs))
      : []
    const productBySlug = new Map(productRows.map((row) => [row.slug, row.data]))

    const store: Store = {
      market: order.market === "eu" ? "eu" : "us",
      lang: (order.lang || "en") as Store["lang"],
    }
    const { firstName, lastName } = splitCustomerName(order.shippingName)

    const payload = {
      email: order.email,
      firstName,
      lastName,
      location: order.shippingCountry || (store.market === "us" ? "US" : "DE"),
      phoneNumber: order.phone || "",
      orderNumber: order.orderNumber,
      orderId: order.orderNumber,
      orderCurrencyISO: order.currency.toUpperCase(),
      orderTotalPrice: Number((order.totalCents / 100).toFixed(2)),
      orderSource: "TiresShop",
      orderDate: (order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt)).toISOString(),
      locale: store.lang,
      itemsList: items.map((item) => {
        const catalogProduct = productBySlug.get(item.productSlug)
        const imageSource = item.image || catalogProduct?.images?.[0]
        const seasonTag =
          catalogProduct?.category === "tires" ? catalogProduct.tire.season : undefined
        const tags = [catalogProduct?.category, catalogProduct?.brand || item.brandName, seasonTag]
          .filter(Boolean)
          .join(", ")

        return {
          productId: stampedProductId(item.productSlug),
          productSKU: item.productSlug,
          productTitle: item.productName,
          productDescription:
            catalogProduct?.shortDescription ||
            catalogProduct?.description ||
            item.productName,
          productBrand: item.brandName || catalogProduct?.brand || undefined,
          productType: catalogProduct?.category || undefined,
          productBarcode:
            catalogProduct?.gtin || catalogProduct?.mpn || catalogProduct?.supplierSku || undefined,
          productTags: tags || undefined,
          productPrice: Number((item.unitPriceCents / 100).toFixed(2)),
          productUrl: absoluteUrl(storePath(store, `/product/${item.productSlug}`)),
          productImageUrl: imageSource ? publicImageUrl(imageSource) : undefined,
        }
      }),
    }

    const basicAuth = Buffer.from(
      `${STAMPED_PUBLIC_API_KEY}:${STAMPED_PRIVATE_API_KEY}`,
    ).toString("base64")

    const response = await fetch(
      `https://stamped.io/api/v2/${encodeURIComponent(STAMPED_STORE_HASH)}/survey/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    return response.ok
  } catch {
    return false
  }
}
