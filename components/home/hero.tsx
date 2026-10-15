import Image from "next/image"
import { SizeFinder } from "@/components/home/size-finder"
import { getDictionary, type Store } from "@/lib/i18n"

export function Hero({ store }: { store: Store }) {
  const t = getDictionary(store)
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-photo">
      <div className="relative aspect-[16/10] w-full lg:absolute lg:inset-y-0 lg:-left-32 lg:right-0 lg:aspect-auto lg:w-auto">
        <Image
          src="/images/hero-wheel.png"
          alt={t.home.heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-left"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl px-4 py-10 md:px-6 lg:min-h-[640px] lg:grid-cols-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8">
          <div className="flex flex-col gap-4">
            <p className="label-caps text-primary">{t.home.eyebrow}</p>
            <h1
              id="hero-title"
              className="text-balance font-expanded text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl"
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
