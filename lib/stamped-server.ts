import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { storePath, type Store } from "@/lib/i18n/config"
import { absoluteUrl } from "@/lib/seo"
import {
  STAMPED_PUBLIC_API_KEY,
  STAMPED_STORE_HASH,
  stampedProductId,
} from "@/lib/stamped"

const STAMPED_PRIVATE_API_KEY =
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
 * (`POST https://stamped.io/api/v2/{storeHash}/survey/reviews`).
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
      itemsList: items.map((item) => ({
        productId: stampedProductId(item.productSlug),
        productSKU: item.productSlug,
        productTitle: item.productName,
        productBrand: item.brandName || undefined,
        productPrice: Number((item.unitPriceCents / 100).toFixed(2)),
        productUrl: absoluteUrl(storePath(store, `/product/${item.productSlug}`)),
        productImageUrl: item.image ? absoluteUrl(item.image) : undefined,
      })),
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
