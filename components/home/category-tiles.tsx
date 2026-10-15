import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { CATEGORIES, getProductsByCategory } from "@/lib/catalog"
import type { Market } from "@/lib/markets"

export function CategoryTiles({ market }: { market: Market }) {
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="categories-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
          Shop by system
        </h2>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = getProductsByCategory(market, c.slug).length
          return (
            <li key={c.slug}>
              <Link
                href={`/${market}/${c.slug}`}
                className="group flex h-full flex-col border border-border bg-card transition-colors hover:border-foreground"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-photo">
                  <Image
                    src={c.image || "/placeholder.svg"}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-4 p-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-expanded text-xl font-extrabold uppercase">{c.name}</h3>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {count} listed
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
