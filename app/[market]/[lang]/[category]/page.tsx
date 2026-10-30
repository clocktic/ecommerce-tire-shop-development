import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CATEGORIES,
  DISC_OPTIONS,
  FINISH_FAMILIES,
  OFFSET_BANDS,
  PISTON_OPTIONS,
  PRICE_BANDS,
  filterProducts,
  finishFamily,
  isCategory,
  localizeProduct,
  offsetBand,
  type Category,
  type Product,
} from "@/lib/catalog"
import { readProductsByCategory } from "@/lib/catalog/queries"
import { CatalogUnavailable } from "@/components/catalog/catalog-unavailable"
import { ALL_STORES, fmt, getDictionary, parseStore, storePath, type Dictionary, type Store } from "@/lib/i18n"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ProductCard } from "@/components/product/product-card"
import { FilterSelect } from "@/components/catalog/filter-select"
import { FitmentBanner } from "@/components/garage/fitment-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TireModelCard } from "@/components/product/tire-model-card"
import type { TireProduct } from "@/lib/catalog/types"
import { X } from "lucide-react"

type Params = Promise<{ market: string; lang: string; category: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

export function generateStaticParams() {
  return ALL_STORES.flatMap(({ market, lang }) => CATEGORIES.map((c) => ({ market, lang, category: c.slug })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang, category } = await params
  const store = parseStore(market, lang)
  if (!store || !isCategory(category)) return {}
  const t = getDictionary(store)
  const copy = t.categories[category]
  return {
    title: fmt(t.catalog.metaTitle, { category: copy.name }),
    description: copy.blurb,
    alternates: storeAlternates(store, `/${category}`),
  }
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { market, lang, category } = await params
  const store = parseStore(market, lang)
  if (!store || !isCategory(category)) notFound()

  const t = getDictionary(store)
  const raw = await searchParams
  const filters = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === "string" && v !== "" ? v : undefined]),
  )
  const copy = t.categories[category]
  const catalog = await readProductsByCategory(store.market, category)
  if (!catalog.ok) return <div className="mx-auto max-w-7xl px-4 md:px-6"><CatalogUnavailable store={store} /></div>
  const all = catalog.data.map((p) => localizeProduct(p, store))
  const filtered = filterProducts(all, filters, store.market)
  const sortMode = filters.sort ?? "featured"
  const products = [...filtered].sort((a, b) => {
    const priceA = a.offers[store.market]?.priceCents ?? 0
    const priceB = b.offers[store.market]?.priceCents ?? 0
    if (sortMode === "price-asc") return priceA - priceB
    if (sortMode === "price-desc") return priceB - priceA
    if (sortMode === "brand-asc") return a.brand.localeCompare(b.brand)
    return 0
  })
  const activeEntries = Object.entries(filters).filter(
    (entry): entry is [string, string] =>
      Boolean(entry[1]) && entry[0] !== "page" && entry[0] !== "sort",
  )
  const active = activeEntries.length > 0 || Boolean(filters.sort)
  const removeFilterHref = (keyToRemove: string) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(
        (e): e is [string, string] =>
          typeof e[1] === "string" && e[0] !== keyToRemove && e[0] !== "page",
      ),
    )
    const qs = query.toString()
    return qs ? `${storePath(store, `/${category}`)}?${qs}` : storePath(store, `/${category}`)
  }
  const grouped = new Map<string, Product[]>()
  for (const product of products) {
    const key = product.category === 'tires' ? `${product.brand}:${product.tire.model || product.name}` : product.id
    const group = grouped.get(key) || []
    group.push(product)
    grouped.set(key, group)
  }
  const groups = [...grouped.values()]
  const pages = category === 'tires' ? Math.max(1, Math.ceil(groups.length / 24)) : 1
  const page = Math.min(pages, Math.max(1, Number.parseInt(filters.page || '1', 10) || 1))
  const visible = category === 'tires' ? groups.slice((page - 1) * 24, page * 24) : groups
  const pageHref = (n: number) => {
    const query = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => typeof e[1] === 'string'))
    query.set('page', String(n))
    return `${storePath(store, `/${category}`)}?${query}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: copy.name }]} />

      <header className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <p className="label-caps text-primary">{t.catalog.eyebrow}</p>
          <h1 className="font-expanded text-4xl font-extrabold uppercase leading-none md:text-6xl">{copy.name}</h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">{copy.blurb}</p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {fmt(t.catalog.count, { shown: products.length, total: all.length })}
        </p>
      </header>

      <FitmentBanner category={category} filters={filters} matchingCount={products.length} />

      <form method="get" className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-end">
        {filters.vehicle && <input type="hidden" name="vehicle" value={filters.vehicle} />}
        <fieldset className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
          <legend className="sr-only">{fmt(t.catalog.filter, { category: copy.name })}</legend>
          <CategoryFilters category={category} products={all} filters={filters} store={store} t={t} />
        </fieldset>
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" className="flex-1 md:flex-initial">
            {t.catalog.apply}
          </Button>
          {active && (
            <Link href={storePath(store, `/${category}`)} className="text-sm underline underline-offset-4">
              {t.catalog.clear}
            </Link>
          )}
        </div>
      </form>

      {activeEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {activeEntries.map(([key, val]) => (
            <Link key={key} href={removeFilterHref(key)}>
              <Badge
                variant="secondary"
                className="h-7 gap-1.5 rounded-none border border-border px-2.5 font-mono text-xs uppercase hover:border-primary"
              >
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-semibold text-foreground">{val}</span>
                <X className="size-3 text-muted-foreground" aria-hidden="true" />
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map(group => {
            const p = group[0]
            if (p.category !== 'tires') return <ProductCard key={p.slug} product={p} store={store} />
            const variants = group.filter((v): v is TireProduct => v.category === 'tires')
              .sort((a, b) => a.offers[store.market]!.priceCents - b.offers[store.market]!.priceCents)
              .map(({ id, slug, brand, name, mpn, gtin, images, offers, tire }) => ({ id, slug, brand, name, mpn, gtin, images, offers, tire }))
            return <TireModelCard key={`${p.brand}:${p.tire.model || p.name}`} variants={variants} store={store} />
          })}
        </div>
      ) : (
        <EmptyState store={store} category={category} t={t} />
      )}
      {pages > 1 && (
        <nav aria-label={copy.name} className="flex flex-wrap items-center justify-center gap-1.5 pb-8 font-mono text-sm">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              rel="prev"
              className="flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
            >
              ←
            </Link>
          )}
          {visiblePageNumbers(page, pages).map((item, idx) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${idx}`} className="flex h-9 min-w-7 items-center justify-center text-muted-foreground">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={pageHref(item)}
                aria-current={item === page ? "page" : undefined}
                className={
                  item === page
                    ? "flex h-9 min-w-9 items-center justify-center border border-primary bg-primary px-2.5 font-semibold text-primary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5"
                    : "flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
                }
              >
                {item}
              </Link>
            ),
          )}
          {page < pages && (
            <Link
              href={pageHref(page + 1)}
              rel="next"
              className="flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
            >
              →
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}

function CategoryFilters({
  category,
  products,
  filters,
  store,
  t,
}: {
  category: Category
  products: Product[]
  filters: Record<string, string | undefined>
  store: Store
  t: Dictionary
}) {
  const c = t.catalog
  const any = c.any
  const brands = unique(products.map((p) => p.brand))
  const yesNo = { yes: c.yes, no: c.no }
  const shared = (
    <>
      {brands.length > 0 && <FilterSelect name="brand" label={c.brand} any={any} value={filters.brand} options={brands} />}
      <FilterSelect
        name="price"
        label={c.price}
        any={any}
        value={filters.price}
        options={PRICE_BANDS.map((band) => band.id)}
        labels={priceLabels(store, t)}
      />
      <FilterSelect
        name="stock"
        label={c.stock}
        any={any}
        value={filters.stock}
        options={Object.keys(t.labels.availability)}
        labels={t.labels.availability}
      />
      <FilterSelect
        name="sort"
        label="Sort"
        any="Featured"
        value={filters.sort}
        options={["price-asc", "price-desc", "brand-asc"]}
        labels={{
          "price-asc": "Price: Low → High",
          "price-desc": "Price: High → Low",
          "brand-asc": "Brand: A → Z",
        }}
      />
    </>
  )

  if (category === "tires") {
    const tires = products.filter((p): p is TireProduct => p.category === 'tires')
    const options = (key: 'width' | 'aspect' | 'rim' | 'loadIndex' | 'speedRating') => unique(tires.map(p => String(p.tire[key]))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    const loads = options('loadIndex')
    const rims = options('rim')
    return (
      <>
        <FilterSelect name="width" label={c.width} any={any} value={filters.width} options={options('width')} />
        <FilterSelect name="aspect" label={c.profile} any={any} value={filters.aspect} options={options('aspect')} />
        <FilterSelect
          name="rim"
          label={c.rim}
          any={any}
          value={filters.rim}
          options={rims}
          labels={Object.fromEntries(rims.map((rim) => [rim, `R${rim}`]))}
        />
        <FilterSelect name="season" label={c.season} any={any} value={filters.season} options={Object.keys(t.labels.season)} labels={t.labels.season} />
        <FilterSelect name="speed" label={c.speed} any={any} value={filters.speed} options={options('speedRating')} />
        {loads.length > 0 && <FilterSelect name="load" label={c.load} any={any} value={filters.load} options={loads} />}
        <FilterSelect name="runFlat" label={c.runFlat} any={any} value={filters.runFlat} options={["yes", "no"]} labels={yesNo} />
        <FilterSelect name="extraLoad" label={c.extraLoad} any={any} value={filters.extraLoad} options={["yes", "no"]} labels={yesNo} />
        {shared}
      </>
    )
  }

  if (category === "wheels") {
    const wheels = products.filter((p) => p.category === "wheels")
    const diameters = unique(wheels.map((p) => String(p.wheel.diameter)))
    const widths = unique(wheels.map((p) => String(p.wheel.width)))
    const bolts = unique(wheels.map((p) => p.wheel.boltPattern))
    const bores = unique(wheels.map((p) => String(p.wheel.centerBore)))
    const finishes = FINISH_FAMILIES.filter((family) => wheels.some((p) => finishFamily(p.wheel.finish) === family))
    const offsets = OFFSET_BANDS.filter((band) => wheels.some((p) => offsetBand(p.wheel.offset) === band))
    const constructions = unique(wheels.map((p) => p.wheel.construction))
    return (
      <>
        <FilterSelect name="diameter" label={c.diameter} any={any} value={filters.diameter} options={diameters} labels={Object.fromEntries(diameters.map((d) => [d, `${d}"`]))} />
        <FilterSelect name="width" label={c.width} any={any} value={filters.width} options={widths} labels={Object.fromEntries(widths.map((w) => [w, `${w}"`]))} />
        <FilterSelect name="bolt" label={c.bolt} any={any} value={filters.bolt} options={bolts} labels={Object.fromEntries(bolts.map((b) => [b, b.replace("x", "×")]))} />
        <FilterSelect name="offset" label={c.offset} any={any} value={filters.offset} options={[...offsets]} labels={c.offsetBand} />
        <FilterSelect name="bore" label={c.bore} any={any} value={filters.bore} options={bores} labels={Object.fromEntries(bores.map((b) => [b, `${b} mm`]))} />
        <FilterSelect name="finish" label={c.finish} any={any} value={filters.finish} options={[...finishes]} labels={c.finishFamily} />
        <FilterSelect name="construction" label={c.construction} any={any} value={filters.construction} options={constructions} />
        {shared}
      </>
    )
  }

  const discs = unique([
    ...DISC_OPTIONS,
    ...products.map((p) => (p.category === "brakes" && p.brake.discDiameterMm ? String(p.brake.discDiameterMm) : "")),
  ])
  return (
    <>
      <FilterSelect name="kind" label={c.type} any={any} value={filters.kind} options={Object.keys(t.labels.brakeKind)} labels={t.labels.brakeKind} />
      <FilterSelect name="axle" label={c.axle} any={any} value={filters.axle} options={["front", "rear"]} labels={t.labels.axleShort} />
      <FilterSelect name="pistons" label={c.pistons} any={any} value={filters.pistons} options={[...PISTON_OPTIONS]} />
      <FilterSelect name="disc" label={c.disc} any={any} value={filters.disc} options={discs} labels={Object.fromEntries(discs.map((d) => [d, `${d} mm`]))} />
      {shared}
    </>
  )
}

function priceLabels(store: Store, t: Dictionary): Record<string, string> {
  const symbol = store.market === "us" ? "$" : "€"
  return {
    "200": fmt(t.catalog.under, { n: `${symbol}200` }),
    "400": `${symbol}200–${symbol}400`,
    "800": `${symbol}400–${symbol}800`,
    "800+": fmt(t.catalog.over, { n: `${symbol}800` }),
  }
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

function visiblePageNumbers(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const result: Array<number | "ellipsis"> = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      result.push("ellipsis")
    }
    result.push(sorted[i]!)
  }
  return result
}

function EmptyState({ store, category, t }: { store: Store; category: Category; t: Dictionary }) {
  return (
    <div className="flex flex-col items-start gap-3 py-16">
      <p className="font-expanded text-xl font-extrabold uppercase">{t.catalog.emptyTitle}</p>
      <p className="max-w-lg leading-relaxed text-muted-foreground">{t.catalog.emptyText}</p>
      <div className="flex gap-4">
        <Link href={storePath(store, `/${category}`)} className="underline underline-offset-4">
          {t.catalog.showAll}
        </Link>
        <Link href={storePath(store, "/contact")} className="underline underline-offset-4">
          {t.catalog.askSize}
        </Link>
      </div>
    </div>
  )
}
