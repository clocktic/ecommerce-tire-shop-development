"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { OPEN_CONSENT_EVENT, hasGlobalPrivacyControl, readConsent, saveConsent } from "@/components/legal/consent"
import { useI18n } from "@/components/i18n/i18n-provider"
import { policyHref } from "@/lib/legal/pages"

export function CookieConsent() {
  const { store, t } = useI18n()
  const { market } = store
  const c = t.consent
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
            {c.title}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {c.text}{" "}
            <Link href={policyHref(store, isEu ? "cookies" : "privacy-choices")} className="underline underline-offset-4">
              {c.policyLink}
            </Link>
          </p>
          {gpc && (
            <p className="text-sm font-medium text-foreground">
              {c.gpc}
            </p>
          )}
        </div>

        {details && (
          <fieldset className="grid gap-3 border border-border p-4 md:grid-cols-3">
            <legend className="label-caps px-1 text-muted-foreground">{c.categories}</legend>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked disabled className="mt-1 accent-primary" />
              <span>
                <span className="block font-semibold">{c.necessary}</span>
                <span className="text-muted-foreground">{c.necessaryText}</span>
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
                <span className="block font-semibold">{c.analytics}</span>
                <span className="text-muted-foreground">{c.analyticsText}</span>
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
                <span className="block font-semibold">{c.advertising}</span>
                <span className="text-muted-foreground">{c.advertisingText}</span>
              </span>
            </label>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => persist(true, true)}>{c.primary}</Button>
          <Button variant="outline" onClick={() => (isEu ? persist(false, false) : persist(analytics, false))}>
            {c.secondary}
          </Button>
          {details ? (
            <Button variant="ghost" onClick={() => persist(analytics, ads)}>
              {c.save}
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setDetails(true)}>
              {c.customize}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
