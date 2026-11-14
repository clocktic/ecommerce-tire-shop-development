import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { googleAdsConfig } from "@/lib/db/schema"

const GOOGLE_ADS_API_VERSION = "v19"
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`

export type GoogleAdsSettings = {
  customerId: string
  loginCustomerId: string
  developerToken: string
  merchantId: string
  refreshToken: string
  connectedEmail: string | null
  hasOAuthClient: boolean
  clientIdPreview: string
  isReady: boolean
}

export type GoogleAdsCampaignSummary = {
  id: string
  resourceName: string
  name: string
  status: "ENABLED" | "PAUSED" | "REMOVED" | string
  channelType: string
  budgetResourceName: string
  dailyBudgetCents: number
  impressions: number
  clicks: number
  costCents: number
  conversions: number
  conversionsValue: number
}

export type GoogleAdsOverview = {
  accountName: string
  customerId: string
  currencyCode: string
  timeZone: string
  campaigns: GoogleAdsCampaignSummary[]
}

export function cleanCustomerId(raw?: string | null): string {
  return (raw ?? "").replace(/[^0-9]/g, "")
}

export function formatCustomerId(raw?: string | null): string {
  const digits = cleanCustomerId(raw)
  if (digits.length !== 10) return digits
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export async function getGoogleOAuthClient() {
  let dbClientId = ""
  let dbClientSecret = ""
  try {
    const rows = await db
      .select({
        oauthClientId: googleAdsConfig.oauthClientId,
        oauthClientSecret: googleAdsConfig.oauthClientSecret,
      })
      .from(googleAdsConfig)
      .where(eq(googleAdsConfig.id, "default"))
      .limit(1)
    dbClientId = (rows[0]?.oauthClientId ?? "").trim()
    dbClientSecret = (rows[0]?.oauthClientSecret ?? "").trim()
  } catch {
    // Fallback to env vars if columns are not available
  }

  const clientId = dbClientId || (process.env.GOOGLE_CLIENT_ID ?? "").trim()
  const clientSecret =
    dbClientSecret || (process.env.GOOGLE_CLIENT_SECRET ?? process.env.Secret ?? "").trim()
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
  }
}

export async function getGoogleAdsSettings(): Promise<GoogleAdsSettings> {
  let row: typeof googleAdsConfig.$inferSelect | undefined
  try {
    const rows = await db
      .select()
      .from(googleAdsConfig)
      .where(eq(googleAdsConfig.id, "default"))
      .limit(1)
    row = rows[0]
  } catch {
    row = undefined
  }
  const oauthClientId = (row?.oauthClientId || process.env.GOOGLE_CLIENT_ID || "").trim()
  const oauthClientSecret = (
    row?.oauthClientSecret ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.Secret ||
    ""
  ).trim()
  const oauth = {
    clientId: oauthClientId,
    clientSecret: oauthClientSecret,
    configured: Boolean(oauthClientId && oauthClientSecret),
  }

  const customerId = cleanCustomerId(row?.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID)
  const loginCustomerId = cleanCustomerId(
    row?.loginCustomerId || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  )
  const developerToken = (
    row?.developerToken ||
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
    ""
  ).trim()
  const merchantId = (
    row?.merchantId ||
    process.env.GOOGLE_MERCHANT_CENTER_ID ||
    "5900416726"
  ).trim()
  const refreshToken = (row?.refreshToken || process.env.GOOGLE_ADS_REFRESH_TOKEN || "").trim()

  return {
    customerId,
    loginCustomerId,
    developerToken,
    merchantId,
    refreshToken,
    connectedEmail: row?.connectedEmail ?? null,
    hasOAuthClient: oauth.configured,
    clientIdPreview: oauth.clientId ? `${oauth.clientId.slice(0, 14)}...` : "не задан",
    isReady: Boolean(
      oauth.configured &&
        (customerId.length === 10 || loginCustomerId.length === 10) &&
        refreshToken,
    ),
  }
}

export async function saveGoogleAdsSettings(input: {
  customerId?: string
  loginCustomerId?: string
  developerToken?: string
  merchantId?: string
  refreshToken?: string
  connectedEmail?: string | null
}) {
  const current = await getGoogleAdsSettings()
  const customerId =
    input.customerId !== undefined ? cleanCustomerId(input.customerId) : current.customerId
  const loginCustomerId =
    input.loginCustomerId !== undefined
      ? cleanCustomerId(input.loginCustomerId)
      : current.loginCustomerId
  const developerToken =
    input.developerToken !== undefined ? input.developerToken.trim() : current.developerToken
  const merchantId =
    input.merchantId !== undefined
      ? input.merchantId.replace(/[^0-9]/g, "") || "5900416726"
      : current.merchantId
  const refreshToken =
    input.refreshToken !== undefined ? input.refreshToken.trim() : current.refreshToken
  const connectedEmail =
    input.connectedEmail !== undefined ? input.connectedEmail : current.connectedEmail

  await db
    .insert(googleAdsConfig)
    .values({
      id: "default",
      customerId,
      loginCustomerId,
      developerToken,
      merchantId,
      refreshToken,
      connectedEmail,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: googleAdsConfig.id,
      set: {
        customerId,
        loginCustomerId,
        developerToken,
        merchantId,
        refreshToken,
        connectedEmail,
        updatedAt: new Date(),
      },
    })
}

export async function buildGoogleAdsOAuthUrl(redirectUri: string, state: string): Promise<string> {
  const { clientId } = await getGoogleOAuthClient()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/adwords openid email",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForRefreshToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = await getGoogleOAuthClient()
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string
    refresh_token?: string
    error?: string
    error_description?: string
  }
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(
      tokenJson.error_description || tokenJson.error || "Ошибка обмена OAuth-кода Google Ads",
    )
  }

  let email: string | null = null
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    })
    if (userRes.ok) {
      const userJson = (await userRes.json()) as { email?: string }
      email = userJson.email ?? null
    }
  } catch {
    email = null
  }

  return {
    accessToken: tokenJson.access_token,
    refreshToken: tokenJson.refresh_token ?? "",
    email,
  }
}

async function getAccessToken(refreshToken: string): Promise<string> {
  const { clientId, clientSecret } = await getGoogleOAuthClient()
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })
  const data = (await res.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Не удалось обновить access_token Google Ads. Переподключите OAuth.",
    )
  }
  return data.access_token
}

async function googleAdsRequest<T>(
  path: string,
  body: Record<string, unknown>,
  settings?: GoogleAdsSettings,
  targetCustomerId?: string,
): Promise<T> {
  const cfg = settings ?? (await getGoogleAdsSettings())
  const cid = cleanCustomerId(targetCustomerId || cfg.customerId || cfg.loginCustomerId)
  if (!cid || cid.length !== 10) {
    throw new Error("Укажите 10-значный Customer ID аккаунта Google Ads")
  }
  if (!cfg.refreshToken) {
    throw new Error("Сначала авторизуйте Google Ads через OAuth или укажите Refresh Token")
  }

  const accessToken = await getAccessToken(cfg.refreshToken)
  const makeHeaders = (includeDevToken: boolean): Record<string, string> => {
    const h: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }
    if (includeDevToken && cfg.developerToken) {
      h["developer-token"] = cfg.developerToken
    }
    if (cfg.loginCustomerId && cfg.loginCustomerId.length === 10) {
      h["login-customer-id"] = cfg.loginCustomerId
    }
    return h
  }

  let res = await fetch(`${GOOGLE_ADS_BASE_URL}/customers/${cid}/${path}`, {
    method: "POST",
    headers: makeHeaders(Boolean(cfg.developerToken)),
    body: JSON.stringify(body),
    cache: "no-store",
  })

  // Since Google Ads API is transitioning away from requiring developer tokens
  // when managed in Cloud Console, retry without developer-token if test-token restriction triggers.
  if (!res.ok && cfg.developerToken) {
    const firstJson = await res.clone().json().catch(() => ({}))
    const firstErr = JSON.stringify(firstJson)
    if (
      firstErr.includes("DEVELOPER_TOKEN_NOT_APPROVED") ||
      firstErr.includes("DEVELOPER_TOKEN")
    ) {
      const retryRes = await fetch(`${GOOGLE_ADS_BASE_URL}/customers/${cid}/${path}`, {
        method: "POST",
        headers: makeHeaders(false),
        body: JSON.stringify(body),
        cache: "no-store",
      })
      if (retryRes.ok) {
        res = retryRes
      }
    }
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errMsg =
      json?.error?.details?.[0]?.errors?.[0]?.message ||
      json?.error?.message ||
      `Google Ads API HTTP ${res.status}`
    throw new Error(errMsg)
  }
  return json as T
}

export async function autoDiscoverCustomerId(settings?: GoogleAdsSettings): Promise<string> {
  const cfg = settings ?? (await getGoogleAdsSettings())
  if (cfg.customerId && cfg.customerId.length === 10) return cfg.customerId
  if (!cfg.loginCustomerId || cfg.loginCustomerId.length !== 10 || !cfg.refreshToken) {
    return cfg.customerId
  }

  try {
    const clientQuery = `
      SELECT
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.manager,
        customer_client.status
      FROM customer_client
      WHERE customer_client.manager = FALSE AND customer_client.status = 'ENABLED'
      LIMIT 10
    `
    const data = await googleAdsRequest<{
      results?: Array<{
        customerClient?: {
          id?: string | number
          descriptiveName?: string
          manager?: boolean
        }
      }>
    }>("googleAds:search", { query: clientQuery }, cfg, cfg.loginCustomerId)

    const foundId = cleanCustomerId(String(data.results?.[0]?.customerClient?.id ?? ""))
    if (foundId.length === 10) {
      await saveGoogleAdsSettings({ customerId: foundId })
      return foundId
    }
  } catch {
    // Fallback to loginCustomerId if child lookup fails
  }
  return cfg.customerId || cfg.loginCustomerId
}

export async function fetchGoogleAdsOverview(): Promise<GoogleAdsOverview> {
  let cfg = await getGoogleAdsSettings()
  if (!cfg.customerId && cfg.loginCustomerId) {
    const discovered = await autoDiscoverCustomerId(cfg)
    cfg = { ...cfg, customerId: discovered }
  }
  const customerQuery = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.currency_code,
      customer.time_zone
    FROM customer
    LIMIT 1
  `
  const customerData = await googleAdsRequest<{
    results?: Array<{
      customer?: {
        id?: string
        descriptiveName?: string
        currencyCode?: string
        timeZone?: string
      }
    }>
  }>("googleAds:search", { query: customerQuery }, cfg)

  const cust = customerData.results?.[0]?.customer

  const campaignQuery = `
    SELECT
      campaign.id,
      campaign.resource_name,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.resource_name,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.id DESC
    LIMIT 50
  `
  const campaignData = await googleAdsRequest<{
    results?: Array<{
      campaign?: {
        id?: string
        resourceName?: string
        name?: string
        status?: string
        advertisingChannelType?: string
      }
      campaignBudget?: {
        resourceName?: string
        amountMicros?: string | number
      }
      metrics?: {
        impressions?: string | number
        clicks?: string | number
        costMicros?: string | number
        conversions?: string | number
        conversionsValue?: string | number
      }
    }>
  }>("googleAds:search", { query: campaignQuery }, cfg)

  const campaigns: GoogleAdsCampaignSummary[] = (campaignData.results ?? []).map((row) => {
    const amountMicros = Number(row.campaignBudget?.amountMicros ?? 0)
    const costMicros = Number(row.metrics?.costMicros ?? 0)
    return {
      id: String(row.campaign?.id ?? ""),
      resourceName: String(row.campaign?.resourceName ?? ""),
      name: String(row.campaign?.name ?? "Без названия"),
      status: String(row.campaign?.status ?? "PAUSED"),
      channelType: String(row.campaign?.advertisingChannelType ?? "UNKNOWN"),
      budgetResourceName: String(row.campaignBudget?.resourceName ?? ""),
      dailyBudgetCents: Math.round(amountMicros / 10_000),
      impressions: Number(row.metrics?.impressions ?? 0),
      clicks: Number(row.metrics?.clicks ?? 0),
      costCents: Math.round(costMicros / 10_000),
      conversions: Number(row.metrics?.conversions ?? 0),
      conversionsValue: Number(row.metrics?.conversionsValue ?? 0),
    }
  })

  return {
    accountName: cust?.descriptiveName || `Google Ads ${formatCustomerId(cfg.customerId)}`,
    customerId: formatCustomerId(cust?.id || cfg.customerId),
    currencyCode: cust?.currencyCode || "USD",
    timeZone: cust?.timeZone || "America/Los_Angeles",
    campaigns,
  }
}

export async function setGoogleAdsCampaignStatus(
  campaignResourceName: string,
  status: "ENABLED" | "PAUSED",
) {
  await googleAdsRequest("campaigns:mutate", {
    operations: [
      {
        updateMask: "status",
        update: {
          resourceName: campaignResourceName,
          status,
        },
      },
    ],
  })
}

export async function updateGoogleAdsCampaignBudget(
  budgetResourceName: string,
  dailyBudgetDollars: number,
) {
  const amountMicros = Math.max(1, Math.round(dailyBudgetDollars * 1_000_000))
  await googleAdsRequest("campaignBudgets:mutate", {
    operations: [
      {
        updateMask: "amount_micros",
        update: {
          resourceName: budgetResourceName,
          amountMicros: String(amountMicros),
        },
      },
    ],
  })
}

export async function createUsStandardShoppingCampaign(input: {
  name: string
  dailyBudgetDollars: number
  cpcBidDollars: number
  startPaused?: boolean
}) {
  const cfg = await getGoogleAdsSettings()
  const customerId = cfg.customerId
  const merchantId = Number(cfg.merchantId || "5900416726")
  const amountMicros = Math.max(1_000_000, Math.round(input.dailyBudgetDollars * 1_000_000))
  const cpcMicros = Math.max(100_000, Math.round(input.cpcBidDollars * 1_000_000))
  const suffix = Date.now().toString().slice(-6)

  // 1) Create CampaignBudget
  const budgetRes = await googleAdsRequest<{
    results?: Array<{ resourceName?: string }>
  }>(
    "campaignBudgets:mutate",
    {
      operations: [
        {
          create: {
            name: `${input.name} Budget #${suffix}`,
            amountMicros: String(amountMicros),
            deliveryMethod: "STANDARD",
            explicitlyShared: false,
          },
        },
      ],
    },
    cfg,
  )
  const budgetResourceName = budgetRes.results?.[0]?.resourceName
  if (!budgetResourceName) {
    throw new Error("Не удалось создать бюджет кампании в Google Ads")
  }

  // 2) Create Standard Shopping Campaign linked to GMC
  const campaignRes = await googleAdsRequest<{
    results?: Array<{ resourceName?: string }>
  }>(
    "campaigns:mutate",
    {
      operations: [
        {
          create: {
            name: input.name,
            advertisingChannelType: "SHOPPING",
            status: input.startPaused ? "PAUSED" : "ENABLED",
            campaignBudget: budgetResourceName,
            manualCpc: {
              enhancedCpcEnabled: false,
            },
            shoppingSetting: {
              merchantId,
              salesCountry: "US",
              campaignPriority: 0,
              enableLocal: false,
            },
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: true,
              targetContentNetwork: false,
              targetPartnerSearchNetwork: false,
            },
          },
        },
      ],
    },
    cfg,
  )
  const campaignResourceName = campaignRes.results?.[0]?.resourceName
  if (!campaignResourceName) {
    throw new Error("Не удалось создать Shopping-кампанию")
  }

  // 3) Target United States (geoTargetConstant 2840)
  await googleAdsRequest(
    "campaignCriteria:mutate",
    {
      operations: [
        {
          create: {
            campaign: campaignResourceName,
            location: {
              geoTargetConstant: "geoTargetConstants/2840",
            },
          },
        },
      ],
    },
    cfg,
  )

  // 4) Create Shopping Product AdGroup
  const adGroupRes = await googleAdsRequest<{
    results?: Array<{ resourceName?: string }>
  }>(
    "adGroups:mutate",
    {
      operations: [
        {
          create: {
            name: `${input.name} · All Products`,
            campaign: campaignResourceName,
            type: "SHOPPING_PRODUCT_ADS",
            status: "ENABLED",
            cpcBidMicros: String(cpcMicros),
          },
        },
      ],
    },
    cfg,
  )
  const adGroupResourceName = adGroupRes.results?.[0]?.resourceName
  if (adGroupResourceName) {
    // 5) Create Product Shopping Ad + All Products listing group root unit
    await googleAdsRequest(
      "adGroupAds:mutate",
      {
        operations: [
          {
            create: {
              adGroup: adGroupResourceName,
              status: "ENABLED",
              ad: {
                productAd: {},
              },
            },
          },
        ],
      },
      cfg,
    ).catch(() => {})

    await googleAdsRequest(
      "adGroupCriteria:mutate",
      {
        operations: [
          {
            create: {
              adGroup: adGroupResourceName,
              status: "ENABLED",
              cpcBidMicros: String(cpcMicros),
              listingGroup: {
                type: "UNIT",
              },
            },
          },
        ],
      },
      cfg,
    ).catch(() => {})
  }

  return {
    customerId,
    campaignResourceName,
  }
}
