import { HeroVideo } from "@/components/home/hero-video"
import { SizeFinder } from "@/components/home/size-finder"
import { getDictionary, type Store } from "@/lib/i18n"

export function Hero({ store }: { store: Store }) {
  const t = getDictionary(store)
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-photo">
      <div className="pointer-events-none relative aspect-[3/1] w-full overflow-hidden sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto">
        <HeroVideo label={t.home.heroAlt} />
      </div>

      <div className="relative mx-auto grid min-w-0 max-w-7xl px-4 py-10 md:px-6 lg:min-h-[640px] lg:grid-cols-12 lg:py-16">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-5 lg:col-start-8">
          <div className="flex flex-col gap-4 pr-14 sm:pr-0">
            <p className="label-caps text-primary">{t.home.eyebrow}</p>
            <h1
              id="hero-title"
              className="text-balance font-expanded text-2xl font-black uppercase leading-[0.95] tracking-tight min-[380px]:text-3xl sm:text-4xl md:text-5xl"
            >
              {t.home.title}
            </h1>
            <p className="max-w-md text-pretty leading-relaxed text-foreground/80">{t.home.lead}</p>
          </div>
          <SizeFinder />
        </div>
      </div>
    </section>
  )
}
