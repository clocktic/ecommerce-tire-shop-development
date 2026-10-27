import type { Market } from "@/lib/markets"
import type { Lang, Store } from "@/lib/i18n/config"
import { POLICY_ORDER } from "@/lib/legal/pages"
import type { PolicyDoc } from "@/lib/legal/types"
import { US_POLICIES } from "@/lib/legal/us"
import { US_POLICIES_ES } from "@/lib/legal/us-es"
import { EU_POLICIES } from "@/lib/legal/eu"
import { EU_POLICIES_DE } from "@/lib/legal/eu-de"
import { EU_POLICIES_FR } from "@/lib/legal/eu-fr"
import { EU_POLICIES_IT } from "@/lib/legal/eu-it"
import { EU_POLICIES_ES } from "@/lib/legal/eu-es"
import { EU_POLICIES_NL } from "@/lib/legal/eu-nl"
import { EU_CUSTOMS } from "@/lib/legal/eu-customs"

type Docs = Record<string, PolicyDoc>

const DOCS: Record<Market, Partial<Record<Lang, Docs>>> = {
  us: { en: US_POLICIES, es: US_POLICIES_ES },
  eu: { en: EU_POLICIES, de: EU_POLICIES_DE, fr: EU_POLICIES_FR, it: EU_POLICIES_IT, es: EU_POLICIES_ES, nl: EU_POLICIES_NL },
}

export function getPolicy(store: Store, slug: string): PolicyDoc | undefined {
  if (slug === "customs") return store.market === "eu" ? EU_CUSTOMS[store.lang] : undefined
  return DOCS[store.market][store.lang]?.[slug]
}

export function policySlugs(market: Market): string[] {
  return POLICY_ORDER[market]
}

export function policyLinks(store: Store): { slug: string; title: string }[] {
  return POLICY_ORDER[store.market].flatMap((slug) => {
    const doc = getPolicy(store, slug)
    return doc ? [{ slug, title: doc.title }] : []
  })
}

// Last material revision of the policy texts. Update when the wording changes.
export const POLICIES_UPDATED = "2026-10-27"
