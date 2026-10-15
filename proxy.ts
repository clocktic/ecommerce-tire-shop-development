import { NextResponse, type NextRequest } from "next/server"
import { GEO_COOKIE, MARKET_COOKIE, defaultMarket, isMarket, marketFromCountry, markets } from "@/lib/markets"

const YEAR = 60 * 60 * 24 * 365

// Only unprefixed URLs are redirected. /us/* and /eu/* are always served as-is
// so crawlers (Googlebot crawls from the US) and shared links reach both stores.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const country = request.headers.get("x-vercel-ip-country")
  const geoMarket = marketFromCountry(country) ?? defaultMarket

  const prefixed = markets.find((m) => pathname === `/${m}` || pathname.startsWith(`/${m}/`))
  if (prefixed) {
    const response = NextResponse.next()
    if (request.cookies.get(GEO_COOKIE)?.value !== geoMarket) {
      response.cookies.set(GEO_COOKIE, geoMarket, { path: "/", maxAge: YEAR, sameSite: "lax" })
    }
    return response
  }

  const chosen = request.cookies.get(MARKET_COOKIE)?.value
  const target = isMarket(chosen) ? chosen : geoMarket

  const url = request.nextUrl.clone()
  url.pathname = `/${target}${pathname === "/" ? "" : pathname}`
  const response = NextResponse.redirect(url, 307)
  response.headers.set("Vary", "Cookie, X-Vercel-IP-Country")
  response.cookies.set(GEO_COOKIE, geoMarket, { path: "/", maxAge: YEAR, sameSite: "lax" })
  return response
}

export const config = {
  matcher: ["/((?!api|feeds|_next/static|_next/image|images|favicon|robots.txt|sitemap.xml|.*\\..*).*)"],
}
