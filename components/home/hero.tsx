import { HeroVideo } from "@/components/home/hero-video"
import { SizeFinder } from "@/components/home/size-finder"
import { getDictionary, type Store } from "@/lib/i18n"

export function Hero({ store }: { store: Store }) {
  const t = getDictionary(store)
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-photo">
      <div className="pointer-events-none relative aspect-[3/1] w-full overflow-hidden sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto">
        <HeroVideo label={t.home.heroAlt} />
        <div
          aria-hidden="true"
          className="hidden lg:block lg:absolute lg:inset-0 lg:bg-gradient-to-r lg:from-transparent lg:via-background/70 lg:to-background/95"
        />
      </div>

      <div className="relative mx-auto grid min-w-0 max-w-7xl px-4 py-10 md:px-6 lg:min-h-[640px] lg:grid-cols-12 lg:py-16">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-5 lg:col-start-8">
          <div className="flex flex-col gap-4 border border-border/60 bg-background/90 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <p className="label-caps text-primary">{t.home.eyebrow}</p>
            <h1
              id="hero-title"
              className="text-balance font-expanded text-2xl font-black uppercase leading-[0.95] tracking-tight text-foreground min-[380px]:text-3xl sm:text-4xl md:text-5xl"
            >
              {t.home.title}
            </h1>
            <p className="max-w-md text-pretty leading-relaxed text-foreground/85">{t.home.lead}</p>
          </div>
          <SizeFinder />
        </div>
      </div>
    </section>
  )
}
