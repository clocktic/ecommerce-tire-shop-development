import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { CATEGORIES } from "@/lib/catalog"
import { getProducts } from "@/lib/catalog/queries"
import { fmt, getDictionary, storePath, type Store } from "@/lib/i18n"

export async function CategoryTiles({ store }: { store: Store }) {
  const t = getDictionary(store)
  const products = await getProducts(store.market)
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="categories-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
          {t.home.systems}
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.category === c.slug).length
          const copy = t.categories[c.slug]
          return (
            <li key={c.slug}>
              <Link
                href={storePath(store, `/${c.slug}`)}
                className="group flex h-full flex-col border border-border bg-card transition-colors hover:border-foreground"
              >
                <div className="relative h-36 overflow-hidden bg-photo sm:h-44">
                  <Image
                    src={c.image || "/placeholder.svg"}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-4 p-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-expanded text-xl font-extrabold uppercase">{copy.name}</h3>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{copy.blurb}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {fmt(t.home.listed, { n: count })}
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
