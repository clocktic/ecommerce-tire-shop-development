import "server-only"

import crypto from "node:crypto"
import { eq } from "drizzle-orm"
import { COMPANY } from "@/lib/company"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { confirmOrderPayment } from "@/lib/payments/confirm"

export const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN?.trim() || "cfb47b-14.myshopify.com"

export const SHOPIFY_CLIENT_ID =
  process.env.SHOPIFY_CLIENT_ID?.trim() || "8c073c556a1151e05ae309bcfed62883"

const SHOPIFY_API_VERSION = "2025-01"

function getShopifySecret(): string {
  return (
    process.env.SHOPIFY_SHARED_SECRET?.trim() ||
    process.env.SHOPIFY_CLIENT_SECRET?.trim() ||
    ""
  )
}

function centsToDecimal(cents: number): string {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2)
}

let cachedAdminToken: { token: string; expiresAt: number } | null = null

export async function getShopifyAdminAccessToken(): Promise<string | null> {
  const explicitToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()
  if (explicitToken) return explicitToken

  if (cachedAdminToken && Date.now() < cachedAdminToken.expiresAt) {
    return cachedAdminToken.token
  }

  const secret = getShopifySecret()
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_CLIENT_ID || !secret) {
    return null
  }

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: secret,
      }),
      cache: "no-store",
    },
  )

  if (!res.ok) return null

  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
  }
  if (!data.access_token) return null

  const ttlSeconds = Math.max(300, (data.expires_in ?? 86400) - 300)
  cachedAdminToken = {
    token: data.access_token,
    expiresAt: Date.now() + ttlSeconds * 1000,
  }
  return data.access_token
}

function splitFullName(fullName: string): {
  firstName: string
  lastName: string
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "Customer", lastName: "Order" }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

function withOnlineStoreChannel(invoiceUrl: string): string {
  try {
    const url = new URL(invoiceUrl)
    url.searchParams.set("channel", "online_store")
    return url.toString()
  } catch {
    const sep = invoiceUrl.includes("?") ? "&" : "?"
    return `${invoiceUrl}${sep}channel=online_store`
  }
}

async function runDraftOrderCreate(
  accessToken: string,
  input: Record<string, unknown>,
): Promise<{
  invoiceUrl?: string
  draftOrderId?: string
  errorMessage?: string
}> {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `mutation CreateDraftOrder($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
              name
              invoiceUrl
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: { input },
      }),
      cache: "no-store",
    },
  )

  if (!res.ok) {
    return { errorMessage: `Shopify HTTP ${res.status}` }
  }

  const json = (await res.json()) as {
    data?: {
      draftOrderCreate?: {
        draftOrder?: { id?: string; invoiceUrl?: string } | null
        userErrors?: Array<{ message?: string }>
      }
    }
    errors?: Array<{ message?: string }>
  }

  const draft = json.data?.draftOrderCreate?.draftOrder
  if (draft?.invoiceUrl) {
    return {
      invoiceUrl: withOnlineStoreChannel(draft.invoiceUrl),
      draftOrderId: draft.id,
    }
  }

  const errMsg =
    json.data?.draftOrderCreate?.userErrors?.[0]?.message ||
    json.errors?.[0]?.message ||
    "Could not create Shopify draft order"
  return { errorMessage: errMsg }
}

export async function createShopifyCheckoutSession(
  orderNumber: string,
): Promise<
  | { ok: true; forwardUrl: string; draftOrderId?: string }
  | { ok: false; error: string }
> {
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

  const accessToken = await getShopifyAdminAccessToken()
  if (!accessToken) {
    return { ok: false, error: "Shopify authentication failed" }
  }

  const { firstName, lastName } = splitFullName(order.shippingName || "Customer")
  const itemTotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  )
  const shippingCents = Math.max(0, order.shippingCents)
  const discountCents = Math.max(
    0,
    itemTotalCents + shippingCents - order.totalCents,
  )

  const buildInputForCurrency = (currencyCode: string) => {
    const input: Record<string, unknown> = {
      note: `${COMPANY.tradingName} Order ${order.orderNumber}`,
      email: order.email,
      presentmentCurrencyCode: currencyCode,
      customAttributes: [
        { key: "orderNumber", value: order.orderNumber },
        { key: "orderId", value: order.id },
        { key: "market", value: order.market },
      ],
      shippingLine: {
        title: "Standard Shipping",
        priceWithCurrency: {
          amount: centsToDecimal(shippingCents),
          currencyCode,
        },
      },
      shippingAddress: {
        firstName: firstName.slice(0, 100),
        lastName: lastName.slice(0, 100),
        address1: (order.shippingAddress1 || "").slice(0, 200),
        city: (order.shippingCity || "").slice(0, 100),
        ...(order.shippingRegion
          ? { provinceCode: order.shippingRegion.slice(0, 50) }
          : {}),
        zip: (order.shippingPostalCode || "").slice(0, 40),
        countryCode: (order.shippingCountry || "US").slice(0, 2).toUpperCase(),
        ...(order.phone ? { phone: order.phone.slice(0, 40) } : {}),
      },
      lineItems: items.map((item) => ({
        title: (item.brandName
          ? `${item.brandName} ${item.productName}`
          : item.productName
        ).slice(0, 250),
        quantity: item.quantity,
        originalUnitPriceWithCurrency: {
          amount: centsToDecimal(item.unitPriceCents),
          currencyCode,
        },
        taxable: false,
        requiresShipping: true,
      })),
    }

    if (discountCents > 0) {
      input.appliedDiscount = {
        title: "Member Discount",
        value: Number(centsToDecimal(discountCents)),
        valueType: "FIXED_AMOUNT",
        amountWithCurrency: {
          amount: centsToDecimal(discountCents),
          currencyCode,
        },
      }
    }

    return input
  }

  const preferredCurrency = order.currency.toUpperCase()
  let attempt = await runDraftOrderCreate(
    accessToken,
    buildInputForCurrency(preferredCurrency),
  )

  if (
    !attempt.invoiceUrl &&
    preferredCurrency !== "USD" &&
    attempt.errorMessage?.toLowerCase().includes("currency")
  ) {
    attempt = await runDraftOrderCreate(accessToken, buildInputForCurrency("USD"))
  }

  if (!attempt.invoiceUrl) {
    return {
      ok: false,
      error: attempt.errorMessage || "Failed to create Shopify checkout URL",
    }
  }

  return {
    ok: true,
    forwardUrl: attempt.invoiceUrl,
    draftOrderId: attempt.draftOrderId,
  }
}

export function verifyShopifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null,
): boolean {
  const secret = getShopifySecret()
  if (!secret || !hmacHeader) return false

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64")

  const a = Buffer.from(digest, "utf8")
  const b = Buffer.from(hmacHeader.trim(), "utf8")
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function handleShopifyOrderPaidWebhook(payload: {
  id?: number | string
  order_number?: number | string
  financial_status?: string
  note?: string | null
  note_attributes?: Array<{ name?: string; value?: string }>
}): Promise<{ ok: boolean }> {
  let orderNumber = ""

  if (Array.isArray(payload.note_attributes)) {
    const attr = payload.note_attributes.find(
      (a) => a.name === "orderNumber" && typeof a.value === "string",
    )
    if (attr?.value) {
      orderNumber = attr.value.trim()
    }
  }

  if (!orderNumber && typeof payload.note === "string") {
    const match = payload.note.match(/TS-(?:US|EU)-[A-Z0-9]+/i)
    if (match) orderNumber = match[0].toUpperCase()
  }

  if (!orderNumber) return { ok: true }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1)
  if (!order) return { ok: false }

  await confirmOrderPayment({
    orderId: order.id,
    paymentMethod: "Shopify Checkout",
    transactionId: String(payload.id || payload.order_number || orderNumber),
  })

  return { ok: true }
}
