import Link from "next/link"
import { ArrowRight, Tag } from "lucide-react"
import { HeroVideo } from "@/components/home/hero-video"
import { SizeFinder } from "@/components/home/size-finder"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"

export function Hero({ store }: { store: Store }) {
  const t = getDictionary(store)
  const x = getExtras(store)
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-photo">
      <div className="pointer-events-none relative aspect-[3/1] w-full overflow-hidden sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto">
        <HeroVideo label={t.home.heroAlt} />
        <div
          aria-hidden="true"
          className="hidden lg:block lg:absolute lg:inset-0 lg:bg-gradient-to-r lg:from-transparent lg:via-background/70 lg:to-background/95"
        />
      </div>

      <div className="relative mx-auto grid min-w-0 max-w-7xl px-4 py-5 sm:py-8 md:px-6 lg:min-h-[640px] lg:grid-cols-12 lg:py-16">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-5 lg:col-start-8">
          <div className="flex flex-col gap-3 border border-border/60 bg-background/95 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:gap-4 sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label-caps text-primary">{t.home.eyebrow}</p>
              <Link
                href={storePath(store, "/account?mode=sign-up")}
                className="group inline-flex items-center gap-1.5 bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Tag className="size-3" aria-hidden="true" />
                <span>{x.memberDiscount.badge}</span>
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <h1
              id="hero-title"
              className="text-balance font-expanded text-2xl font-black uppercase leading-[0.95] tracking-tight text-foreground min-[380px]:text-3xl sm:text-4xl md:text-5xl"
            >
              {t.home.title}
            </h1>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">{t.home.lead}</p>
          </div>
          <SizeFinder />
        </div>
      </div>
    </section>
  )
}
