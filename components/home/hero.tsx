import Image from "next/image"
import { SizeFinder } from "@/components/home/size-finder"
import { MARKETS, type Market } from "@/lib/markets"

export function Hero({ market }: { market: Market }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-photo">
      <div className="relative aspect-[16/10] w-full lg:absolute lg:inset-y-0 lg:-left-32 lg:right-0 lg:aspect-auto lg:w-auto">
        <Image
          src="/images/hero-wheel.png"
          alt="Alloy wheel with a performance tire and a red brake caliper"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl px-4 py-10 md:px-6 lg:min-h-[640px] lg:grid-cols-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8">
          <div className="flex flex-col gap-4">
            <p className="label-caps text-primary">{MARKETS[market].short} store · Tires · Wheels · Brakes</p>
            <h1
              id="hero-title"
              className="text-balance font-expanded text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl"
            >
              Everything between your car and the road.
            </h1>
            <p className="max-w-md text-pretty leading-relaxed text-foreground/80">
              {market === "us"
                ? "Tires with UTQG grades, wheels by bolt pattern, brakes by axle — shipped from US stock."
                : "Tires with the EU tyre label, ECE-approved wheels and brakes — shipped from EU stock, VAT included."}
            </p>
          </div>
          <SizeFinder market={market} />
        </div>
      </div>
    </section>
  )
}
