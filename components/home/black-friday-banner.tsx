import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BLACK_FRIDAY_PROMO, blackFridayCopy } from "@/lib/black-friday"
import { storePath, type Store } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

export function BlackFridayBanner({ store }: { store: Store }) {
  if (!BLACK_FRIDAY_PROMO.active) return null
  const c = blackFridayCopy(store.lang)

  return (
    <section aria-labelledby="black-friday-title" className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 md:px-6">
      <div className="relative flex flex-col overflow-hidden border border-border bg-card shadow-lifted sm:flex-row">
        <div aria-hidden="true" className="h-1 w-full shrink-0 bg-primary sm:h-auto sm:w-1.5" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent"
        />

        <div className="relative flex min-w-0 flex-1 flex-col gap-3 px-4 py-3.5 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
            <div className="flex shrink-0 flex-col items-start">
              <span className="font-expanded text-3xl font-black leading-none tracking-tight text-primary sm:text-4xl">
                −{BLACK_FRIDAY_PROMO.discountPercent}%
              </span>
              <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                SITEWIDE
              </span>
            </div>

            <Separator orientation="vertical" className="hidden h-10 sm:block" />

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                  <Flame data-icon="inline-start" aria-hidden="true" />
                  {c.badge}
                </Badge>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                  {c.tagAll}
                </span>
              </div>
              <h2
                id="black-friday-title"
                className="text-balance font-expanded text-sm font-extrabold uppercase leading-snug tracking-tight text-foreground sm:text-base"
              >
                {c.title}
              </h2>
              <p className="hidden text-pretty text-xs leading-relaxed text-muted-foreground md:block">
                {c.lead}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={storePath(store, "/tires")}
              data-cta-roll
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "font-mono text-[11px] font-bold uppercase tracking-[0.12em]",
              )}
            >
              <span>{c.ctaTires}</span>
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href={storePath(store, "/wheels")}
              data-cta-roll
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "font-mono text-[11px] font-semibold uppercase tracking-[0.12em]",
              )}
            >
              <span>{c.ctaWheels}</span>
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href={storePath(store, "/brakes")}
              data-cta-roll
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "font-mono text-[11px] font-semibold uppercase tracking-[0.12em]",
              )}
            >
              <span>{c.ctaBrakes}</span>
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
