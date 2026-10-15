import { NextResponse, type NextRequest } from "next/server"
import { GEO_COOKIE, MARKET_COOKIE, defaultMarket, isMarket, marketFromCountry, type Market } from "@/lib/markets"
import { DEFAULT_LANG, LANG_COOKIE, isLang, isStoreLang, langFromHeader, type Lang } from "@/lib/i18n/config"

const YEAR = 60 * 60 * 24 * 365

function preferredLang(request: NextRequest, market: Market): Lang {
  const chosen = request.cookies.get(LANG_COOKIE)?.value
  if (isStoreLang(market, chosen)) return chosen
  return langFromHeader(market, request.headers.get("accept-language")) ?? DEFAULT_LANG
}

function withGeo(response: NextResponse, request: NextRequest, geoMarket: Market) {
  if (request.cookies.get(GEO_COOKIE)?.value !== geoMarket) {
    response.cookies.set(GEO_COOKIE, geoMarket, { path: "/", maxAge: YEAR, sameSite: "lax" })
  }
  return response
}

// Fully prefixed URLs (/us/en/*, /eu/de/*) are always served as-is, so crawlers
// (Googlebot crawls from the US) and shared links reach every store and language.
// Everything else is redirected: the market comes from the saved choice or geo,
// the language from the saved choice or Accept-Language.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const geoMarket = marketFromCountry(request.headers.get("x-vercel-ip-country")) ?? defaultMarket
  const [, first, second, ...rest] = pathname.split("/")

  if (isMarket(first)) {
    if (isStoreLang(first, second)) return withGeo(NextResponse.next(), request, geoMarket)
    // /eu/tires or /us → add the language segment; /us/de (not offered there) → swap it.
    const tail = (isLang(second) ? rest : [second, ...rest]).filter(Boolean).join("/")
    const url = request.nextUrl.clone()
    url.pathname = `/${first}/${preferredLang(request, first)}${tail ? `/${tail}` : ""}`
    const response = NextResponse.redirect(url, 307)
    response.headers.set("Vary", "Cookie, Accept-Language")
    return withGeo(response, request, geoMarket)
  }

  const chosen = request.cookies.get(MARKET_COOKIE)?.value
  const market = isMarket(chosen) ? chosen : geoMarket
  const url = request.nextUrl.clone()
  url.pathname = `/${market}/${preferredLang(request, market)}${pathname === "/" ? "" : pathname}`
  const response = NextResponse.redirect(url, 307)
  response.headers.set("Vary", "Cookie, X-Vercel-IP-Country, Accept-Language")
  return withGeo(response, request, geoMarket)
}

export const config = {
  matcher: ["/((?!api|feeds|_next/static|_next/image|images|favicon|icon|robots.txt|sitemap.xml|.*\\..*).*)"],
}
