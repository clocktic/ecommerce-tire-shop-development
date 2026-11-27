import "server-only"

import crypto from "node:crypto"
import { ilike } from "drizzle-orm"
import { COMPANY } from "@/lib/company"
import { db } from "@/lib/db"
import { orders, type OrderRow } from "@/lib/db/schema"
import { confirmOrderPayment } from "@/lib/payments/confirm"

export const ZEN_CHECKOUT_ENABLED = true

const DEFAULT_API_URL = "https://zendashboard.com"
const DEFAULT_DBA_ID = 410310
const DEFAULT_TERMINAL_ID = 959430

type ZenThreedsOption = "Required" | "RequiredIfAvailable" | "Disabled"

function getZenConfig() {
  const apiToken = process.env.ZEN_API_TOKEN?.trim() || ""
  const dbaId = Number(process.env.ZEN_DBA_ID?.trim() || DEFAULT_DBA_ID)
  const terminalId = Number(process.env.ZEN_TERMINAL_ID?.trim() || DEFAULT_TERMINAL_ID)
  const webhookSignature = process.env.ZEN_WEBHOOK_SIGNATURE?.trim() || ""
  const apiUrl = (process.env.ZEN_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, "")
  const rawThreeds = process.env.ZEN_THREEDS?.trim()
  const threeds: ZenThreedsOption =
    rawThreeds === "Required" || rawThreeds === "Disabled" || rawThreeds === "RequiredIfAvailable"
      ? rawThreeds
      : "RequiredIfAvailable"

  return { apiToken, dbaId, terminalId, webhookSignature, apiUrl, threeds }
}

export function isZenConfigured(): boolean {
  const { apiToken, dbaId, terminalId } = getZenConfig()
  return Boolean(ZEN_CHECKOUT_ENABLED && apiToken && Number.isFinite(dbaId) && Number.isFinite(terminalId))
}

function buildHostedFormBody(
  order: OrderRow,
  dbaId: number,
  terminalId: number,
  threeds: ZenThreedsOption,
) {
  const amount = Number((order.totalCents / 100).toFixed(2))
  const returnUrl = `${COMPANY.url}/api/payments/zen/return?order=${encodeURIComponent(order.orderNumber)}`

  const billingInfo: Record<string, string> = {
    country: (order.shippingCountry || "US").toUpperCase(),
    address: order.shippingAddress1 || "",
    city: order.shippingCity || "",
  }
  if (order.shippingRegion) billingInfo.state = order.shippingRegion
  if (order.shippingPostalCode) billingInfo.zip = order.shippingPostalCode

  return {
    dba: { id: dbaId },
    terminal: { id: terminalId },
    threeds,
    amount,
    externalId: order.orderNumber,
    origin: "WEB",
    returnUrl,
    returnUrlNavigation: "top",
    useLogo: "Yes",
    visibleNote: "No",
    requestContactInfo: "Yes",
    requestBillingInfo: "Yes",
    sendReceipt: "Yes",
    contactInfo: {
      name: order.shippingName || "",
      email: order.email || "",
      phone: order.phone || "",
    },
    billingInfo,
  }
}

async function requestZenHostedForm(
  apiUrl: string,
  apiToken: string,
  payload: Record<string, unknown>,
): Promise<{ status: number; data: Record<string, unknown> | null; rawText: string }> {
  const res = await fetch(`${apiUrl}/api/gateway/hosted-form`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  const rawText = await res.text()
  let data: Record<string, unknown> | null = null
  try {
    data = JSON.parse(rawText) as Record<string, unknown>
  } catch {
    data = null
  }
  return { status: res.status, data, rawText }
}

export async function createZenHostedForm(
  orderNumber: string,
): Promise<{ ok: true; forwardUrl: string } | { ok: false; error: string }> {
  const cfg = getZenConfig()
  if (!ZEN_CHECKOUT_ENABLED || !cfg.apiToken) {
    return { ok: false, error: "Zen Payments is not configured" }
  }

  const normalized = orderNumber.trim()
  if (!normalized) {
    return { ok: false, error: "Missing order number" }
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(ilike(orders.orderNumber, normalized))
    .limit(1)

  if (!order) {
    return { ok: false, error: "Order not found" }
  }

  if (order.status === "paid" || order.status === "cancelled") {
    return { ok: false, error: "Order cannot be paid" }
  }

  if (order.totalCents <= 0) {
    return { ok: false, error: "Invalid order total" }
  }

  let response = await requestZenHostedForm(
    cfg.apiUrl,
    cfg.apiToken,
    buildHostedFormBody(order, cfg.dbaId, cfg.terminalId, cfg.threeds),
  )

  // If 3DS is not yet enabled on the terminal in Zen Dashboard, fall back to Disabled
  // so customers can still pay; once Zen activates 3DS on the terminal it will engage automatically.
  if (
    response.status === 422 &&
    cfg.threeds !== "Disabled" &&
    /3ds/i.test(String(response.data?.message || response.rawText))
  ) {
    response = await requestZenHostedForm(
      cfg.apiUrl,
      cfg.apiToken,
      buildHostedFormBody(order, cfg.dbaId, cfg.terminalId, "Disabled"),
    )
  }

  if (response.status < 200 || response.status >= 300) {
    const message = String(response.data?.message || response.rawText || "Zen Hosted Form failed").slice(0, 200)
    console.error("[zen] hosted-form failed:", response.status, message)
    return { ok: false, error: message }
  }

  const forwardUrl = typeof response.data?.url === "string" ? response.data.url.trim() : ""
  if (!forwardUrl) {
    console.error("[zen] hosted-form returned no url:", response.rawText.slice(0, 300))
    return { ok: false, error: "Zen Payments did not return a hosted form URL" }
  }

  return { ok: true, forwardUrl }
}

export type ZenWebhookPayload = {
  id?: string | number
  module?: string
  action?: string
  date?: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Zen Payments signs webhook events with SHA-512 of:
 *   <webhookSignature><id><module><action><date>
 * sent in the `Webhook-Signature` HTTP header.
 */
export function verifyZenWebhookSignature(
  headerSignature: string | null,
  payload: ZenWebhookPayload,
): boolean {
  const { webhookSignature } = getZenConfig()
  if (!webhookSignature) return false
  if (!headerSignature) return false

  const id = payload.id != null ? String(payload.id) : ""
  const mod = typeof payload.module === "string" ? payload.module : ""
  const action = typeof payload.action === "string" ? payload.action : ""
  const date = typeof payload.date === "string" ? payload.date : ""

  const expected = crypto
    .createHash("sha512")
    .update(`${webhookSignature}${id}${mod}${action}${date}`)
    .digest("hex")
    .toLowerCase()

  const received = headerSignature.trim().toLowerCase()
  if (expected.length !== received.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"))
  } catch {
    return false
  }
}

function isApprovedTransaction(data: Record<string, unknown>): boolean {
  const type = String(data.type ?? data.transactionType ?? "").toLowerCase()
  if (type.includes("refund") || type.includes("void") || type.includes("chargeback")) {
    return false
  }

  const status = String(data.status ?? data.result ?? data.state ?? "").toLowerCase()
  const responseText = String(data.responseText ?? data.message ?? data.statusMessage ?? "").toLowerCase()
  const responseCode = String(data.responseCode ?? data.code ?? "").trim()

  if (
    status.includes("declin") ||
    status.includes("fail") ||
    status.includes("error") ||
    status.includes("reject") ||
    status.includes("cancel") ||
    status.includes("void") ||
    status.includes("refund")
  ) {
    return false
  }

  if (
    status === "approved" ||
    status === "success" ||
    status === "succeeded" ||
    status === "captured" ||
    status === "settled" ||
    status === "completed" ||
    status === "authorized" ||
    status === "authorised" ||
    data.approved === true ||
    responseText.includes("approved") ||
    responseCode === "00" ||
    responseCode === "1" ||
    responseCode === "100"
  ) {
    return true
  }

  // If status is empty on a transaction.create event and not explicitly declined/error
  return status === "" && !data.error
}

export async function processZenWebhook(payload: ZenWebhookPayload): Promise<{
  ok: boolean
  handled: boolean
  reason?: string
}> {
  const mod = String(payload.module ?? "").toLowerCase()
  const action = String(payload.action ?? "").toLowerCase()

  if (mod !== "transaction" || action !== "create") {
    return { ok: true, handled: false, reason: `Ignored event ${mod}.${action}` }
  }

  const data = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<
    string,
    unknown
  >

  const nestedTx =
    data.transaction && typeof data.transaction === "object"
      ? (data.transaction as Record<string, unknown>)
      : null

  const tx = nestedTx ?? data

  if (!isApprovedTransaction(tx)) {
    return { ok: true, handled: false, reason: "Transaction not approved" }
  }

  const externalId = String(
    tx.externalId ??
      data.externalId ??
      (data.order && typeof data.order === "object"
        ? (data.order as Record<string, unknown>).externalId
        : "") ??
      "",
  ).trim()

  if (!externalId) {
    return { ok: true, handled: false, reason: "No externalId on transaction" }
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(ilike(orders.orderNumber, externalId))
    .limit(1)

  if (!order) {
    return { ok: true, handled: false, reason: "Order not found" }
  }

  const rawAmount = tx.amount ?? data.amount
  if (rawAmount !== undefined && rawAmount !== null && rawAmount !== "") {
    const parsedAmount = Number(rawAmount)
    if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
      const paidCents = Math.round(parsedAmount * 100)
      if (Math.abs(paidCents - order.totalCents) > 5) {
        return { ok: true, handled: false, reason: "Amount mismatch" }
      }
    }
  }

  const transactionId = String(tx.id ?? tx.transactionId ?? payload.id ?? "").trim() || null

  await confirmOrderPayment({
    orderId: order.id,
    paymentMethod: "Card (Zen Payments)",
    transactionId,
  })

  return { ok: true, handled: true }
}
