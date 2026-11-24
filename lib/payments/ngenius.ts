import "server-only"

import crypto from "node:crypto"
import { eq, ilike } from "drizzle-orm"
import { COMPANY } from "@/lib/company"
import { db } from "@/lib/db"
import { orders, type OrderRow } from "@/lib/db/schema"
import { confirmOrderPayment } from "@/lib/payments/confirm"

export const NGENIUS_CHECKOUT_ENABLED = true

const DEFAULT_API_URL = "https://api-gateway.ngenius-payments.com"
const FALLBACK_EUR_AED_RATE = 3.95
const PAID_STATES = new Set(["PURCHASED", "CAPTURED", "AUTHORISED"])

function getNgeniusConfig() {
  const apiKey = process.env.NGENIUS_API_KEY?.trim() || ""
  const outletRef = process.env.NGENIUS_OUTLET_REF?.trim() || ""
  const apiUrl = (process.env.NGENIUS_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "")
  const webhookSecret = process.env.NGENIUS_WEBHOOK_SECRET?.trim() || ""
  return { apiKey, outletRef, apiUrl, webhookSecret }
}

export function isNgeniusConfigured(): boolean {
  const { apiKey, outletRef } = getNgeniusConfig()
  return Boolean(NGENIUS_CHECKOUT_ENABLED && apiKey && outletRef)
}

export function extractNgeniusOrderRef(notes: string | null | undefined): string | null {
  if (!notes) return null
  const m = notes.match(/ngenius_order_ref=([^\s;]+)/)
  return m?.[1] || null
}

export function extractNgeniusAedMinorUnits(notes: string | null | undefined): number | null {
  if (!notes) return null
  const m = notes.match(/ngenius_aed_minor_units=(\d+)/)
  if (!m?.[1]) return null
  const n = Number(m[1])
  return Number.isSafeInteger(n) && n > 0 ? n : null
}

function upsertNoteKey(notes: string | null | undefined, key: string, value: string): string {
  const cleaned = (notes || "")
    .split(/\s*;\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !part.startsWith(`${key}=`))
  cleaned.push(`${key}=${value}`)
  return cleaned.join("; ")
}

export async function getNgeniusAccessToken(): Promise<string | null> {
  const { apiKey, apiUrl } = getNgeniusConfig()
  if (!apiKey) return null

  const res = await fetch(`${apiUrl}/identity/auth/access-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.ni-identity.v1+json",
      Accept: "application/vnd.ni-identity.v1+json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({ grant_type: "client_credentials" }),
    cache: "no-store",
  })

  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token || null
}

/**
 * Ask N-Genius Forex/MCP API for its exact AED -> EUR conversion rate so that when
 * paypage.ngenius-payments.com/v2 converts AED back into EUR for European buyers,
 * the displayed EUR amount matches order.totalCents to the cent.
 */
export async function convertEurCentsViaNgeniusMcp(
  eurCents: number,
  accessToken: string,
): Promise<number | null> {
  const { outletRef, apiUrl } = getNgeniusConfig()
  if (!outletRef || eurCents <= 0) return null

  try {
    const probeAedMinor = Math.max(10000, eurCents * 4)
    const res = await fetch(`${apiUrl}/forex/outlets/${encodeURIComponent(outletRef)}/forex-lookup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/vnd.ni.forex.v1+json",
        Accept: "application/vnd.ni.forex.v1+json",
      },
      body: JSON.stringify({
        currencyCodeFrom: "AED",
        payerIpAddress: "185.15.56.1",
        amount: probeAedMinor,
        targetCurrency: ["EUR"],
      }),
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      targetCurrencies?: Array<{ currencyCodeTo?: string; conversionRate?: number | string }>
      conversionRate?: number | string
      rates?: Array<{ currencyCode?: string; conversionRate?: number | string }>
      _embedded?: {
        rates?: Array<{ currencyCode?: string; conversionRate?: number | string }>
      }
    }

    const rateCandidate =
      data.targetCurrencies?.find((c) => c.currencyCodeTo === "EUR")?.conversionRate ??
      data.conversionRate ??
      data.rates?.find((r) => r.currencyCode === "EUR")?.conversionRate ??
      data._embedded?.rates?.find((r) => r.currencyCode === "EUR")?.conversionRate

    const aedToEurRate = Number(rateCandidate)
    if (!Number.isFinite(aedToEurRate) || aedToEurRate <= 0.1 || aedToEurRate >= 1) {
      return null
    }
    return Math.max(100, Math.round(eurCents / aedToEurRate))
  } catch {
    return null
  }
}

async function fetchFallbackEurToAedRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", { cache: "no-store" })
    if (res.ok) {
      const data = (await res.json()) as { rates?: { AED?: number } }
      const rate = Number(data.rates?.AED)
      if (Number.isFinite(rate) && rate > 2 && rate < 10) return rate
    }
  } catch {
    // Fall through to secondary rate provider.
  }

  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json",
      { cache: "no-store" },
    )
    if (res.ok) {
      const data = (await res.json()) as { eur?: { aed?: number } }
      const rate = Number(data.eur?.aed)
      if (Number.isFinite(rate) && rate > 2 && rate < 10) return rate
    }
  } catch {
    // Fall through to static fallback rate.
  }

  return FALLBACK_EUR_AED_RATE
}

export async function convertEurCentsToAed(
  eurCents: number,
  accessToken: string,
): Promise<number> {
  const mcpMinor = await convertEurCentsViaNgeniusMcp(eurCents, accessToken)
  if (mcpMinor !== null) return mcpMinor
  const rate = await fetchFallbackEurToAedRate()
  return Math.max(100, Math.round(eurCents * rate))
}

function splitName(fullName: string | null | undefined): { firstName: string; lastName: string } {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "Customer", lastName: "Customer" }
  if (parts.length === 1) return { firstName: parts[0].slice(0, 60), lastName: parts[0].slice(0, 60) }
  return {
    firstName: parts[0].slice(0, 60),
    lastName: parts.slice(1).join(" ").slice(0, 60),
  }
}

export type NgeniusOrderPayload = {
  reference?: string
  state?: string
  merchantOrderReference?: string
  amount?: { currencyCode?: string; value?: number }
  _links?: {
    payment?: { href?: string }
  }
  _embedded?: {
    payment?: Array<{
      reference?: string
      state?: string
      amount?: { currencyCode?: string; value?: number }
    }>
  }
}

export async function createNgeniusHostedOrder(
  orderNumber: string,
): Promise<
  | { ok: true; forwardUrl: string; orderRef: string; aedMinorUnits: number }
  | { ok: false; error: string }
> {
  if (!isNgeniusConfigured()) {
    return { ok: false, error: "N-Genius payment gateway is not configured" }
  }

  const cleanNumber = orderNumber.trim().toUpperCase()
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, cleanNumber))
    .limit(1)

  if (!order) return { ok: false, error: "Order not found" }
  if (order.market !== "eu") return { ok: false, error: "N-Genius is only available for EU orders" }
  if (order.status === "paid") return { ok: false, error: "Order is already paid" }
  if (order.totalCents <= 0) return { ok: false, error: "Invalid order amount" }

  const accessToken = await getNgeniusAccessToken()
  if (!accessToken) return { ok: false, error: "N-Genius authentication failed" }

  const aedMinorUnits = await convertEurCentsToAed(order.totalCents, accessToken)
  const { outletRef, apiUrl } = getNgeniusConfig()
  const { firstName, lastName } = splitName(order.shippingName)
  const baseUrl = COMPANY.url.replace(/\/$/, "")
  const lang = order.lang || "en"
  const redirectUrl = `${baseUrl}/eu/${encodeURIComponent(lang)}/order/${encodeURIComponent(order.orderNumber)}`

  const billingAddress: Record<string, string> = {}
  if (firstName) billingAddress.firstName = firstName.slice(0, 45)
  if (lastName) billingAddress.lastName = lastName.slice(0, 45)
  if (order.shippingAddress1) billingAddress.address1 = order.shippingAddress1.slice(0, 100)
  if (order.shippingCity) billingAddress.city = order.shippingCity.slice(0, 50)

  const payload = {
    action: "PURCHASE",
    amount: {
      currencyCode: "AED",
      value: aedMinorUnits,
    },
    merchantOrderReference: order.orderNumber,
    emailAddress: order.email,
    ...(Object.keys(billingAddress).length > 0 ? { billingAddress } : {}),
    merchantAttributes: {
      redirectUrl,
      skipConfirmationPage: true,
    },
  }

  const res = await fetch(
    `${apiUrl}/transactions/outlets/${encodeURIComponent(outletRef)}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/vnd.ni-payment.v2+json",
        Accept: "application/vnd.ni-payment.v2+json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  )

  const data = (await res.json().catch(() => ({}))) as NgeniusOrderPayload & {
    message?: string
  }

  const paymentUrl = typeof data._links?.payment?.href === "string" ? data._links.payment.href.trim() : ""
  const orderRef = typeof data.reference === "string" ? data.reference.trim() : ""

  if (!res.ok || !paymentUrl.startsWith("https://") || !orderRef) {
    return {
      ok: false,
      error: data.message || "Failed to create N-Genius payment session",
    }
  }

  let nextNotes = upsertNoteKey(order.notes, "ngenius_order_ref", orderRef)
  nextNotes = upsertNoteKey(nextNotes, "ngenius_aed_minor_units", String(aedMinorUnits))

  await db
    .update(orders)
    .set({ notes: nextNotes, updatedAt: new Date() })
    .where(eq(orders.id, order.id))

  return { ok: true, forwardUrl: paymentUrl, orderRef, aedMinorUnits }
}

export async function getNgeniusOrderStatus(orderRef: string): Promise<NgeniusOrderPayload | null> {
  const { outletRef, apiUrl } = getNgeniusConfig()
  if (!outletRef || !orderRef.trim()) return null

  const accessToken = await getNgeniusAccessToken()
  if (!accessToken) return null

  const res = await fetch(
    `${apiUrl}/transactions/outlets/${encodeURIComponent(outletRef)}/orders/${encodeURIComponent(orderRef.trim())}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.ni-payment.v2+json",
      },
      cache: "no-store",
    },
  )

  if (!res.ok) return null
  return (await res.json().catch(() => null)) as NgeniusOrderPayload | null
}

export async function getOrderByNgeniusRef(orderRef: string): Promise<OrderRow | null> {
  const cleanRef = orderRef.trim()
  if (!cleanRef) return null
  const [row] = await db
    .select()
    .from(orders)
    .where(ilike(orders.notes, `%ngenius_order_ref=${cleanRef}%`))
    .limit(1)
  return row ?? null
}

export async function applyNgeniusPaymentUpdate(
  order: OrderRow,
  ngeniusOrder: NgeniusOrderPayload,
): Promise<{ paid: boolean; state: string | null }> {
  const payments = ngeniusOrder._embedded?.payment ?? []
  const paidPayment = payments.find((p) => p.state && PAID_STATES.has(p.state.toUpperCase()))
  const topState = ngeniusOrder.state?.toUpperCase() || null
  const isPaid = Boolean(paidPayment) || Boolean(topState && PAID_STATES.has(topState))
  const latestState = paidPayment?.state || payments[0]?.state || ngeniusOrder.state || null

  if (!isPaid) {
    return { paid: false, state: latestState }
  }

  // Verify paid currency and amount before confirming.
  const paidAmount = paidPayment?.amount ?? ngeniusOrder.amount
  const paidCurrency = paidAmount?.currencyCode?.toUpperCase()
  const paidValue = Number(paidAmount?.value)

  if (!Number.isFinite(paidValue) || paidValue <= 0) {
    return { paid: false, state: latestState }
  }

  if (paidCurrency === "EUR") {
    if (Math.abs(paidValue - order.totalCents) > 2) {
      return { paid: false, state: "AMOUNT_MISMATCH" }
    }
  } else if (paidCurrency === "AED") {
    const expectedAed = extractNgeniusAedMinorUnits(order.notes)
    if (expectedAed) {
      const tolerance = Math.max(50, Math.round(expectedAed * 0.02))
      if (Math.abs(paidValue - expectedAed) > tolerance) {
        return { paid: false, state: "AMOUNT_MISMATCH" }
      }
    }
  } else {
    return { paid: false, state: "CURRENCY_MISMATCH" }
  }

  await confirmOrderPayment({
    orderId: order.id,
    paymentMethod: "Card (N-Genius)",
    transactionId: paidPayment?.reference || ngeniusOrder.reference || null,
  })

  return { paid: true, state: latestState }
}

export async function syncNgeniusOrderStatus(
  orderOrNumber: OrderRow | string,
): Promise<{ ok: boolean; status: string | null }> {
  const order =
    typeof orderOrNumber === "string"
      ? (
          await db
            .select()
            .from(orders)
            .where(eq(orders.orderNumber, orderOrNumber.trim().toUpperCase()))
            .limit(1)
        )[0]
      : orderOrNumber

  if (!order) return { ok: false, status: null }
  if (order.status === "paid") return { ok: true, status: "paid" }

  const orderRef = extractNgeniusOrderRef(order.notes)
  if (!orderRef || !isNgeniusConfigured()) {
    return { ok: false, status: order.status }
  }

  const ngeniusOrder = await getNgeniusOrderStatus(orderRef)
  if (!ngeniusOrder) return { ok: false, status: order.status }

  const result = await applyNgeniusPaymentUpdate(order, ngeniusOrder)
  return { ok: true, status: result.paid ? "paid" : order.status }
}

export function verifyNgeniusWebhookSecret(request: Request): boolean {
  const { webhookSecret } = getNgeniusConfig()
  if (!webhookSecret) return true

  const headerSecret = request.headers.get("x-webhook-secret")?.trim() || ""
  const authHeader = request.headers.get("authorization")?.trim() || ""
  const bearerSecret = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : ""
  const candidate = headerSecret || bearerSecret
  if (!candidate) return false

  const a = Buffer.from(candidate)
  const b = Buffer.from(webhookSecret)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
