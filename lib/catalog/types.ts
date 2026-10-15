import type { Market } from "@/lib/markets"
import type { ContentLang } from "@/lib/i18n/config"

export type Category = "tires" | "wheels" | "brakes"
export type Availability = "in_stock" | "out_of_stock" | "preorder"
export type LabelClass = "A" | "B" | "C" | "D" | "E"

export type Offer = {
  priceCents: number
  // Only set while a real, dated sale is running. Never a permanent strike-through.
  compareAtCents?: number
  saleEndsAt?: string
  availability: Availability
  // Required by Google for preorder items (availability_date). Without it the item stays out of the feed.
  availableFrom?: string
}

export type Spec = { label: string; value: string }

type ProductBase = {
  id: string
  slug: string
  name: string
  brand: string
  // Real codes only. No code → leave empty; the feed then sends identifier_exists=no.
  gtin?: string
  mpn?: string
  // Demo records: shown with a badge, noindex, never in a feed.
  sample?: boolean
  images: string[]
  shortDescription: string
  description: string
  highlights: string[]
  specs: Spec[]
  // A product is sold only in the markets it has an offer for.
  offers: Partial<Record<Market, Offer>>
  // Copy per content language; English fields above are the fallback.
  translations?: Partial<Record<ContentLang, ProductCopy>>
}

export type ProductCopy = {
  name?: string
  shortDescription?: string
  description?: string
  highlights?: string[]
  specs?: Spec[]
}

// EU Regulation 2020/740 — must be shown next to the price for EU consumers.
export type EuTyreLabel = {
  fuelEfficiency: LabelClass
  wetGrip: LabelClass
  noiseDb: number
  noiseClass: "A" | "B" | "C"
  snowGrip: boolean
  iceGrip: boolean
  eprelId?: string
}

// US Uniform Tire Quality Grading (49 CFR 575.104).
export type Utqg = {
  treadwear: number
  traction: "AA" | "A" | "B" | "C"
  temperature: "A" | "B" | "C"
}

export type TireProduct = ProductBase & {
  category: "tires"
  tire: {
    width: number
    aspect: number
    rim: number
    loadIndex: number
    speedRating: string
    season: "summer" | "winter" | "all-season"
    extraLoad: boolean
    runFlat: boolean
    euLabel?: EuTyreLabel
    utqg?: Utqg
  }
}

export type WheelProduct = ProductBase & {
  category: "wheels"
  wheel: {
    diameter: number
    width: number
    boltPattern: string
    offset: number
    centerBore: number
    finish: string
    construction: string
    loadRatingKg: number
    // EU: ECE R124 / national approval (e.g. German ABE). US: SAE J2530.
    approvals: Partial<Record<Market, string>>
  }
}

export type BrakeProduct = ProductBase & {
  category: "brakes"
  brake: {
    kind: "pads" | "discs" | "kit" | "pads-and-discs"
    axle: "front" | "rear"
    fitment: string[]
    discDiameterMm?: number
    pistons?: number
    // EU: ECE R90 for replacement pads/discs. US: FMVSS 135 / AMECA where applicable.
    approvals: Partial<Record<Market, string>>
  }
}

export type Product = TireProduct | WheelProduct | BrakeProduct

export function tireSize(t: TireProduct["tire"]): string {
  return `${t.width}/${t.aspect} R${t.rim}`
}

export function tireServiceDescription(t: TireProduct["tire"]): string {
  return `${t.loadIndex}${t.speedRating}${t.extraLoad ? " XL" : ""}`
}
