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
  SPEED_RATINGS,
  TIRE_OPTIONS,
  filterProducts,
  finishFamily,
  isCategory,
  localizeProduct,
  offsetBand,
  type Category,
  type Product,
} from "@/lib/catalog"
import { getProductsByCategory } from "@/lib/catalog/queries"
import { ALL_STORES, fmt, getDictionary, parseStore, storePath, type Dictionary, type Store } from "@/lib/i18n"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ProductCard } from "@/components/product/product-card"
import { FilterSelect } from "@/components/catalog/filter-select"
import { Button } from "@/components/ui/button"

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
  const all = (await getProductsByCategory(store.market, category)).map((p) => localizeProduct(p, store))
  const products = filterProducts(all, filters, store.market)
  const active = Object.values(filters).some(Boolean)

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

      <form method="get" className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-end">
        <fieldset className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
          <legend className="sr-only">{fmt(t.catalog.filter, { category: copy.name })}</legend>
          <CategoryFilters category={category} products={all} filters={filters} store={store} t={t} />
        </fieldset>
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg">
            {t.catalog.apply}
          </Button>
          {active && (
            <Link href={storePath(store, `/${category}`)} className="text-sm underline underline-offset-4">
              {t.catalog.clear}
            </Link>
          )}
        </div>
      </form>

      {products.length > 0 ? (
        <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} store={store} />
          ))}
        </div>
      ) : (
        <EmptyState store={store} category={category} t={t} />
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
    </>
  )

  if (category === "tires") {
    const loads = unique(products.map((p) => (p.category === "tires" ? String(p.tire.loadIndex) : "")))
    return (
      <>
        <FilterSelect name="width" label={c.width} any={any} value={filters.width} options={TIRE_OPTIONS.width.map(String)} />
        <FilterSelect name="aspect" label={c.profile} any={any} value={filters.aspect} options={TIRE_OPTIONS.aspect.map(String)} />
        <FilterSelect
          name="rim"
          label={c.rim}
          any={any}
          value={filters.rim}
          options={TIRE_OPTIONS.rim.map(String)}
          labels={Object.fromEntries(TIRE_OPTIONS.rim.map((rim) => [String(rim), `R${rim}`]))}
        />
        <FilterSelect name="season" label={c.season} any={any} value={filters.season} options={Object.keys(t.labels.season)} labels={t.labels.season} />
        <FilterSelect name="speed" label={c.speed} any={any} value={filters.speed} options={[...SPEED_RATINGS]} />
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
