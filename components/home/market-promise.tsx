import Link from "next/link"
import { MARKETS, otherMarket, type Market } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import { policyHref } from "@/lib/legal/pages"

export function MarketPromise({ market }: { market: Market }) {
  const p = POLICIES[market]
  const other = otherMarket(market)
  const items = [
    {
      title: p.shipping.freeShipping ? "Free shipping" : "Shipping",
      value: deliveryLabel(market),
      text: `To ${p.shipping.area}. ${p.shipping.duties}`,
      href: policyHref(market, "shipping"),
    },
    {
      title: market === "eu" ? "Right of withdrawal" : "Returns",
      value: `${p.returns.windowDays} days`,
      text: market === "eu" ? "From delivery, no reason needed. Unmounted items." : "Unused and unmounted. No restocking fee.",
      href: policyHref(market, "returns"),
    },
    {
      title: market === "eu" ? "Legal guarantee" : "Warranty",
      value: market === "eu" ? "2 years" : "Manufacturer",
      text: p.warranty.summary,
      href: policyHref(market, "warranty"),
    },
  ]

  return (
    <section aria-labelledby="promise-title" className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
      <div className="bg-secondary text-secondary-foreground">
        <div className="flex flex-col gap-2 border-b border-secondary-foreground/15 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <h2 id="promise-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            The {MARKETS[market].short} store terms
          </h2>
          <p className="text-sm text-secondary-foreground/70">
            Separate stock, prices and policies for each region.{" "}
            <Link href={`/${other}`} className="underline underline-offset-4">
              {MARKETS[other].short} store
            </Link>
          </p>
        </div>
        <ul className="grid md:grid-cols-3">
          {items.map((item) => (
            <li key={item.title} className="border-b border-secondary-foreground/15 md:border-b-0 md:border-r md:last:border-r-0">
              <Link href={item.href} className="group flex h-full flex-col gap-3 p-6 md:p-8">
                <span className="label-caps text-secondary-foreground/60">{item.title}</span>
                <span className="font-expanded text-3xl font-black uppercase group-hover:text-primary">{item.value}</span>
                <span className="text-sm leading-relaxed text-secondary-foreground/75">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
