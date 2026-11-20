import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ShieldCheck, Truck, Disc3, CircleDot, X } from "lucide-react"
import { localizeProduct, type Product } from "@/lib/catalog"
import { readProductsByCategory } from "@/lib/catalog/queries"
import { getRatingsBySlug } from "@/lib/stamped-reviews"
import { ALL_STORES, fmt, getDictionary, parseStore, storePath } from "@/lib/i18n"
import { getCommercialCopy } from "@/lib/i18n/commercial"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ProductCard } from "@/components/product/product-card"
import { CatalogUnavailable } from "@/components/catalog/catalog-unavailable"
import { Badge } from "@/components/ui/badge"

type Params = Promise<{ market: string; lang: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

export function generateStaticParams() {
  return ALL_STORES.map(({ market, lang }) => ({ market, lang }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const copy = getCommercialCopy(store)
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: storeAlternates(store, "/commercial"),
  }
}

function isCommercialProduct(p: Product): boolean {
  if (p.category === "tires") return !Number.isInteger(p.tire.rim)
  if (p.category === "wheels") return !Number.isInteger(p.wheel.diameter)
  return false
}

function commercialSizeKey(p: Product): string {
  if (p.category === "tires") return `${p.tire.width}/${p.tire.aspect}R${p.tire.rim}`
  if (p.category === "wheels") return `${p.wheel.diameter}x${p.wheel.width}`
  return ""
}

export default async function CommercialPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()

  const t = getDictionary(store)
  const copy = getCommercialCopy(store)
  const raw = await searchParams
  const typeFilter = typeof raw.type === "string" ? raw.type : "all"
  const sizeFilter = typeof raw.size === "string" && raw.size ? raw.size : undefined
  const brandFilter = typeof raw.brand === "string" && raw.brand ? raw.brand : undefined
  const pcdFilter = typeof raw.pcd === "string" && raw.pcd ? raw.pcd : undefined
  const sortMode = typeof raw.sort === "string" && raw.sort ? raw.sort : "featured"

  const [tiresRes, wheelsRes, ratings] = await Promise.all([
    readProductsByCategory(store.market, "tires"),
    readProductsByCategory(store.market, "wheels"),
    getRatingsBySlug(),
  ])

  if (!tiresRes.ok || !wheelsRes.ok) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <CatalogUnavailable store={store} />
      </div>
    )
  }

  const allTires = tiresRes.data.filter(isCommercialProduct).map((p) => localizeProduct(p, store))
  const allWheels = wheelsRes.data.filter(isCommercialProduct).map((p) => localizeProduct(p, store))
  const allCommercial: Product[] = [...allTires, ...allWheels]

  const baseList =
    typeFilter === "tires" ? allTires : typeFilter === "wheels" ? allWheels : allCommercial

  // Build available sizes and brands for current type tab
  const sizeCounts = new Map<string, number>()
  const brandCounts = new Map<string, number>()
  for (const p of baseList) {
    const s = commercialSizeKey(p)
    if (s) sizeCounts.set(s, (sizeCounts.get(s) ?? 0) + 1)
    brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1)
  }
  const sizes = [...sizeCounts.entries()].sort((a, b) => {
    if (a[0] === "385/65R22.5") return -1
    if (b[0] === "385/65R22.5") return 1
    return b[1] - a[1] || a[0].localeCompare(b[0])
  })
  const brands = [...brandCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  const filtered = baseList.filter((p) => {
    if (sizeFilter && commercialSizeKey(p) !== sizeFilter) return false
    if (brandFilter && p.brand !== brandFilter) return false
    if (pcdFilter) {
      if (p.category !== "wheels" || p.wheel.boltPattern !== pcdFilter) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const priceA = a.offers[store.market]?.priceCents ?? 0
    const priceB = b.offers[store.market]?.priceCents ?? 0
    if (sortMode === "price-asc") return priceA - priceB
    if (sortMode === "price-desc") return priceB - priceA
    if (sortMode === "brand-asc") return a.brand.localeCompare(b.brand)
    return 0
  })

  const buildHref = (patch: Record<string, string | undefined>) => {
    const next: Record<string, string | undefined> = {
      type: typeFilter !== "all" ? typeFilter : undefined,
      size: sizeFilter,
      brand: brandFilter,
      pcd: pcdFilter,
      sort: sortMode !== "featured" ? sortMode : undefined,
      ...patch,
    }
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "type" && v === "all") && !(k === "sort" && v === "featured")) {
        q.set(k, v)
      }
    }
    const qs = q.toString()
    return qs ? `${storePath(store, "/commercial")}?${qs}` : storePath(store, "/commercial")
  }

  const hasFilters = Boolean(sizeFilter || brandFilter || pcdFilter || typeFilter !== "all")

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: t.common.home, href: storePath(store, "/") },
          { label: copy.nav },
        ]}
      />

      {/* Commercial Hero Banner */}
      <section className="mt-4 rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary">
              <Truck className="size-4" aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {copy.title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground md:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              {copy.complianceUs}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              {copy.complianceEu}
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <Link
            href={buildHref({ type: "all", size: undefined, pcd: undefined })}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              typeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:border-primary/50"
            }`}
          >
            <Truck className="size-4" aria-hidden="true" />
            <span>{copy.tabAll}</span>
            <span className="font-mono text-xs opacity-80">({allCommercial.length})</span>
          </Link>
          <Link
            href={buildHref({ type: "tires", size: undefined, pcd: undefined })}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              typeFilter === "tires"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:border-primary/50"
            }`}
          >
            <CircleDot className="size-4" aria-hidden="true" />
            <span>{copy.tabTires}</span>
            <span className="font-mono text-xs opacity-80">({allTires.length})</span>
          </Link>
          <Link
            href={buildHref({ type: "wheels", size: undefined })}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              typeFilter === "wheels"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:border-primary/50"
            }`}
          >
            <Disc3 className="size-4" aria-hidden="true" />
            <span>{copy.tabWheels}</span>
            <span className="font-mono text-xs opacity-80">({allWheels.length})</span>
          </Link>
        </div>
      </section>

      {/* Filters Row */}
      <section className="mt-5 space-y-3">
        {/* Size Quick-Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={buildHref({ size: undefined })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              !sizeFilter
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {copy.allSizes}
          </Link>
          {sizes.map(([size, count]) => (
            <Link
              key={size}
              href={buildHref({ size })}
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                sizeFilter === size
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {size} <span className="opacity-70">({count})</span>
            </Link>
          ))}
        </div>

        {/* Wheel Bolt Pattern Standard Chips (shown for All or Wheels) */}
        {typeFilter !== "tires" && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={buildHref({ pcd: undefined })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                !pcdFilter
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {copy.allStandards}
            </Link>
            <Link
              href={buildHref({ type: "wheels", pcd: "10x285.75", size: undefined })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                pcdFilter === "10x285.75"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {copy.standardUs}
            </Link>
            <Link
              href={buildHref({ type: "wheels", pcd: "10x335", size: undefined })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                pcdFilter === "10x335"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {copy.standardEu}
            </Link>
          </div>
        )}

        {/* Brand Filter Strip + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={buildHref({ brand: undefined })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                !brandFilter
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {copy.allBrands}
            </Link>
            {brands.map(([brand, count]) => (
              <Link
                key={brand}
                href={buildHref({ brand })}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  brandFilter === brand
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {brand} <span className="opacity-70">({count})</span>
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">
              {fmt(copy.showingCount, { count: sorted.length })}
            </span>
            <div className="flex items-center gap-1">
              {[
                { key: "featured", label: copy.sortFeatured },
                { key: "price-asc", label: copy.sortPriceAsc },
                { key: "price-desc", label: copy.sortPriceDesc },
              ].map((s) => (
                <Link
                  key={s.key}
                  href={buildHref({ sort: s.key })}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    sortMode === s.key
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {sizeFilter && (
              <Badge variant="secondary" className="gap-1 font-mono text-xs">
                {sizeFilter}
                <Link href={buildHref({ size: undefined })} aria-label={`Remove ${sizeFilter}`}>
                  <X className="size-3" />
                </Link>
              </Badge>
            )}
            {brandFilter && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {brandFilter}
                <Link href={buildHref({ brand: undefined })} aria-label={`Remove ${brandFilter}`}>
                  <X className="size-3" />
                </Link>
              </Badge>
            )}
            {pcdFilter && (
              <Badge variant="secondary" className="gap-1 font-mono text-xs">
                {pcdFilter}
                <Link href={buildHref({ pcd: undefined })} aria-label={`Remove ${pcdFilter}`}>
                  <X className="size-3" />
                </Link>
              </Badge>
            )}
            <Link
              href={storePath(store, "/commercial")}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              {copy.resetFilters}
            </Link>
          </div>
        )}
      </section>

      {/* Product Grid */}
      {sorted.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">{copy.emptyState}</p>
          <Link
            href={storePath(store, "/commercial")}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {copy.resetFilters}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              store={store}
              rating={ratings.get(product.slug)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
