import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { POLICIES_UPDATED, getPolicy, policySlugs } from "@/lib/legal"
import { ALL_STORES, getDictionary, parseStore } from "@/lib/i18n"
import { markets } from "@/lib/markets"
import { storeAlternates } from "@/lib/seo"
import { ProsePage } from "@/components/legal/prose-page"
import { PrivacyChoicesButton } from "@/components/legal/privacy-choices-button"

type Params = Promise<{ market: string; lang: string; policy: string }>

export function generateStaticParams() {
  return ALL_STORES.flatMap(({ market, lang }) => policySlugs(market).map((policy) => ({ market, lang, policy })))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang, policy } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const doc = getPolicy(store, policy)
  if (!doc) return {}
  const availableIn = markets.filter((m) => policySlugs(m).includes(policy))
  return { title: doc.title, description: doc.description, alternates: storeAlternates(store, `/policies/${policy}`, availableIn) }
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { market, lang, policy } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const doc = getPolicy(store, policy)
  if (!doc) notFound()

  return (
    <ProsePage store={store} doc={doc} slug={policy} updated={POLICIES_UPDATED}>
      {policy === "privacy-choices" && <PrivacyChoicesButton label={getDictionary(store).consent.openSettings} />}
    </ProsePage>
  )
}
