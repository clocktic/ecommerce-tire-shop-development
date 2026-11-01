import type { Market } from "@/lib/markets"

const DEFAULT_BASE_URL = "https://gw.cgpaytech.com"

type CachedToken = {
  token: string
  expiresAtMs: number
}

let cachedToken: CachedToken | null = null

export type CgPayTechConfig = {
  baseUrl: string
  login: string
  password: string
  merchantId: string
  merchantWebsiteId: string
}

export function getCgPayTechConfig(market: Market): CgPayTechConfig | null {
  const login = process.env.CGPAYTECH_API_LOGIN?.trim()
  const password = process.env.CGPAYTECH_API_PASSWORD?.trim()
  const merchantId = process.env.CGPAYTECH_MERCHANT_ID?.trim()
  const marketWebsiteId =
    market === "us"
      ? process.env.CGPAYTECH_WEBSITE_ID_US?.trim()
      : process.env.CGPAYTECH_WEBSITE_ID_EU?.trim()
  const merchantWebsiteId = marketWebsiteId || process.env.CGPAYTECH_WEBSITE_ID?.trim()
  const baseUrl = (process.env.CGPAYTECH_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "")

  if (!login || !password || !merchantId || !merchantWebsiteId) {
    return null
  }

  return {
    baseUrl,
    login,
    password,
    merchantId,
    merchantWebsiteId,
  }
}

async function getBearerToken(cfg: CgPayTechConfig): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAtMs > now + 60_000) {
    return cachedToken.token
  }

  const res = await fetch(`${cfg.baseUrl}/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      login: cfg.login,
      password: cfg.password,
    }),
    signal: AbortSignal.timeout(5_000),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`CGPayTech /v1/token failed (${res.status}): ${errText.slice(0, 200)}`)
  }

  const data = (await res.json()) as { token?: string; expiresIn?: number }
  if (!data.token) {
    throw new Error("CGPayTech /v1/token response missing token")
  }

  const ttlSeconds = typeof data.expiresIn === "number" && data.expiresIn > 120 ? data.expiresIn - 120 : 82_800
  cachedToken = {
    token: data.token,
    expiresAtMs: now + ttlSeconds * 1000,
  }
  return data.token
}

export type CreateHostedPaymentInput = {
  market: Market
  lang: string
  orderNumber: string
  amountCents: number
  currency: "USD" | "EUR"
  email: string
  phone: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  state?: string
  countryIso2: string
  ipAddress: string
  origin: string
}

export type CreateHostedPaymentResult =
  | {
      ok: true
      paymentFormId: string
      forwardUrl: string
    }
  | {
      ok: false
      reason: string
    }

function asciiClean(value: string, maxLen: number): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLen)
}

export async function createCgPayTechPaymentForm(
  input: CreateHostedPaymentInput
): Promise<CreateHostedPaymentResult> {
  const cfg = getCgPayTechConfig(input.market)
  if (!cfg) {
    return { ok: false, reason: "not_configured" }
  }

  try {
    const token = await getBearerToken(cfg)
    const redirectUrl = `${input.origin}/${input.market}/${input.lang}/order/${encodeURIComponent(input.orderNumber)}`
    const webhookUrl = `${input.origin}/api/payments/cgpaytech/webhook`

    const payload = {
      MerchantInfo: {
        merchantId: cfg.merchantId,
        merchantWebsiteId: cfg.merchantWebsiteId,
        userName: asciiClean(input.email, 128) || input.orderNumber,
        externalId: input.orderNumber,
        refererUrl: `${input.origin}/${input.market}/${input.lang}/checkout`,
        websitePublicUrl: input.origin,
      },
      TransactionInfo: {
        description: asciiClean(`Order ${input.orderNumber}`, 128) || `Order ${input.orderNumber}`,
        amount: input.amountCents,
        currency: input.currency,
      },
      ThreeDInfo: {
        redirectUrl,
      },
      CustomerInfo: {
        email: input.email,
        ipAddress: input.ipAddress || "8.8.8.8",
        userLanguage: input.lang.slice(0, 2).toLowerCase(),
      },
      CustomerBillingInfo: {
        firstName: input.firstName.slice(0, 40),
        lastName: input.lastName.slice(0, 60),
        country: input.countryIso2,
        ...(input.state ? { state: input.state.slice(0, 128) } : {}),
        city: input.city.slice(0, 128),
        address: input.address.slice(0, 128),
        zip: input.postalCode.slice(0, 32),
        mobilePhone: input.phone.slice(0, 32),
      },
      CustomerShippingInfo: {
        firstName: input.firstName.slice(0, 40),
        lastName: input.lastName.slice(0, 60),
        country: input.countryIso2,
        ...(input.state ? { state: input.state.slice(0, 128) } : {}),
        city: input.city.slice(0, 128),
        address: input.address.slice(0, 128),
        zip: input.postalCode.slice(0, 32),
      },
      ConfigurationOptions: {
        paymentMethod: "credit-card",
      },
      Callbacks: {
        onSuccessUrl: webhookUrl,
        onFailUrl: webhookUrl,
      },
    }

    const res = await fetch(`${cfg.baseUrl}/v1/api/payment_form/configure`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error("[v0] CGPayTech payment_form/configure HTTP error:", res.status, errText)
      return { ok: false, reason: `http_${res.status}` }
    }

    const data = (await res.json()) as {
      status?: string
      paymentFormId?: string
      forwardUrl?: string
    }

    if (data.status === "redirect" && data.forwardUrl && data.paymentFormId) {
      return {
        ok: true,
        paymentFormId: data.paymentFormId,
        forwardUrl: data.forwardUrl,
      }
    }

    return { ok: false, reason: data.status || "invalid_response" }
  } catch (err) {
    console.error("[v0] CGPayTech payment form error:", err)
    return { ok: false, reason: "exception" }
  }
}

export async function syncCgPayTechOrderStatus(
  market: Market,
  orderNumber: string
): Promise<"paid" | "cancelled" | null> {
  const cfg = getCgPayTechConfig(market)
  if (!cfg) return null

  try {
    const token = await getBearerToken(cfg)
    const now = new Date()
    const from = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    const to = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().slice(0, 10)

    const url = `${cfg.baseUrl}/v1/api/reporting/search?dateFrom=${from}&dateTo=${to}&externalId=${encodeURIComponent(orderNumber)}`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        MerchantInfo: {
          merchantId: cfg.merchantId,
          merchantWebsiteId: cfg.merchantWebsiteId,
        },
      }),
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) return null
    const data = (await res.json()) as {
      results?: Array<{ status?: string }>
    }
    const items = Array.isArray(data.results) ? data.results : []
    for (const item of items) {
      const st = String(item.status || "").trim().toLowerCase()
      if (["success", "succeeded", "captured", "settled", "approved", "paid", "completed"].includes(st)) {
        return "paid"
      }
    }
    for (const item of items) {
      const st = String(item.status || "").trim().toLowerCase()
      if (["failed", "declined", "error", "expired", "canceled", "cancelled"].includes(st)) {
        return "cancelled"
      }
    }
    return null
  } catch {
    return null
  }
}

