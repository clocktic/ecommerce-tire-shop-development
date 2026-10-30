import type { Category, Offer, Product } from "@/lib/catalog/types"
import { findVehicleById } from "@/lib/catalog/vehicles"
import type { Market } from "@/lib/markets"
import { localeMeta, type Store } from "@/lib/i18n/config"

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

// Swaps in the store language's copy; missing fields fall back to English.
export function localizeProduct<P extends Product>(product: P, store: Store): P {
  const copy = product.translations?.[localeMeta(store).content]
  if (!copy) return product
  return {
    ...product,
    name: copy.name ?? product.name,
    shortDescription: copy.shortDescription ?? product.shortDescription,
    description: copy.description ?? product.description,
    highlights: copy.highlights ?? product.highlights,
    specs: copy.specs ?? product.specs,
  }
}

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

export type CatalogFilters = Record<string, string | undefined>

export const PRICE_BANDS = [
  { id: "200", min: 0, max: 20000 },
  { id: "400", min: 20000, max: 40000 },
  { id: "800", min: 40000, max: 80000 },
  { id: "800+", min: 80000, max: Number.POSITIVE_INFINITY },
] as const

export const SPEED_RATINGS = ["Q", "R", "S", "T", "H", "V", "W", "Y"] as const
export const PISTON_OPTIONS = ["1", "2", "4", "6", "8"] as const
export const DISC_OPTIONS = ["280", "300", "312", "320", "330", "345", "355", "380", "405"] as const
export const FINISH_FAMILIES = ["black", "silver", "gunmetal", "bronze", "gold", "chrome", "grey", "white", "other"] as const
export const OFFSET_BANDS = ["low", "mid", "std", "high", "deep"] as const

export function finishFamily(finish: string): (typeof FINISH_FAMILIES)[number] {
  const value = finish.toLowerCase()
  if (/(bronze|copper)/.test(value)) return "bronze"
  if (value.includes("gold")) return "gold"
  if (value.includes("chrome")) return "chrome"
  if (value.includes("white")) return "white"
  if (/(gunmetal|anthracite|graphite)/.test(value)) return "gunmetal"
  if (/(grey|gray)/.test(value)) return "grey"
  if (value.includes("silver") || value.includes("hyper")) return "silver"
  if (value.includes("black")) return "black"
  return "other"
}

export function offsetBand(offset: number): (typeof OFFSET_BANDS)[number] {
  if (offset <= 0) return "low"
  if (offset <= 20) return "mid"
  if (offset <= 35) return "std"
  if (offset <= 45) return "high"
  return "deep"
}

export function filterProducts(products: Product[], filters: CatalogFilters, market?: Market): Product[] {
  const vehicle = findVehicleById(filters.vehicle)

  return products.filter((p) => {
    if (filters.brand && p.brand !== filters.brand) return false
    if (market && filters.stock && p.offers[market]?.availability !== filters.stock) return false
    if (market && filters.price) {
      const cents = p.offers[market]?.priceCents
      const band = PRICE_BANDS.find((item) => item.id === filters.price)
      if (cents == null || !band || cents < band.min || cents >= band.max) return false
    }
    if (p.category === "tires") {
      const t = p.tire
      if (filters.width && String(t.width) !== filters.width) return false
      if (filters.aspect && String(t.aspect) !== filters.aspect) return false
      if (filters.rim && String(t.rim) !== filters.rim) return false
      if (vehicle && !filters.width && !filters.aspect && !filters.rim) {
        const matchesVehicleSize = vehicle.sizes.some(
          (s) => s.width === t.width && s.aspect === t.aspect && s.rim === t.rim,
        )
        if (!matchesVehicleSize) return false
      }
      if (filters.season && t.season !== filters.season) return false
      if (filters.speed && t.speedRating !== filters.speed) return false
      if (filters.load && String(t.loadIndex) !== filters.load) return false
      if (filters.runFlat === "yes" && !t.runFlat) return false
      if (filters.runFlat === "no" && t.runFlat) return false
      if (filters.extraLoad === "yes" && !t.extraLoad) return false
      if (filters.extraLoad === "no" && t.extraLoad) return false
    }
    if (p.category === "wheels") {
      const w = p.wheel
      if (filters.diameter && String(w.diameter) !== filters.diameter) return false
      if (filters.width && String(w.width) !== filters.width) return false
      if (filters.bolt && w.boltPattern !== filters.bolt) return false
      if (vehicle) {
        if (!filters.bolt && w.boltPattern !== vehicle.boltPattern) return false
        if (!filters.diameter) {
          const rims = vehicle.sizes.map((s) => s.rim)
          const minRim = Math.min(...rims)
          const maxRim = Math.max(...rims) + 1
          if (w.diameter < minRim || w.diameter > maxRim) return false
        }
        if (!filters.bore && w.centerBore > 0 && vehicle.centerBore > 0 && w.centerBore + 0.5 < vehicle.centerBore) {
          return false
        }
      }
      if (filters.offset && offsetBand(w.offset) !== filters.offset) return false
      if (filters.bore && String(w.centerBore) !== filters.bore) return false
      if (filters.finish && finishFamily(w.finish) !== filters.finish) return false
      if (filters.construction && w.construction !== filters.construction) return false
    }
    if (p.category === "brakes") {
      const b = p.brake
      if (filters.kind && b.kind !== filters.kind) return false
      if (filters.axle && b.axle !== filters.axle) return false
      if (filters.pistons && String(b.pistons ?? "") !== filters.pistons) return false
      if (filters.disc && String(b.discDiameterMm ?? "") !== filters.disc) return false
      if (vehicle && b.fitment.length > 0) {
        const needleMake = vehicle.make.toLowerCase()
        const needleModel = vehicle.model.split("/")[0]!.trim().toLowerCase()
        const matchesFitment = b.fitment.some((entry) => {
          const text = entry.toLowerCase()
          return text.includes(needleMake) || (needleModel.length >= 2 && text.includes(needleModel))
        })
        if (!matchesFitment) return false
      }
    }
    return true
  })
}

export const TIRE_OPTIONS = {
  width: [175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315],
  aspect: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  rim: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
}

export const SEASON_LABEL = { summer: "Summer", winter: "Winter", "all-season": "All-season" } as const
export const BRAKE_KIND_LABEL = {
  discs: "Brake discs",
  pads: "Brake pads",
  "pads-and-discs": "Pads + discs kit",
  caliper: "Brake caliper",
  kit: "Big brake kit",
  drum: "Brake drum",
  shoes: "Brake shoes",
  hose: "Brake hose",
  sensor: "Wear sensor",
} as const
