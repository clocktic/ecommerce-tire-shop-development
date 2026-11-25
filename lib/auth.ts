import "server-only"

import { cookies, headers } from "next/headers"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { pool } from "@/lib/db"
import { notifyEmailNewUser } from "@/lib/email"
import { GEO_COOKIE, isMarket, MARKET_COOKIE, marketFromCountry } from "@/lib/markets"
import { notifyTelegramNewUser } from "@/lib/telegram"

function decodeGeoHeader(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

async function resolveRegistrationRegion(): Promise<{
  market?: string
  lang?: string
  country?: string
  region?: string
  city?: string
}> {
  try {
    const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()])
    const country = requestHeaders.get("x-vercel-ip-country")?.trim().toUpperCase() || undefined
    const region = decodeGeoHeader(requestHeaders.get("x-vercel-ip-country-region")) ?? undefined
    const city = decodeGeoHeader(requestHeaders.get("x-vercel-ip-city")) ?? undefined

    let market: string | undefined
    let lang: string | undefined
    const referer = requestHeaders.get("referer")
    if (referer) {
      try {
        const pathname = new URL(referer).pathname
        const match = pathname.match(/^\/(us|eu)\/([a-z]{2})(?:\/|$)/)
        if (match) {
          market = match[1]
          lang = match[2]
        }
      } catch {
        // Ignore malformed referer
      }
    }

    if (!market) {
      const chosen = requestCookies.get(MARKET_COOKIE)?.value
      const geoCookie = requestCookies.get(GEO_COOKIE)?.value
      if (isMarket(chosen)) market = chosen
      else if (isMarket(geoCookie)) market = geoCookie
      else market = marketFromCountry(country) ?? undefined
    }

    return { market, lang, country, region, city }
  } catch {
    return {}
  }
}

export type SocialProvider = "google" | "apple" | "facebook"

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "661924817123-t64bkpbr8rfsq5imoa39ojggup63llvc.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.Secret
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || "2652921205170227"
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET

// A provider is offered only once its OAuth credentials exist in the project env.
export const ENABLED_PROVIDERS: Record<SocialProvider, boolean> = {
  google: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
  apple: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
  facebook: !!(FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET),
}

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        :         process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    // Sign-up itself is gated by a captcha check performed in the server action
    // before auth.api.signUpEmail runs (see lib/actions/auth.ts).
    autoSignIn: true,
  },
  socialProviders: {
    ...(ENABLED_PROVIDERS.google
      ? { google: { clientId: GOOGLE_CLIENT_ID!, clientSecret: GOOGLE_CLIENT_SECRET! } }
      : {}),
    ...(ENABLED_PROVIDERS.apple
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
            ...(process.env.APPLE_APP_BUNDLE_IDENTIFIER
              ? { appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER }
              : {}),
          },
        }
      : {}),
    ...(ENABLED_PROVIDERS.facebook
      ? { facebook: { clientId: FACEBOOK_CLIENT_ID!, clientSecret: FACEBOOK_CLIENT_SECRET! } }
      : {}),
  },
  trustedOrigins: [
    // Sign in with Apple posts its callback from this origin.
    "https://appleid.apple.com",
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === "production"
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          const regionInfo = await resolveRegistrationRegion()
          await Promise.all([
            notifyTelegramNewUser({
              id: createdUser.id,
              name: createdUser.name,
              email: createdUser.email,
              ...regionInfo,
            }),
            notifyEmailNewUser({
              name: createdUser.name,
              email: createdUser.email,
              ...regionInfo,
            }),
          ])
        },
      },
    },
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
  // Required so Set-Cookie headers from auth.api.signUpEmail reach the browser
  // when called from a Next.js server action (see lib/actions/auth.ts). Keep last.
  plugins: [nextCookies()],
})

export async function getSessionUser(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders })
  return session?.user ?? null
}
