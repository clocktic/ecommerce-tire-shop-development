import type { Market } from "@/lib/markets"

export const CONSENT_STORAGE_KEY = "cp-consent-v1"
export const OPEN_CONSENT_EVENT = "cp:open-consent"
// Stored choices expire so EU visitors are asked again (documented in the Cookie Policy).
export const CONSENT_MAX_AGE_DAYS = 395

export type ConsentChoice = {
  analytics: boolean
  ads: boolean
  market: Market
  savedAt: string
}

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentChoice
    const age = (Date.now() - new Date(parsed.savedAt).getTime()) / 86_400_000
    return age > CONSENT_MAX_AGE_DAYS ? null : parsed
  } catch {
    return null
  }
}

export function saveConsent(choice: Omit<ConsentChoice, "savedAt">) {
  const value: ConsentChoice = { ...choice, savedAt: new Date().toISOString() }
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value))
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  gtag?.("consent", "update", {
    analytics_storage: value.analytics ? "granted" : "denied",
    ad_storage: value.ads ? "granted" : "denied",
    ad_user_data: value.ads ? "granted" : "denied",
    ad_personalization: value.ads ? "granted" : "denied",
  })
  return value
}

export function hasGlobalPrivacyControl() {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}
