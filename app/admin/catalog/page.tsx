import Image from "next/image"
import Link from "next/link"
import { asc } from "drizzle-orm"
import { Plus } from "lucide-react"
import { isAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { CATEGORIES } from "@/lib/catalog"
import { formatPrice, markets } from "@/lib/markets"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORY_RU = { tires: "Шины", wheels: "Диски", brakes: "Тормоза" } as const

export default async function AdminCatalogPage() {
  if (!(await isAdmin())) return null
  const rows = await db.select().from(products).orderBy(asc(products.category), asc(products.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-expanded text-2xl font-extrabold uppercase">Каталог</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} товаров · архивные скрыты с витрины, из фидов и sitemap.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/admin/catalog/new?category=${c.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" />
              {CATEGORY_RU[c.slug]}
            </Link>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-px border border-border bg-border">
        {rows.map(({ id, data, archived }) => (
          <li key={id}>
            <Link href={`/admin/catalog/${encodeURIComponent(id)}`} className={cn("flex items-center gap-4 bg-card p-3 transition-colors hover:bg-muted", archived && "opacity-60")}>
              <div className="relative size-14 shrink-0 bg-photo">
                {data.images[0] && <Image src={data.images[0]} alt="" fill className="object-contain p-1" sizes="56px" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{data.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {CATEGORY_RU[data.category]} · {data.brand} · {data.slug}
                </span>
              </div>
              <div className="hidden flex-col items-end gap-0.5 font-mono text-xs tabular-nums sm:flex">
                {markets.map((m) =>
                  data.offers[m] ? (
                    <span key={m}>
                      {m.toUpperCase()} {formatPrice(data.offers[m]!.priceCents, m, "ru-RU")}
                    </span>
                  ) : null,
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {archived && <span className="bg-muted px-2 py-0.5 text-xs">Архив</span>}
                {data.sample && <span className="bg-primary/15 px-2 py-0.5 text-xs text-primary">Демо</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
