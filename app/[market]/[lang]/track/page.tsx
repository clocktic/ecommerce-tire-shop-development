import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { TrackForm } from "@/components/track/track-form"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const x = getExtras(store)
  return { title: x.track.title, description: x.track.lead, alternates: storeAlternates(store, "/track") }
}

export default async function TrackPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const x = getExtras(store)
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: x.track.title }]} />
      <div className="flex max-w-2xl flex-col gap-6 pb-24 pt-4">
        <h1 className="font-expanded text-4xl font-extrabold uppercase text-balance md:text-5xl">{x.track.title}</h1>
        <p className="leading-relaxed text-muted-foreground">{x.track.lead}</p>
        <TrackForm />
      </div>
    </div>
  )
}
