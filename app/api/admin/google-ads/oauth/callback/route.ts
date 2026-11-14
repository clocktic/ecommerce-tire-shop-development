import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import { exchangeCodeForRefreshToken, saveGoogleAdsSettings } from "@/lib/google-ads"

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")
  const origin = req.nextUrl.origin
  const redirectUri = `${origin}/api/admin/google-ads/oauth/callback`

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/admin/google-ads?oauth_error=${encodeURIComponent(error || "missing_code")}`,
        origin,
      ),
    )
  }

  try {
    const { refreshToken, email } = await exchangeCodeForRefreshToken(code, redirectUri)
    await saveGoogleAdsSettings({
      ...(refreshToken ? { refreshToken } : {}),
      connectedEmail: email,
    })
    return NextResponse.redirect(new URL("/admin/google-ads?connected=1", origin))
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_exchange_failed"
    return NextResponse.redirect(
      new URL(`/admin/google-ads?oauth_error=${encodeURIComponent(message)}`, origin),
    )
  }
}
