import Image from "next/image"
import { SizeFinder } from "@/components/home/size-finder"
import { getDictionary, type Store } from "@/lib/i18n"

export function Hero({ store }: { store: Store }) {
  const t = getDictionary(store)
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-photo">
      <div
        className="relative aspect-[16/10] w-full lg:absolute lg:inset-y-0 lg:-left-32 lg:right-0 lg:aspect-auto lg:w-auto"
        style={{ containerType: "size" }}
      >
        {/* Same box object-cover + object-left would give the 1408×768 photo, so the
            wheel can be placed in photo percentages at any container size. */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2"
          style={{ width: "max(100cqw, calc(100cqh * 1408 / 768))", aspectRatio: "1408 / 768" }}
        >
          <Image src="/images/hero-backdrop.png" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="hero-wheel-travel absolute" style={{ left: "9.517%", top: "5.729%", width: "48.58%" }}>
            <div
              aria-hidden="true"
              className="hero-wheel-skid absolute"
              style={{ right: "50%", width: "260%", bottom: "-0.6%", height: "2.4%" }}
            />
            <div
              aria-hidden="true"
              className="hero-wheel-smoke pointer-events-none absolute"
              style={{ right: "40%", bottom: "-2%", width: "230%", aspectRatio: "1400 / 594" }}
            >
              <Image src="/images/hero-smoke.webp" alt="" fill priority sizes="100vw" />
            </div>
            <div
              aria-hidden="true"
              className="hero-wheel-shadow absolute"
              style={{ left: "8%", right: "8%", bottom: "-4%", height: "9%" }}
            />
            {/* Barrel and disc sit behind the open spokes. The disc turns with the
                wheel; the caliper is bolted to the car, so it travels but never rotates. */}
            <div className="relative aspect-square">
              <div aria-hidden="true" className="hero-wheel-barrel absolute rounded-full" style={{ inset: "12%" }} />
              <div aria-hidden="true" className="hero-wheel-spin absolute" style={{ inset: "20%" }}>
                <Image src="/images/hero-brake-disc.png" alt="" fill priority sizes="30vw" />
              </div>
              <div aria-hidden="true" className="absolute inset-0" style={{ transform: "rotate(38deg)" }}>
                <div className="absolute" style={{ left: "30%", top: "15.5%", width: "40%", aspectRatio: "640 / 289" }}>
                  <Image src="/images/hero-brake-caliper.png" alt="" fill priority sizes="20vw" />
                </div>
              </div>
              <div className="hero-wheel-spin absolute inset-0">
                <Image
                  src="/images/hero-wheel-side.png"
                  alt={t.home.heroAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 90vw"
                />
              </div>
            </div>
          </div>
        </div>
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
