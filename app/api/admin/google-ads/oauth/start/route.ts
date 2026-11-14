import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import { buildGoogleAdsOAuthUrl } from "@/lib/google-ads"

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  const origin = req.nextUrl.origin
  const redirectUri = `${origin}/api/admin/google-ads/oauth/callback`
  const state = crypto.randomUUID()

  const authUrl = buildGoogleAdsOAuthUrl(redirectUri, state)
  const res = NextResponse.redirect(authUrl)
  res.cookies.set("gads_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  })
  return res
}
