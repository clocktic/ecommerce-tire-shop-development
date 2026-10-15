import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"
import { getDictionary, localeMeta, parseStore, storePath } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { getShipmentByCode } from "@/lib/shipping/events"
import { OWN_CARRIER, TRACK_STAGES, stageIndex, statusLabel } from "@/lib/shipping/tracking"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { TrackForm } from "@/components/track/track-form"

type Params = Promise<{ market: string; lang: string; code: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  return { title: store ? getExtras(store).track.title : undefined, robots: { index: false, follow: false } }
}

export default async function TrackResultPage({ params }: { params: Params }) {
  const { market, lang, code: rawCode } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const x = getExtras(store)
  const meta = localeMeta(store)
  const code = decodeURIComponent(rawCode)
  const shipment = await getShipmentByCode(code)
  const when = new Intl.DateTimeFormat(meta.intlLocale, { dateStyle: "medium", timeStyle: "short" })

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: storePath(store), label: t.common.home },
          { href: storePath(store, "/track"), label: x.track.title },
          { label: code.toUpperCase() },
        ]}
      />
      <div className="flex max-w-3xl flex-col gap-8 pb-24 pt-4">
        <h1 className="font-expanded text-3xl font-extrabold uppercase md:text-4xl">{x.track.title}</h1>
        <TrackForm defaultValue={code.toUpperCase()} />

        {!shipment ? (
          <p role="alert" className="border border-border bg-card p-6 leading-relaxed">
            {x.track.notFound}
          </p>
        ) : (
          <TrackResult shipment={shipment} x={x} contentLang={meta.content} when={when} />
        )}
      </div>
    </div>
  )
}

function TrackResult({
  shipment,
  x,
  contentLang,
  when,
}: {
  shipment: NonNullable<Awaited<ReturnType<typeof getShipmentByCode>>>
  x: ReturnType<typeof getExtras>
  contentLang: ReturnType<typeof localeMeta>["content"]
  when: Intl.DateTimeFormat
}) {
  const { order, events } = shipment
  const latest = events[0]
  const current = latest ? stageIndex(latest.status) : -1

  return (
    <section aria-label={x.track.history} className="flex flex-col gap-8">
      <dl className="grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="flex flex-col gap-1 bg-card p-4">
          <dt className="label-caps text-muted-foreground">{x.track.order}</dt>
          <dd className="font-mono font-semibold">{order.orderNumber}</dd>
        </div>
        <div className="flex flex-col gap-1 bg-card p-4">
          <dt className="label-caps text-muted-foreground">{x.track.number}</dt>
          <dd className="break-all font-mono font-semibold">{order.trackingNumber ?? "—"}</dd>
        </div>
        <div className="flex flex-col gap-1 bg-card p-4">
          <dt className="label-caps text-muted-foreground">{x.track.carrier}</dt>
          <dd className="font-semibold">{latest?.carrier ?? order.carrier ?? OWN_CARRIER}</dd>
        </div>
      </dl>

      {latest && (
        <p className="font-expanded text-2xl font-extrabold uppercase text-balance">
          {statusLabel(latest.status, contentLang, latest.carrier)}
        </p>
      )}

      <ol className="grid grid-cols-4 gap-2" aria-label={x.track.history}>
        {TRACK_STAGES.map((stage, i) => {
          const done = i <= current
          return (
            <li key={stage} className="flex flex-col gap-2" aria-current={i === current ? "step" : undefined}>
              <span className={cn("h-1.5", done ? "bg-primary" : "bg-border")} />
              <span className={cn("flex items-center gap-1 text-xs font-semibold uppercase tracking-wide", done ? "text-foreground" : "text-muted-foreground")}>
                {done && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                {x.track.stages[i]}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-col gap-4">
        <h2 className="label-caps">{x.track.history}</h2>
        {events.length === 0 ? (
          <p className="text-muted-foreground">{x.track.noEvents}</p>
        ) : (
          <ol className="flex flex-col border-l border-border">
            {events.map((event, i) => (
              <li key={event.id} className="relative flex flex-col gap-1 pb-6 pl-6">
                <span
                  aria-hidden="true"
                  className={cn("absolute -left-1.5 top-1 size-3 border-2 border-background", i === 0 ? "bg-primary" : "bg-muted-foreground")}
                />
                <time dateTime={event.createdAt.toISOString()} className="font-mono text-xs text-muted-foreground">
                  {when.format(event.createdAt)}
                </time>
                <p className="font-semibold">{statusLabel(event.status, contentLang, event.carrier)}</p>
                {(event.location || event.carrier) && (
                  <p className="text-sm text-muted-foreground">{[event.location, event.carrier].filter(Boolean).join(" · ")}</p>
                )}
                {event.comment && <p className="text-sm leading-relaxed">{event.comment}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
