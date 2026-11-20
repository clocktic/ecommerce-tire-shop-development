import Link from "next/link"
import { ArrowRight, Flame, Tag } from "lucide-react"
import { BLACK_FRIDAY_PROMO, blackFridayCopy } from "@/lib/black-friday"
import { storePath, type Store } from "@/lib/i18n/config"

export function BlackFridayBanner({ store }: { store: Store }) {
  if (!BLACK_FRIDAY_PROMO.active) return null
  const c = blackFridayCopy(store.lang)

  return (
    <section aria-labelledby="black-friday-title" className="mx-auto max-w-7xl px-4 pt-6 sm:pt-10 md:px-6">
      <div className="relative overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-lifted">
        <div aria-hidden="true" className="h-1.5 w-full bg-primary" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative grid gap-5 p-4 sm:gap-7 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-10">
          {/* Left: Bold -10% Black Friday focal block */}
          <div className="flex flex-col justify-between gap-3 border border-white/15 bg-white/[0.04] p-4 sm:gap-4 sm:p-6 lg:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground sm:text-[11px]">
                <Flame className="size-3.5" aria-hidden="true" />
                {c.badge}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                SITEWIDE
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 py-1 sm:py-2">
              <span className="font-expanded text-5xl font-black leading-none tracking-tight text-primary sm:text-6xl lg:text-7xl">
                −{BLACK_FRIDAY_PROMO.discountPercent}%
              </span>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                OFF ALL
              </span>
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 sm:text-[11px]">
              <Tag className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{c.tagAll}</span>
            </div>
          </div>

          {/* Right: Editorial copy + category CTAs */}
          <div className="flex flex-col gap-4 lg:col-span-8">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {c.eyebrow}
              </p>
              <h2
                id="black-friday-title"
                className="text-balance font-expanded text-xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-3xl md:text-4xl"
              >
                {c.title}
              </h2>
              <p className="max-w-2xl text-pretty text-xs leading-relaxed text-zinc-300 sm:text-base">
                {c.lead}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:gap-3">
              <Link
                href={storePath(store, "/tires")}
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90 sm:px-5 sm:py-3"
              >
                <span>{c.ctaTires}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href={storePath(store, "/wheels")}
                className="group inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/[0.06] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-primary hover:bg-white/10 sm:px-5 sm:py-3"
              >
                <span>{c.ctaWheels}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href={storePath(store, "/brakes")}
                className="group inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/[0.06] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-primary hover:bg-white/10 sm:px-5 sm:py-3"
              >
                <span>{c.ctaBrakes}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
