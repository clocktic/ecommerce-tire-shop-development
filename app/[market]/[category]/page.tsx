import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BRAKE_KIND_LABEL,
  CATEGORIES,
  SEASON_LABEL,
  TIRE_OPTIONS,
  filterProducts,
  getCategory,
  getProductsByCategory,
  isCategory,
  type Category,
  type Product,
} from "@/lib/catalog"
import { MARKETS, isMarket, markets, type Market } from "@/lib/markets"
import { marketAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ProductCard } from "@/components/product/product-card"
import { FilterSelect } from "@/components/catalog/filter-select"
import { Button } from "@/components/ui/button"

type Params = Promise<{ market: string; category: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

export function generateStaticParams() {
  return markets.flatMap((market) => CATEGORIES.map((c) => ({ market, category: c.slug })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, category } = await params
  if (!isMarket(market) || !isCategory(category)) return {}
  const c = getCategory(category)
  return {
    title: `${c.name} — ${MARKETS[market].short} store`,
    description: c.blurb,
    alternates: marketAlternates(market, `/${category}`),
  }
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { market, category } = await params
  if (!isMarket(market) || !isCategory(category)) notFound()

  const raw = await searchParams
  const filters = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === "string" && v !== "" ? v : undefined]),
  )
  const c = getCategory(category)
  const all = getProductsByCategory(market, category)
  const products = filterProducts(all, filters)
  const active = Object.values(filters).some(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs items={[{ href: `/${market}`, label: "Home" }, { label: c.name }]} />

      <header className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <p className="label-caps text-primary">{MARKETS[market].short} store</p>
          <h1 className="font-expanded text-4xl font-extrabold uppercase leading-none md:text-6xl">{c.name}</h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">{c.blurb}</p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {products.length} of {all.length} {all.length === 1 ? "product" : "products"}
        </p>
      </header>

      <form method="get" className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-end">
        <fieldset className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          <legend className="sr-only">Filter {c.name.toLowerCase()}</legend>
          <CategoryFilters category={category} products={all} filters={filters} />
        </fieldset>
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg">
            Apply
          </Button>
          {active && (
            <Link href={`/${market}/${category}`} className="text-sm underline underline-offset-4">
              Clear
            </Link>
          )}
        </div>
      </form>

      {products.length > 0 ? (
        <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} market={market} />
          ))}
        </div>
      ) : (
        <EmptyState market={market} category={category} />
      )}
    </div>
  )
}

function CategoryFilters({
  category,
  products,
  filters,
}: {
  category: Category
  products: Product[]
  filters: Record<string, string | undefined>
}) {
  if (category === "tires") {
    return (
      <>
        <FilterSelect name="width" label="Width" value={filters.width} options={TIRE_OPTIONS.width.map(String)} />
        <FilterSelect name="aspect" label="Profile" value={filters.aspect} options={TIRE_OPTIONS.aspect.map(String)} />
        <FilterSelect
          name="rim"
          label="Rim"
          value={filters.rim}
          options={TIRE_OPTIONS.rim.map(String)}
          format={(v) => `R${v}`}
        />
        <FilterSelect
          name="season"
          label="Season"
          value={filters.season}
          options={Object.keys(SEASON_LABEL)}
          format={(v) => SEASON_LABEL[v as keyof typeof SEASON_LABEL]}
        />
      </>
    )
  }
  if (category === "wheels") {
    const diameters = unique(products.map((p) => (p.category === "wheels" ? String(p.wheel.diameter) : "")))
    const bolts = unique(products.map((p) => (p.category === "wheels" ? p.wheel.boltPattern : "")))
    return (
      <>
        <FilterSelect name="diameter" label="Diameter" value={filters.diameter} options={diameters} format={(v) => `${v}"`} />
        <FilterSelect name="bolt" label="Bolt pattern" value={filters.bolt} options={bolts} format={(v) => v.replace("x", "×")} />
      </>
    )
  }
  return (
    <>
      <FilterSelect
        name="kind"
        label="Type"
        value={filters.kind}
        options={Object.keys(BRAKE_KIND_LABEL)}
        format={(v) => BRAKE_KIND_LABEL[v as keyof typeof BRAKE_KIND_LABEL]}
      />
      <FilterSelect
        name="axle"
        label="Axle"
        value={filters.axle}
        options={["front", "rear"]}
        format={(v) => (v === "front" ? "Front" : "Rear")}
      />
    </>
  )
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

function EmptyState({ market, category }: { market: Market; category: Category }) {
  return (
    <div className="flex flex-col items-start gap-3 py-16">
      <p className="font-expanded text-xl font-extrabold uppercase">No exact match</p>
      <p className="max-w-lg leading-relaxed text-muted-foreground">
        Nothing in this size or configuration yet. The full catalog is being loaded — contact us and we will check
        availability for you.
      </p>
      <div className="flex gap-4">
        <Link href={`/${market}/${category}`} className="underline underline-offset-4">
          Show all
        </Link>
        <Link href={`/${market}/contact`} className="underline underline-offset-4">
          Ask about a size
        </Link>
      </div>
    </div>
  )
}
