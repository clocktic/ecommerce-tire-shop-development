import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { parseStore, storePath } from "@/lib/i18n/config"
import { createStripeCheckoutSession } from "@/lib/payments/stripe"

// Return URLs follow the host the shopper is on (e.g. firewheels.vercel.app today,
// the custom domain later), so no config change is needed when the domain moves.
function siteOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
    return `${proto}://${host}`
  }
  return new URL(request.url).origin
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const orderNumber = String(form?.get("orderNumber") ?? "").trim().slice(0, 40)
  if (!orderNumber) return NextResponse.json({ error: "Missing order number" }, { status: 400 })

  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order || order.status !== "pending") {
    return NextResponse.json({ error: "Order not payable" }, { status: 404 })
  }
  const store = parseStore(order.market, order.lang)
  if (!store) return NextResponse.json({ error: "Invalid store" }, { status: 400 })

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const origin = siteOrigin(request)

  const session = await createStripeCheckoutSession({
    order,
    items,
    origin,
    idempotencySuffix: String(Math.floor(Date.now() / 60000)),
  })

  if (!session.ok) {
    return NextResponse.redirect(`${origin}${storePath(store, `/order/${encodeURIComponent(order.orderNumber)}`)}`, 303)
  }
  return NextResponse.redirect(session.forwardUrl, 303)
}
