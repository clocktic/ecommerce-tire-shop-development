import { CATEGORIES, type Category } from "@/lib/catalog"
import { readProducts } from "@/lib/catalog/queries"
import { tireModelKey } from "@/lib/catalog/tire-variants"
import { fmt, getDictionary, storePath, type Store } from "@/lib/i18n"
import { ShopBySystem, type ShopSystem, type SystemMotion } from "@/components/home/shop-by-system"

const RENDERS: Record<Category, { image: string; motion: SystemMotion }> = {
  tires: { image: "/images/systems/tyre.webp", motion: "roll" },
  wheels: { image: "/images/systems/wheel.webp", motion: "roll" },
  brakes: { image: "/images/systems/brakes.webp", motion: "mount" },
}

export async function CategoryTiles({ store }: { store: Store }) {
  const t = getDictionary(store)
  const catalog = await readProducts(store.market)
  const systems: ShopSystem[] = CATEGORIES.map((c) => {
    const count = catalog.ok
      ? new Set(
          catalog.data
            .filter((p) => p.category === c.slug)
            .map((p) => (p.category === "tires" ? tireModelKey(p) : p.id)),
        ).size
      : null
    const copy = t.categories[c.slug]
    const render = RENDERS[c.slug] ?? { image: c.image, motion: "mount" }
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
