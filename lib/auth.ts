import "server-only"

import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { pool } from "@/lib/db"

export type SocialProvider = "google" | "apple" | "facebook"

// A provider is offered only once its OAuth credentials exist in the project env.
export const ENABLED_PROVIDERS: Record<SocialProvider, boolean> = {
  google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  apple: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
  facebook: !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
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
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } }
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
      ? { facebook: { clientId: process.env.FACEBOOK_CLIENT_ID!, clientSecret: process.env.FACEBOOK_CLIENT_SECRET! } }
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
