import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { POLICIES_UPDATED, getPolicy, policySlugs } from "@/lib/legal"
import { isMarket, markets } from "@/lib/markets"
import { marketAlternates } from "@/lib/seo"
import { ProsePage } from "@/components/legal/prose-page"
import { PrivacyChoicesButton } from "@/components/legal/privacy-choices-button"

type Params = Promise<{ market: string; policy: string }>

export function generateStaticParams() {
  return markets.flatMap((market) => policySlugs(market).map((policy) => ({ market, policy })))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, policy } = await params
  if (!isMarket(market)) return {}
  const doc = getPolicy(market, policy)
  if (!doc) return {}
  const availableIn = markets.filter((m) => getPolicy(m, policy))
  return {
    title: doc.title,
    description: doc.description,
    alternates: marketAlternates(market, `/policies/${policy}`, availableIn),
  }
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { market, policy } = await params
  if (!isMarket(market)) notFound()
  const doc = getPolicy(market, policy)
  if (!doc) notFound()

  return (
    <ProsePage market={market} doc={doc} slug={policy} updated={POLICIES_UPDATED}>
      {policy === "privacy-choices" && <PrivacyChoicesButton />}
    </ProsePage>
  )
}
