import { CATEGORIES, type Category } from "@/lib/catalog"
import { readProducts } from "@/lib/catalog/queries"
import { tireModelKey } from "@/lib/catalog/tire-variants"
import { fmt, getDictionary, storePath, type Store } from "@/lib/i18n"
import { ShopBySystem, type AssemblyFit, type ShopSystem } from "@/components/home/shop-by-system"

// Fitting order on the car: brake disc + caliper, then the wheel over them, then the tyre onto the wheel.
// Fits come from the renders: the disc spans ~70% of the rim, the rim fills the tyre's 79% bead opening.
const ASSEMBLY: (AssemblyFit & { slug: Category; image: string })[] = [
  { slug: "brakes", image: "/images/systems/brakes.webp", fit: 0.7, hubX: 0.186 },
  { slug: "wheels", image: "/images/systems/wheel.webp", fit: 0.81, spins: true },
  { slug: "tires", image: "/images/systems/tyre.webp", fit: 1, spins: true },
]

export async function CategoryTiles({ store }: { store: Store }) {
  const t = getDictionary(store)
  const catalog = await readProducts(store.market)
  const parts = ASSEMBLY.flatMap(({ slug, ...render }) => {
    const c = CATEGORIES.find((category) => category.slug === slug)
    return c ? [{ c, render }] : []
  })
  const systems: ShopSystem[] = parts.map(({ c, render }) => {
    const count = catalog.ok
      ? new Set(
          catalog.data
            .filter((p) => p.category === c.slug)
            .map((p) => (p.category === "tires" ? tireModelKey(p) : p.id)),
        ).size
      : null
    const copy = t.categories[c.slug]
    return {
      id: c.slug,
      name: copy.name,
      blurb: copy.blurb,
      href: storePath(store, `/${c.slug}`),
      badge: count !== null ? fmt(t.home.listed, { n: count }) : undefined,
      ...render,
    }
  })

  return (
    <div className="pt-12 sm:pt-20">
      <ShopBySystem title={t.home.systems} systems={systems} scrollHint={t.home.systemsScroll} offsetSelector="header.sticky"
        bottomOffsetSelector="[data-mobile-bottom-bar]"
      />
    </div>
  )
}
