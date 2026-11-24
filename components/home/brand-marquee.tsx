import Link from "next/link"
import { getProductBrandIconUrl } from "@/lib/brand-icons"
import { readProducts } from "@/lib/catalog/queries"
import type { Category } from "@/lib/catalog/types"
import { localeMeta, storePath, type ContentLang, type Store } from "@/lib/i18n"

type MarqueeBrand = {
  name: string
  category: Category
  iconUrl: string
}

const COPY: Record<ContentLang, { eyebrow: string; viewAll: string; region: string }> = {
  en: { eyebrow: "Explore by brand", viewAll: "All brands", region: "Explore by brand" },
  de: { eyebrow: "Nach Marke entdecken", viewAll: "Alle Marken", region: "Nach Marke entdecken" },
  fr: { eyebrow: "Explorer par marque", viewAll: "Toutes les marques", region: "Explorer par marque" },
  it: { eyebrow: "Esplora per marchio", viewAll: "Tutti i marchi", region: "Esplora per marchio" },
  es: { eyebrow: "Explorar por marca", viewAll: "Todas las marcas", region: "Explorar por marca" },
  "es-419": { eyebrow: "Explorar por marca", viewAll: "Todas las marcas", region: "Explorar por marca" },
  nl: { eyebrow: "Ontdek per merk", viewAll: "Alle merken", region: "Ontdek per merk" },
}

// Interleaved flagship brands across tires, wheels, and brakes for balanced visual variety.
const PRIORITY_BRANDS: ReadonlyArray<{ name: string; category: Category }> = [
  { name: "Michelin", category: "tires" },
  { name: "Brembo", category: "brakes" },
  { name: "BBS", category: "wheels" },
  { name: "Pirelli", category: "tires" },
  { name: "OZ Racing", category: "wheels" },
  { name: "Bosch", category: "brakes" },
  { name: "Bridgestone", category: "tires" },
  { name: "Enkei", category: "wheels" },
  { name: "Continental", category: "tires" },
  { name: "EBC", category: "brakes" },
  { name: "Goodyear", category: "tires" },
  { name: "Rotiform", category: "wheels" },
  { name: "Hankook", category: "tires" },
  { name: "Borbet", category: "wheels" },
  { name: "Yokohama", category: "tires" },
  { name: "PowerStop", category: "brakes" },
  { name: "Nokian", category: "tires" },
  { name: "Konig", category: "wheels" },
  { name: "BFGoodrich", category: "tires" },
  { name: "Method", category: "wheels" },
  { name: "Falken", category: "tires" },
  { name: "Ronal", category: "wheels" },
  { name: "Dunlop", category: "tires" },
  { name: "Ferodo", category: "brakes" },
]

function fallbackBrands(): MarqueeBrand[] {
  const result: MarqueeBrand[] = []
  for (const item of PRIORITY_BRANDS) {
    const iconUrl = getProductBrandIconUrl(item.name)
    if (iconUrl) result.push({ name: item.name, category: item.category, iconUrl })
  }
  return result
}

export async function BrandMarquee({ store }: { store: Store }) {
  const { content } = localeMeta(store)
  const copy = COPY[content]
  const catalog = await readProducts(store.market)

  let items: MarqueeBrand[] = []
  let totalBrands = PRIORITY_BRANDS.length

  if (catalog.ok && catalog.data.length > 0) {
    const byBrand = new Map<string, { counts: Partial<Record<Category, number>>; total: number }>()
    for (const product of catalog.data) {
      const entry = byBrand.get(product.brand) ?? { counts: {}, total: 0 }
      entry.counts[product.category] = (entry.counts[product.category] ?? 0) + 1
      entry.total += 1
      byBrand.set(product.brand, entry)
    }

    totalBrands = byBrand.size

    const primaryCategory = (brand: string, fallback: Category): Category => {
      const entry = byBrand.get(brand)
      if (!entry) return fallback
      let best: Category = fallback
      let max = -1
      for (const [cat, count] of Object.entries(entry.counts) as [Category, number][]) {
        if (count > max) {
          max = count
          best = cat
        }
      }
      return best
    }

    const picked = new Set<string>()
    for (const p of PRIORITY_BRANDS) {
      if (!byBrand.has(p.name)) continue
      const iconUrl = getProductBrandIconUrl(p.name)
      if (!iconUrl) continue
      items.push({ name: p.name, category: primaryCategory(p.name, p.category), iconUrl })
      picked.add(p.name)
    }

    if (items.length < 18) {
      const remaining = [...byBrand.entries()]
        .filter(([name]) => !picked.has(name))
        .sort((a, b) => b[1].total - a[1].total)
      for (const [name] of remaining) {
        if (items.length >= 24) break
        const iconUrl = getProductBrandIconUrl(name)
        if (!iconUrl) continue
        items.push({ name, category: primaryCategory(name, "tires"), iconUrl })
      }
    }
  }

  if (items.length === 0) {
    items = fallbackBrands()
    totalBrands = items.length
  }

  const brandHref = (b: MarqueeBrand) =>
    storePath(store, `/${b.category}?brand=${encodeURIComponent(b.name)}`)

  const renderTrack = (duplicate: boolean) => (
    <ul
      aria-hidden={duplicate || undefined}
      className="flex shrink-0 items-center gap-3 pr-3 sm:gap-3.5 sm:pr-3.5"
    >
      {items.map((brand) => (
        <li key={duplicate ? `${brand.name}-dup` : brand.name} className="shrink-0">
          <Link
            href={brandHref(brand)}
            tabIndex={duplicate ? -1 : undefined}
            title={brand.name}
            className="group/brand flex h-12 items-center justify-center rounded-full border border-border/80 bg-white px-5 shadow-chip transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-lifted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-13 sm:px-6"
          >
            <img
              src={brand.iconUrl}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="h-5 w-auto max-w-[104px] object-contain opacity-90 transition-opacity duration-200 group-hover/brand:opacity-100 sm:h-6 sm:max-w-[120px]"
            />
            {!duplicate && <span className="sr-only">{brand.name}</span>}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <section aria-label={copy.region} className="pt-8 sm:pt-10">
      <div className="mx-auto mb-3 flex max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {copy.eyebrow} · {totalBrands}+
        </p>
        <Link
          href={storePath(store, "/tires")}
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {copy.viewAll}
        </Link>
      </div>

      <div className="group relative mx-auto max-w-7xl overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="animate-brand-marquee flex w-max items-center group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {renderTrack(false)}
          {renderTrack(true)}
        </div>
      </div>
    </section>
  )
}
