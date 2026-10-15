"use client"

import { useEffect } from "react"
import type { Market } from "@/lib/markets"
import { hasGlobalPrivacyControl, readConsent } from "@/components/legal/consent"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

type Gtag = (...args: unknown[]) => void
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag; __cpConsentMarket?: Market }

const state = (granted: boolean) => (granted ? "granted" : "denied")

// Google Consent Mode v2. Defaults are pushed to the dataLayer before the Google tag
// is injected, so the tag never runs without a consent state.
// EU: everything denied until the visitor opts in (GDPR / ePrivacy).
// US: granted by default (opt-out model), but a Global Privacy Control signal
// or a saved opt-out denies ad storage and ad personalisation (CCPA/CPRA).
// Rendered as an effect (not an inline <script>) because React does not execute
// scripts rendered on the client.
export function ConsentDefaults({ market }: { market: Market }) {
  useEffect(() => {
    const w = window as GtagWindow
    if (w.__cpConsentMarket === market) return

    w.dataLayer = w.dataLayer || []
    const gtag: Gtag =
      w.gtag ||
      function gtag() {
        // gtag.js expects the Arguments object, not an array.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments)
      }
    w.gtag = gtag

    const saved = readConsent()
    const choice = saved && saved.market === market ? saved : null
    const gpc = hasGlobalPrivacyControl()
    const analytics = choice ? choice.analytics : market !== "eu"
    const ads = gpc ? false : choice ? choice.ads : market !== "eu"

    gtag("consent", w.__cpConsentMarket ? "update" : "default", {
      analytics_storage: state(analytics),
      ad_storage: state(ads),
      ad_user_data: state(ads),
      ad_personalization: state(ads),
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500,
    })
    gtag("set", "ads_data_redaction", !ads)
    gtag("set", "url_passthrough", false)

    const firstRun = !w.__cpConsentMarket
    w.__cpConsentMarket = market

    if (GA_ID && firstRun) {
      const tag = document.createElement("script")
      tag.async = true
      tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(tag)
      gtag("js", new Date())
      gtag("config", GA_ID)
    }
  }, [market])

  return null
}
