import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { parseStore, storePath } from "@/lib/i18n/config"
import { stripe } from "@/lib/stripe"

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

  // Amounts come from the stored order (computed server-side at placement), never from the client.
  const currency = order.currency.toLowerCase()
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const itemized = order.subtotalCents + order.shippingCents === order.totalCents
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = itemized
    ? [
        ...items.map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency,
            unit_amount: i.unitPriceCents,
            product_data: { name: i.brandName ? `${i.brandName} ${i.productName}` : i.productName },
          },
        })),
        ...(order.shippingCents > 0
          ? [{ quantity: 1, price_data: { currency, unit_amount: order.shippingCents, product_data: { name: "Shipping" } } }]
          : []),
      ]
    : [
        {
          quantity: 1,
          price_data: { currency, unit_amount: order.totalCents, product_data: { name: `Order ${order.orderNumber}` } },
        },
      ]

  const origin = siteOrigin(request)
  const orderUrl = `${origin}${storePath(store, `/order/${encodeURIComponent(order.orderNumber)}`)}`

  const session = await stripe.checkout.sessions.create(
    {
      ui_mode: "hosted_page",
      mode: "payment",
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      submit_type: "auto",
      consent_collection: { terms_of_service: "required" },
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
      customer_email: order.email,
      client_reference_id: order.orderNumber,
      metadata: { orderNumber: order.orderNumber, orderId: order.id },
      payment_intent_data: { metadata: { orderNumber: order.orderNumber } },
      line_items: lineItems,
      success_url: `${orderUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: orderUrl,
    },
    { idempotencyKey: `checkout_${order.id}_${order.totalCents}` },
  )

  if (!session.url) return NextResponse.json({ error: "No checkout URL" }, { status: 502 })
  return NextResponse.redirect(session.url, 303)
}
