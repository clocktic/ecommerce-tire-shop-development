import { PRODUCTS } from "@/lib/catalog/data"
import type { Category, Offer, Product } from "@/lib/catalog/types"
import type { Market } from "@/lib/markets"

export * from "@/lib/catalog/types"

export const CATEGORIES: { slug: Category; name: string; singular: string; blurb: string; image: string }[] = [
  {
    slug: "tires",
    name: "Tires",
    singular: "Tire",
    blurb: "Summer, winter and all-season. Search by the size on your sidewall.",
    image: "/images/products/tire-touring.png",
  },
  {
    slug: "wheels",
    name: "Wheels",
    singular: "Wheel",
    blurb: "Cast, flow-formed and forged alloys by diameter and bolt pattern.",
    image: "/images/products/wheel-silver.png",
  },
  {
    slug: "brakes",
    name: "Brakes",
    singular: "Brake",
    blurb: "Pads, discs and big brake kits with approval markings listed.",
    image: "/images/products/brake-kit.png",
  },
]

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((c) => c.slug === value)
}

export function getCategory(slug: Category) {
  return CATEGORIES.find((c) => c.slug === slug)!
}

// Effective offer for a market: a sale with a past end date reverts to the regular price.
export function offerFor(product: Product, market: Market, now = new Date()): Offer | undefined {
  const offer = product.offers[market]
  if (!offer) return undefined
  if (offer.compareAtCents && offer.saleEndsAt && new Date(offer.saleEndsAt) < now) {
    return { priceCents: offer.compareAtCents, availability: offer.availability }
  }
  return offer
}

export function getProducts(market: Market): Product[] {
  return PRODUCTS.filter((p) => p.offers[market])
}

export function getProductsByCategory(market: Market, category: Category): Product[] {
  return getProducts(market).filter((p) => p.category === category)
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getAllProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug)
}

export type CatalogFilters = Record<string, string | undefined>

export function filterProducts(products: Product[], filters: CatalogFilters): Product[] {
  return products.filter((p) => {
    if (p.category === "tires") {
      const t = p.tire
      if (filters.width && String(t.width) !== filters.width) return false
      if (filters.aspect && String(t.aspect) !== filters.aspect) return false
      if (filters.rim && String(t.rim) !== filters.rim) return false
      if (filters.season && t.season !== filters.season) return false
    }
    if (p.category === "wheels") {
      const w = p.wheel
      if (filters.diameter && String(w.diameter) !== filters.diameter) return false
      if (filters.bolt && w.boltPattern !== filters.bolt) return false
    }
    if (p.category === "brakes") {
      const b = p.brake
      if (filters.kind && b.kind !== filters.kind) return false
      if (filters.axle && b.axle !== filters.axle) return false
    }
    return true
  })
}

export const TIRE_OPTIONS = {
  width: [175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285],
  aspect: [30, 35, 40, 45, 50, 55, 60, 65, 70],
  rim: [14, 15, 16, 17, 18, 19, 20, 21, 22],
}

export const SEASON_LABEL = { summer: "Summer", winter: "Winter", "all-season": "All-season" } as const
export const BRAKE_KIND_LABEL = { pads: "Pads", discs: "Discs", kit: "Big brake kit", "pads-and-discs": "Pads + discs" } as const
