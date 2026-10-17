import Link from "next/link"
import { counterpart, getDictionary, storePath, type Store } from "@/lib/i18n"
import { policyHref } from "@/lib/legal/pages"

export function MarketPromise({ store }: { store: Store }) {
  const t = getDictionary(store)
  const p = t.home.promise
  const other = counterpart(store)
  const items = [
    { title: p.shippingTitle, value: t.policy.days, text: p.shippingText, href: policyHref(store, "shipping") },
    { title: p.returnsTitle, value: p.returnsValue, text: p.returnsText, href: policyHref(store, "returns") },
    { title: p.warrantyTitle, value: p.warrantyValue, text: p.warrantyText, href: policyHref(store, "warranty") },
  ]

  return (
    <section aria-labelledby="promise-title" className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
      <div className="bg-secondary text-secondary-foreground">
        <div className="flex flex-col gap-2 border-b border-secondary-foreground/15 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <h2 id="promise-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            {p.title}
          </h2>
          <p className="text-sm text-secondary-foreground/70">
            {p.lead}{" "}
            <Link href={storePath(other)} className="underline underline-offset-4">
              {t.common.storeName[other.market]}
            </Link>
          </p>
        </div>
        <ul className="grid md:grid-cols-3">
          {items.map((item) => (
            <li key={item.href} className="min-w-0 border-b border-secondary-foreground/15 md:border-b-0 md:border-r md:last:border-r-0">
              <Link href={item.href} className="group flex h-full min-w-0 flex-col gap-3 p-6 md:p-8">
                <span className="label-caps text-secondary-foreground/60">{item.title}</span>
                <span className="text-balance font-expanded text-[clamp(1.6rem,8.5vw,1.875rem)] font-black uppercase leading-none group-hover:text-primary">
                  {item.value}
                </span>
                <span className="text-sm leading-relaxed text-secondary-foreground/75">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
