import { headers } from "next/headers"
import { isAdmin } from "@/lib/admin-auth"
import { COMPANY } from "@/lib/company"
import {
  fetchGoogleAdsOverview,
  getGoogleAdsSettings,
  type GoogleAdsOverview,
} from "@/lib/google-ads"
import { GoogleAdsManager } from "@/components/admin/google-ads-manager"

export default async function AdminGoogleAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; oauth_error?: string }>
}) {
  if (!(await isAdmin())) return null

  const sp = await searchParams
  const hdrs = await headers()
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || COMPANY.domain
  const proto = hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")
  const callbackUrl = `${proto}://${host}/api/admin/google-ads/oauth/callback`

  const settings = await getGoogleAdsSettings()
  let overview: GoogleAdsOverview | null = null
  let apiError: string | null = null

  if (settings.isReady) {
    try {
      overview = await fetchGoogleAdsOverview()
    } catch (err) {
      apiError = err instanceof Error ? err.message : "Ошибка запроса к Google Ads API"
    }
  }

  return (
    <GoogleAdsManager
      settings={settings}
      overview={overview}
      apiError={apiError}
      oauthConnected={sp.connected === "1"}
      oauthError={sp.oauth_error ?? null}
      callbackUrl={callbackUrl}
    />
  )
}
