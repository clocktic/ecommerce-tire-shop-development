"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { OPEN_CONSENT_EVENT, hasGlobalPrivacyControl, readConsent, saveConsent } from "@/components/legal/consent"
import { policyHref } from "@/lib/legal/pages"
import type { Market } from "@/lib/markets"

export function CookieConsent({ market }: { market: Market }) {
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState(false)
  const [analytics, setAnalytics] = useState(market === "us")
  const [ads, setAds] = useState(market === "us")
  const [gpc, setGpc] = useState(false)

  useEffect(() => {
    const signal = hasGlobalPrivacyControl()
    setGpc(signal)
    const saved = readConsent()
    if (saved && saved.market === market) {
      setAnalytics(saved.analytics)
      setAds(saved.ads && !signal)
    } else {
      setAnalytics(market === "us")
      setAds(market === "us" && !signal)
      setOpen(true)
    }
    const reopen = () => {
      setDetails(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, reopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen)
  }, [market])

  if (!open) return null

  const persist = (nextAnalytics: boolean, nextAds: boolean) => {
    saveConsent({ market, analytics: nextAnalytics, ads: nextAds && !gpc })
    setOpen(false)
    setDetails(false)
  }

  const isEu = market === "eu"

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card shadow-[0_-8px_30px_-12px_rgb(0_0_0/0.25)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:px-6">
        <div className="flex flex-col gap-2">
          <h2 id="consent-title" className="label-caps text-foreground">
            {isEu ? "Cookies & consent" : "Your privacy choices"}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {isEu ? (
              <>
                We use strictly necessary cookies to run the store. With your consent we also use analytics and
                advertising cookies (Google). Nothing optional is set until you choose. You can change your choice at any
                time under Cookie settings in the footer.{" "}
                <Link href={policyHref(market, "cookies")} className="underline underline-offset-4">
                  Cookie Policy
                </Link>
              </>
            ) : (
              <>
                We use cookies for analytics and advertising, which may count as &quot;sharing&quot; personal information
                under some US state laws. You can opt out at any time. We honor Global Privacy Control signals.{" "}
                <Link href={policyHref(market, "privacy-choices")} className="underline underline-offset-4">
                  Your Privacy Choices
                </Link>
              </>
            )}
          </p>
          {gpc && (
            <p className="text-sm font-medium text-foreground">
              Global Privacy Control detected — advertising cookies stay off.
            </p>
          )}
        </div>

        {details && (
          <fieldset className="grid gap-3 border border-border p-4 md:grid-cols-3">
            <legend className="label-caps px-1 text-muted-foreground">Categories</legend>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked disabled className="mt-1 accent-primary" />
              <span>
                <span className="block font-semibold">Strictly necessary</span>
                <span className="text-muted-foreground">Cart, region choice, security. Always on.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block font-semibold">Analytics</span>
                <span className="text-muted-foreground">Aggregated visit statistics.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={ads && !gpc}
                disabled={gpc}
                onChange={(e) => setAds(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block font-semibold">Advertising</span>
                <span className="text-muted-foreground">Ad measurement and personalisation.</span>
              </span>
            </label>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2">
          {isEu ? (
            <>
              <Button onClick={() => persist(true, true)}>Accept all</Button>
              <Button variant="outline" onClick={() => persist(false, false)}>
                Reject all
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => persist(true, true)}>OK</Button>
              <Button variant="outline" onClick={() => persist(analytics, false)}>
                Opt out of sharing
              </Button>
            </>
          )}
          {details ? (
            <Button variant="ghost" onClick={() => persist(analytics, ads)}>
              Save choices
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setDetails(true)}>
              Customize
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
