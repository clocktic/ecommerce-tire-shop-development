import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { CATEGORIES } from "@/lib/catalog"
import { readProducts } from "@/lib/catalog/queries"
import { tireModelKey } from "@/lib/catalog/tire-variants"
import { fmt, getDictionary, storePath, type Store } from "@/lib/i18n"

export async function CategoryTiles({ store }: { store: Store }) {
  const t = getDictionary(store)
  const catalog = await readProducts(store.market)
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pt-12 sm:pt-20 md:px-6">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
        <h2 id="categories-title" className="font-expanded text-xl font-extrabold uppercase sm:text-2xl md:text-3xl">
          {t.home.systems}
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = catalog.ok
            ? new Set(
                catalog.data
                  .filter((p) => p.category === c.slug)
                  .map((p) => (p.category === "tires" ? tireModelKey(p) : p.id)),
              ).size
            : null
          const copy = t.categories[c.slug]
          return (
            <li key={c.slug}>
              <Link
                href={storePath(store, `/${c.slug}`)}
                className="group grid h-full grid-cols-[7.25rem_1fr] border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground sm:flex sm:flex-col"
              >
                <div className="relative min-h-28 overflow-hidden border-r border-border bg-white sm:h-44 sm:w-full sm:border-b sm:border-r-0">
                  <Image
                    src={c.image || "/placeholder.svg"}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 120px"
                    className="object-contain object-center p-3 transition-transform duration-500 group-hover:scale-[1.04] sm:p-5"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-3 p-3.5 sm:gap-4 sm:p-5">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-expanded text-lg font-extrabold uppercase sm:text-xl">{copy.name}</h3>
                      {count !== null && (
                        <span className="border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:hidden">
                          {fmt(t.home.listed, { n: count })}
                        </span>
                      )}
                    </div>
                    <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">{copy.blurb}</p>
                    {count !== null && (
                      <p className="hidden font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground sm:block">
                        {fmt(t.home.listed, { n: count })}
                      </p>
                    )}
                  </div>
                  <ArrowUpRight
                    className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:size-5"
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
