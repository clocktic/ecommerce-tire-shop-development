"use client"

import { createContext, useContext } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Store } from "@/lib/i18n/config"
import type { Extras } from "@/lib/i18n/extras"

type I18nValue = { store: Store; t: Dictionary; x: Extras; intl: string }

const I18nContext = createContext<I18nValue | null>(null)

// Only the active store's dictionary reaches the client.
export function I18nProvider({ children, ...value }: I18nValue & { children: React.ReactNode }) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider")
  return ctx
}
