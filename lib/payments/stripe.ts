import "server-only"

import type Stripe from "stripe"
import type { OrderRow } from "@/lib/db/schema"
import { parseStore, storePath, type Lang } from "@/lib/i18n/config"
import { confirmOrderPayment } from "@/lib/payments/confirm"
import { getStripeSecretKey, stripe } from "@/lib/stripe"

const STRIPE_LOCALE_MAP: Record<Lang, Stripe.Checkout.SessionCreateParams.Locale> = {
  en: "en",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
  nl: "nl",
}

export type StripeOrderItemInput = {
  quantity: number
  unitPriceCents: number
  brandName?: string | null
  productName: string
}

export function buildStripeLineItems(
  order: Pick<OrderRow, "orderNumber" | "currency" | "subtotalCents" | "shippingCents" | "totalCents">,
  items: StripeOrderItemInput[],
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const currency = order.currency.toLowerCase()
  const itemized = order.subtotalCents + order.shippingCents === order.totalCents && items.length > 0

  if (!itemized) {
    return [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: order.totalCents,
          product_data: { name: `Order ${order.orderNumber}` },
        },
      },
    ]
  }

  return [
    ...items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount: item.unitPriceCents,
        product_data: {
          name: item.brandName ? `${item.brandName} ${item.productName}` : item.productName,
        },
      },
    })),
    ...(order.shippingCents > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: order.shippingCents,
              product_data: { name: "Shipping" },
            },
          },
        ]
      : []),
  ]
}

function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey())
}

export async function createStripeCheckoutSession(input: {
  order: Pick<
    OrderRow,
    | "id"
    | "orderNumber"
    | "market"
    | "lang"
    | "email"
    | "currency"
    | "subtotalCents"
    | "shippingCents"
    | "totalCents"
  >
  items: StripeOrderItemInput[]
  origin: string
  idempotencySuffix?: string
}): Promise<{ ok: true; forwardUrl: string; sessionId: string } | { ok: false }> {
  if (!isStripeConfigured()) {
    return { ok: false }
  }

  const store = parseStore(input.order.market, input.order.lang)
  if (!store) return { ok: false }

  const lineItems = buildStripeLineItems(input.order, input.items)
  const orderUrl = `${input.origin}${storePath(store, `/order/${encodeURIComponent(input.order.orderNumber)}`)}`
  const locale = STRIPE_LOCALE_MAP[store.lang] ?? "auto"

  // Notice: we intentionally omit `payment_method_types` so Stripe Checkout
  // automatically displays every payment method enabled in the Stripe Dashboard
  // (Cards, Apple Pay, Google Pay, Link, Klarna, SEPA Debit, iDEAL, Bancontact, Affirm, etc.)
  // for the order's currency (USD for US, EUR for EU) and customer country without code changes.
  const baseParams: Stripe.Checkout.SessionCreateParams = {
    ui_mode: "hosted_page",
    mode: "payment",
    locale,
    billing_address_collection: "auto",
    phone_number_collection: { enabled: true },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
    submit_type: "auto",
    integration_identifier: "hosted_web_0001",
    origin_context: "web",
    customer_email: input.order.email,
    client_reference_id: input.order.orderNumber,
    metadata: {
      orderNumber: input.order.orderNumber,
      orderId: input.order.id,
      market: input.order.market,
    },
    payment_intent_data: {
      metadata: {
        orderNumber: input.order.orderNumber,
        orderId: input.order.id,
        market: input.order.market,
      },
    },
    line_items: lineItems,
    success_url: `${orderUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: orderUrl,
  }

  const keyBase = `checkout_${input.order.id}_${input.order.totalCents}${input.idempotencySuffix ? `_${input.idempotencySuffix}` : ""}`

  try {
    const session = await stripe.checkout.sessions.create(
      {
        ...baseParams,
        consent_collection: { terms_of_service: "required" },
      },
      { idempotencyKey: `${keyBase}_tos` },
    )
    if (session.url) {
      return { ok: true, forwardUrl: session.url, sessionId: session.id }
    }
  } catch (err) {
    // Fallback without consent_collection in case Terms of Service URL is not yet configured in Stripe Dashboard settings
    try {
      const fallbackSession = await stripe.checkout.sessions.create(baseParams, {
        idempotencyKey: `${keyBase}_notos`,
      })
      if (fallbackSession.url) {
        return { ok: true, forwardUrl: fallbackSession.url, sessionId: fallbackSession.id }
      }
    } catch (fallbackErr) {
      console.error("Stripe Checkout session creation failed:", fallbackErr ?? err)
    }
  }

  return { ok: false }
}

/**
 * Verifies a Stripe Checkout Session when a customer lands back on the order page
 * (`?session_id=cs_...`) so the order transitions to `paid` immediately even if the
 * webhook arrives a moment later.
 */
export async function syncStripeOrderStatus(
  orderNumber: string,
  sessionId?: string | null,
): Promise<"paid" | null> {
  if (!isStripeConfigured() || !sessionId || !sessionId.startsWith("cs_")) {
    return null
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const refOrder = session.metadata?.orderNumber ?? session.client_reference_id
    if (refOrder?.toUpperCase() !== orderNumber.toUpperCase()) {
      return null
    }
    if (session.payment_status === "paid") {
      const paymentIntent =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id
      await confirmOrderPayment({
        orderNumber,
        paymentMethod: "Stripe Checkout",
        transactionId: paymentIntent ?? session.id,
      })
      return "paid"
    }
  } catch (err) {
    console.error("Stripe session status sync failed:", err)
  }
  return null
}
