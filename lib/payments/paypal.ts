import "server-only"

import { eq, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { COMPANY } from "@/lib/company"
import { confirmOrderPayment } from "@/lib/payments/confirm"
import {
  PAYPAL_CLIENT_ID,
  PAYPAL_WEBHOOK_ID,
} from "@/lib/payments/paypal-config"

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com"

function getPayPalSecret(): string {
  return (
    process.env.PAYPAL_CLIENT_SECRET?.trim() ||
    process.env.API_KEY?.trim() ||
    ""
  )
}

function centsToDecimal(cents: number): string {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2)
}

export async function getPayPalAccessToken(): Promise<string | null> {
  const secret = getPayPalSecret()
  if (!PAYPAL_CLIENT_ID || !secret) return null

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${secret}`).toString("base64")
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

export async function createPayPalOrderForStoreOrder(
  orderNumber: string,
): Promise<{ ok: true; paypalOrderId: string } | { ok: false; error: string }> {
  const cleanNumber = orderNumber.trim()
  if (!cleanNumber) return { ok: false, error: "Missing order number" }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, cleanNumber))
    .limit(1)
  if (!order) return { ok: false, error: "Order not found" }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
  if (!items.length) return { ok: false, error: "Order has no items" }

  const accessToken = await getPayPalAccessToken()
  if (!accessToken) return { ok: false, error: "PayPal authentication failed" }

  const currency = order.currency.toUpperCase()
  const itemTotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  )
  const shippingCents = Math.max(0, order.shippingCents)
  const rawDiscountCents = Math.max(
    0,
    itemTotalCents + shippingCents - order.totalCents,
  )

  const breakdown: Record<string, { currency_code: string; value: string }> = {
    item_total: {
      currency_code: currency,
      value: centsToDecimal(itemTotalCents),
    },
    shipping: {
      currency_code: currency,
      value: centsToDecimal(shippingCents),
    },
  }
  if (rawDiscountCents > 0) {
    breakdown.discount = {
      currency_code: currency,
      value: centsToDecimal(rawDiscountCents),
    }
  }

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: order.orderNumber,
        custom_id: order.id,
        description: `${COMPANY.tradingName} Order ${order.orderNumber}`,
        amount: {
          currency_code: currency,
          value: centsToDecimal(order.totalCents),
          breakdown,
        },
        items: items.map((item) => ({
          name: item.productName.slice(0, 127),
          sku: item.productSlug.slice(0, 127),
          quantity: String(item.quantity),
          category: "PHYSICAL_GOODS",
          unit_amount: {
            currency_code: currency,
            value: centsToDecimal(item.unitPriceCents),
          },
        })),
        shipping: {
          name: {
            full_name: (order.shippingName || "Customer").slice(0, 300),
          },
          address: {
            address_line_1: (order.shippingAddress1 || "").slice(0, 300),
            admin_area_2: (order.shippingCity || "").slice(0, 120),
            ...(order.shippingRegion
              ? { admin_area_1: order.shippingRegion.slice(0, 120) }
              : {}),
            postal_code: (order.shippingPostalCode || "").slice(0, 60),
            country_code: (order.shippingCountry || "US").slice(0, 2).toUpperCase(),
          },
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: COMPANY.tradingName,
          shipping_preference: "SET_PROVIDED_ADDRESS",
          user_action: "PAY_NOW",
        },
      },
    },
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `${order.orderNumber}-${Date.now()}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const data = (await res.json()) as { id?: string; message?: string }
  if (!res.ok || !data.id) {
    return {
      ok: false,
      error: data.message || "Failed to create PayPal order",
    }
  }

  return { ok: true, paypalOrderId: data.id }
}

type PayPalOrderResponse = {
  id?: string
  status?: string
  details?: Array<{ issue?: string; description?: string }>
  purchase_units?: Array<{
    reference_id?: string
    custom_id?: string
    invoice_id?: string
    payments?: {
      captures?: Array<{
        id?: string
        status?: string
        amount?: { currency_code?: string; value?: string }
      }>
    }
  }>
}

export async function capturePayPalOrder(
  paypalOrderId: string,
  fallbackOrderNumber?: string,
): Promise<
  | { ok: true; orderNumber: string; captureId: string }
  | { ok: false; restart?: boolean; error: string }
> {
  const cleanPayPalId = paypalOrderId.trim()
  if (!cleanPayPalId) return { ok: false, error: "Missing PayPal order ID" }

  const accessToken = await getPayPalAccessToken()
  if (!accessToken) return { ok: false, error: "PayPal authentication failed" }

  let res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(cleanPayPalId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  )

  let data = (await res.json()) as PayPalOrderResponse
  const issue = data.details?.[0]?.issue

  if (issue === "INSTRUMENT_DECLINED") {
    return {
      ok: false,
      restart: true,
      error: data.details?.[0]?.description || "Payment instrument declined",
    }
  }

  if (!res.ok && issue === "ORDER_ALREADY_CAPTURED") {
    res = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(cleanPayPalId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    )
    data = (await res.json()) as PayPalOrderResponse
  }

  const unit = data.purchase_units?.[0]
  const capture = unit?.payments?.captures?.[0]
  const isCompleted =
    data.status === "COMPLETED" &&
    (!capture?.status || capture.status === "COMPLETED")

  if (!isCompleted) {
    return {
      ok: false,
      error: data.details?.[0]?.description || "PayPal capture did not complete",
    }
  }

  const candidateNumber =
    unit?.invoice_id || unit?.reference_id || fallbackOrderNumber?.trim() || ""
  const candidateId = unit?.custom_id || ""

  const conditions = []
  if (candidateNumber) conditions.push(eq(orders.orderNumber, candidateNumber))
  if (candidateId) conditions.push(eq(orders.id, candidateId))
  if (!conditions.length) {
    return { ok: false, error: "Store order reference missing in PayPal capture" }
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(conditions.length === 1 ? conditions[0] : or(...conditions))
    .limit(1)

  if (!order) {
    return { ok: false, error: "Store order not found for PayPal capture" }
  }

  if (capture?.amount?.value) {
    const capturedCents = Math.round(Number.parseFloat(capture.amount.value) * 100)
    const capturedCurrency = (capture.amount.currency_code || "").toUpperCase()
    if (
      capturedCents !== order.totalCents ||
      capturedCurrency !== order.currency.toUpperCase()
    ) {
      return { ok: false, error: "Captured amount or currency mismatch" }
    }
  }

  const captureId = capture?.id || cleanPayPalId
  await confirmOrderPayment({
    orderId: order.id,
    paymentMethod: "PayPal",
    transactionId: captureId,
  })

  return {
    ok: true,
    orderNumber: order.orderNumber,
    captureId,
  }
}

export async function verifyPayPalWebhookSignature(
  headers: Headers,
  event: Record<string, unknown>,
): Promise<boolean> {
  const authAlgo = headers.get("paypal-auth-algo")
  const certUrl = headers.get("paypal-cert-url")
  const transmissionId = headers.get("paypal-transmission-id")
  const transmissionSig = headers.get("paypal-transmission-sig")
  const transmissionTime = headers.get("paypal-transmission-time")

  if (
    !authAlgo ||
    !certUrl ||
    !transmissionId ||
    !transmissionSig ||
    !transmissionTime ||
    !PAYPAL_WEBHOOK_ID
  ) {
    return false
  }

  const accessToken = await getPayPalAccessToken()
  if (!accessToken) return false

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      }),
      cache: "no-store",
    },
  )

  if (!res.ok) return false
  const data = (await res.json()) as { verification_status?: string }
  return data.verification_status === "SUCCESS"
}

export async function handlePayPalWebhookEvent(event: {
  event_type?: string
  resource?: {
    id?: string
    custom_id?: string
    invoice_id?: string
    supplementary_data?: {
      related_ids?: {
        order_id?: string
      }
    }
  }
}): Promise<{ ok: boolean }> {
  const eventType = event.event_type || ""
  const resource = event.resource || {}

  if (
    (eventType === "CHECKOUT.ORDER.APPROVED" ||
      eventType === "CHECKOUT.ORDER.COMPLETED") &&
    resource.id
  ) {
    const res = await capturePayPalOrder(resource.id)
    return { ok: res.ok }
  }

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const relatedOrderId = resource.supplementary_data?.related_ids?.order_id
    if (relatedOrderId) {
      const res = await capturePayPalOrder(
        relatedOrderId,
        resource.invoice_id || undefined,
      )
      return { ok: res.ok }
    }

    if (resource.id && (resource.custom_id || resource.invoice_id)) {
      const accessToken = await getPayPalAccessToken()
      if (!accessToken) return { ok: false }

      const verifyRes = await fetch(
        `${PAYPAL_API_BASE}/v2/payments/captures/${encodeURIComponent(resource.id)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      )
      if (!verifyRes.ok) return { ok: false }

      const capture = (await verifyRes.json()) as {
        id?: string
        status?: string
        custom_id?: string
        invoice_id?: string
        amount?: { currency_code?: string; value?: string }
      }
      if (capture.status !== "COMPLETED") return { ok: false }

      const conds = []
      const cid = capture.custom_id || resource.custom_id
      const inv = capture.invoice_id || resource.invoice_id
      if (cid) conds.push(eq(orders.id, cid))
      if (inv) conds.push(eq(orders.orderNumber, inv))
      if (!conds.length) return { ok: false }

      const [order] = await db
        .select()
        .from(orders)
        .where(conds.length === 1 ? conds[0] : or(...conds))
        .limit(1)
      if (!order) return { ok: false }

      if (capture.amount?.value) {
        const cents = Math.round(Number.parseFloat(capture.amount.value) * 100)
        const cur = (capture.amount.currency_code || "").toUpperCase()
        if (cents !== order.totalCents || cur !== order.currency.toUpperCase()) {
          return { ok: false }
        }
      }

      await confirmOrderPayment({
        orderId: order.id,
        paymentMethod: "PayPal",
        transactionId: capture.id || resource.id,
      })
      return { ok: true }
    }
  }

  return { ok: true }
}

