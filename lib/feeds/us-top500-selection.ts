import type { Category, Product } from "@/lib/catalog"
import { US_GMC_STARTER_SLUGS } from "@/lib/feeds/us-starter-selection"

/*
 * US Top-500 Google Merchant Center selection.
 *
 * Popularity signals, strongest first:
 * 1. Real demand on this store: US order quantity and published Stamped reviews.
 * 2. US bestseller model lines (Tire Rack / Discount Tire best-seller rankings, Consumer
 *    Reports and Car and Driver test winners, 2026), scored per model below.
 * 3. USTMA / Modern Tire Dealer top replacement sizes (passenger + light truck / SUV).
 * 4. Season: winter tires get a lift while US winter-tire demand peaks (Oct–Feb).
 * Then brand / model-line caps keep the feed diverse instead of 40 sizes of one tire.
 */

export const US_TOP500_TARGETS: Record<Category, number> = { tires: 330, wheels: 100, brakes: 70 }
export const US_TOP500_TOTAL = 500
export const US_TOP600_TARGETS: Record<Category, number> = { tires: 396, wheels: 120, brakes: 84 }
export const US_TOP600_TOTAL = 600

export function targetsForTopTotal(total: number): Record<Category, number> {
  if (total === 500) return US_TOP500_TARGETS
  if (total === 600) return US_TOP600_TARGETS
  const wheels = Math.round(total * 0.2)
  const brakes = Math.round(total * 0.14)
  return { tires: Math.max(0, total - wheels - brakes), wheels, brakes }
}

// Optional slugs always prioritized in the feed when active and in stock.
export const US_TOP500_PINNED: readonly string[] = []

// 40 commercial truck & trailer tires (20) and wheels (20) added after Batches 1–3 were uploaded.
// Excluded from simulated Batches 2–3 and guaranteed in Batch 4 (`batch4-600`) so all 40 go live in GMC.
export const US_BATCH4_COMMERCIAL_SLUGS: readonly string[] = [
  "bridgestone-duravis-r-steer-002-315-80r22-5",
  "bridgestone-m748-evo-385-65r22-5",
  "bridgestone-r284-ecopia-295-75r22-5",
  "continental-chs5-385-65r22-5",
  "continental-cht5-385-65r22-5",
  "continental-eco-plus-hd3-315-70r22-5",
  "continental-hsl3-295-75r22-5",
  "continental-ht3-hybrid-plus-385-65r22-5",
  "goodyear-endurance-lhs-295-75r22-5",
  "goodyear-fuelmax-t-385-65r22-5",
  "goodyear-g296-msa-425-65r22-5",
  "goodyear-kmax-s-gen2-315-80r22-5",
  "goodyear-kmax-t-gen2-385-65r22-5",
  "goodyear-kmax-t-gen3-385-65r22-5",
  "hankook-smart-work-tm11-385-65r22-5",
  "michelin-x-line-energy-z-plus-295-75r22-5",
  "michelin-x-multi-z-315-80r22-5",
  "michelin-x-multiway-hd-xze-385-65r22-5",
  "michelin-x-works-hl-z-385-65r22-5",
  "michelin-xzy-3-425-65r22-5",
  "accuride-accu-lite-22-5x8-25-42644-aluminum",
  "accuride-extra-heavy-22-5x9-00-41730-aluminum",
  "accuride-steel-armor-22-5x12-25-29807-white",
  "accuride-steel-armor-22-5x8-25-50408-white",
  "accuride-steel-armor-22-5x8-25-51487-white",
  "accuride-steel-armor-22-5x9-00-29300-white",
  "accuride-steel-armor-24-5x8-25-50409-white",
  "accuride-ultra-light-22-5x8-25-43644-aluminum",
  "alcoa-eu-22-5x11-75-81u523db-et120-dura-bright",
  "alcoa-eu-22-5x9-00-89u513db-dura-bright",
  "alcoa-ultra-one-22-5x11-75-81u517-lvl-one",
  "alcoa-ultra-one-22-5x8-25-883671-mirror",
  "alcoa-ultra-one-22-5x8-25-883671db-dura-bright",
  "alcoa-ultra-one-22-5x8-25-883671dd-dura-flange",
  "alcoa-ultra-one-22-5x9-00-89u517-lvl-one",
  "alcoa-ultra-one-24-5x8-25-88u637-high-polish",
  "jantsa-steel-22-5x11-75-2920801-et0",
  "jantsa-steel-22-5x11-75-2920996-et120",
  "maxion-lemmerz-22-5x9-00-2921010-et175",
  "speedline-truck-slt-22-5x11-75-999024150-et120",
]

const BATCH4_COMMERCIAL_SET = new Set<string>(US_BATCH4_COMMERCIAL_SLUGS)

const TIRE_MODEL_SCORE: Record<string, Record<string, number>> = {
  Michelin: {
    "CrossClimate 2": 100, "Pilot Sport 4S": 96, "Pilot Sport All Season 4": 95, "Primacy Tour A/S": 92,
    "X-Ice Snow": 92, "X-Ice Snow SUV": 92, "Primacy A/S": 86, "Pilot Sport 4 SUV": 84, "Latitude Tour HP": 80,
    "Pilot Sport EV": 80, "Pilot Sport 4": 74, "Pilot Sport A/S 3": 72, "Pilot Sport 5": 72, "Latitude Sport 3": 70,
    "Pilot Sport Cup 2": 70, "Pilot Super Sport": 66, "X Line Version T": 90,
  },
  BFGoodrich: { "Trail Terrain T/A": 95 },
  Falken: {
    "Wildpeak A/T3Wa": 96, "Wildpeak A/T Trail": 88, "Aklimate": 84, "Azenis FK460 A/S": 82, "Sincera SN250 A/S": 82,
    "Ziex CT60 A/S": 78, "Ziex ZE960 A/S": 76, "Wildpeak H/T 01": 76, "Azenis FK510": 72, "Azenis FK510 SUV": 70,
  },
  Goodyear: {
    "Wrangler DuraTrac RT": 93, "Eagle Sport All-Season": 88, "Assurance Finesse": 86, "WinterCommand": 84,
    "Eagle F1 Asymmetric 6": 84, "Wrangler Territory HT": 80, "Wrangler DuraTrac": 80, "Eagle Touring": 76,
    "Eagle RS-A": 72, "Eagle LS2": 70, "Eagle F1 Asymmetric 5": 68,
  },
  Firestone: {
    "Destination LE3": 90, "WeatherGrip": 88, "Destination A/T2": 86, "Firehawk AS V2": 84, "Winterforce 2": 84,
    "Winterforce 2 UV": 84, "Firehawk Indy 500": 80, "Destination LE2": 70, "FT140": 68, "Firehawk Pursuit": 66,
  },
  Bridgestone: {
    "Blizzak 6": 92, "Dueler H/T 685": 82, "Ecopia H/L 422 Plus": 80, "Potenza Sport": 76, "Blizzak LM005": 74,
    "Turanza EL450": 70, "Potenza Sport EVO": 70, "Dueler H/L 400": 68,
  },
  Continental: {
    "CrossContact LX Sport": 88, "VikingContact 8": 86, "VikingContact 7": 82, "ProContact RX": 80, "SportContact 7": 76,
    "ProContact GX": 72, "SportContact 6": 70, "4X4 Contact": 62,
  },
  Hankook: {
    "Dynapro AT2 Xtreme": 88, "Kinergy PT": 86, "Ventus S1 AS": 80, "Dynapro AT2": 78, "Kinergy XP": 78,
    "Kinergy ST": 76, "Dynapro HPX": 76, "iON evo AS SUV": 74, "Kinergy GT": 72, "Kinergy 4S2": 72,
    "Winter i*cept evo3": 72, "Dynapro HT2": 70, "Ventus V2 Concept2": 70,
  },
  Nokian: {
    "Remedy WRG5": 86, "Hakkapeliitta R5": 86, "Hakkapeliitta R5 SUV": 86, "One": 80, "Outpost APT": 80,
    "Hakkapeliitta R5 EV": 80, "Outpost nAT": 76, "One HT": 74, "Hakkapeliitta 01": 70, "Surpass AS01": 70,
    "Hakkapeliitta 10": 66,
  },
  Pirelli: {
    "Scorpion Zero All Season": 84, "Scorpion All Terrain Plus": 82, "P Zero": 80, "P Zero (PZ4) Sport": 78,
    "Cinturato P7 All Season": 78, "Scorpion Verde All Season": 78, "Scorpion Winter 2": 78, "Scorpion Winter": 70,
    "Winter Sottozero 3": 68, "Scorpion MS": 66, "P Zero Winter": 62,
  },
  Yokohama: {
    "Geolandar A/T G015": 84, "Geolandar CV 4S": 78, "Geolandar X-CV G057": 74, "Geolandar H/T G056": 74,
    "Geolandar CV G058": 74, "Advan Neova AD09": 72, "Geolandar H/T4 G062": 70, "Parada Spec-X": 64,
  },
  Kumho: {
    "Crugen HT51": 80, "Road Venture AT52": 80, "Crugen HP71": 78, "Solus 4S HA32": 78, "Solus TA31": 76,
    "Ecsta Sport PS72": 72,
  },
  Nexen: {
    "N5000 Platinum": 76, "Roadian ATX": 76, "Roadian GTX": 74, "Roadian HTX2": 72, "Aria AH7": 70,
    "Winguard Winspike 3": 62, "Winguard ice 3": 60,
  },
  Dunlop: { "Sport Maxx RT2": 66, "Grandtrek AT23": 64, "Winter Maxx SJ8": 62 },
}

// USTMA top replacement passenger sizes (2025 facts issue) plus the dominant LT/SUV/truck sizes.
const TIRE_SIZE_SCORE: Record<string, number> = {
  "225/65R17": 60, "205/55R16": 56, "215/55R17": 54, "195/65R15": 52, "235/60R18": 52, "215/60R16": 50,
  "275/55R20": 50, "235/45R18": 48, "225/60R17": 48, "245/60R18": 48, "275/60R20": 50, "265/70R17": 50,
  "235/65R18": 46, "265/65R18": 44, "275/65R18": 42, "245/75R16": 42, "285/70R17": 42, "265/70R16": 40,
  "245/65R17": 40, "235/65R17": 40, "225/60R18": 40, "235/55R18": 38, "255/55R18": 36, "235/55R19": 38,
  "225/55R17": 36, "225/45R17": 36, "245/45R18": 34, "215/65R16": 34, "205/65R16": 32, "255/45R20": 30,
  "245/40R18": 28, "245/45R19": 28, "275/40R19": 26, "255/40R19": 26, "245/50R20": 26, "265/60R18": 34,
}

const WHEEL_BRAND_SCORE: Record<string, number> = {
  Method: 96, Enkei: 92, Konig: 90, "American Racing": 90, "Black Rhino": 88, BBS: 86, Weld: 86, Rotiform: 85,
  "Moto Metal": 84, Forgestar: 84, Fifteen52: 82, Niche: 82, Helo: 80, "Fox Racing": 80, Motegi: 80,
  "Pro Comp": 78, "TSW Alloy": 78, XXR: 78, TSW: 76, "HRE Forged": 75, "OZ Racing": 74, "3SDM": 72, Ultra: 72,
  Sparco: 70, "MSW (by OZ)": 70, Asanti: 70, "Victor Equipment": 70, Calibre: 70, Dub: 68, Beyern: 64,
  Fondmetal: 60, Mandrus: 60, MAK: 58,
}

const WHEEL_BOLT_SCORE: Record<string, number> = {
  "6x139.7": 40, "5x114.3": 40, "6x135": 30, "5x120": 26, "5x127": 24, "8x170": 24, "8x180": 22, "5x112": 20,
  "8x165.1": 20, "5x139.7": 18, "6x120": 16, "5x110": 12, "5x100": 12,
}

const BRAKE_BRAND_SCORE: Record<string, number> = {
  PowerStop: 96, Brembo: 95, Wilwood: 92, "Baer Brakes": 88, Bosch: 86, EBC: 85, "TBM Brakes": 70, Ferodo: 55,
}

const BRAKE_KIND_SCORE: Record<string, number> = {
  "pads-and-discs": 25, kit: 20, pads: 15, discs: 15, caliper: 0, drum: -10, shoes: -10, hose: -15, sensor: -15,
}

export type DemandSignals = {
  orderedQty: ReadonlyMap<string, number>
  reviewCount: ReadonlyMap<string, number>
}

export type ScoredProduct = { product: Product; score: number; group: string; tier: "pinned" | "bestseller" | "popular" | "core" }

const WINTER_MONTHS = new Set([9, 10, 11, 0, 1])

function demandBoost(slug: string, signals: DemandSignals) {
  const ordered = Math.min(signals.orderedQty.get(slug) ?? 0, 20) * 6
  const reviewed = Math.min(signals.reviewCount.get(slug) ?? 0, 5) * 3
  return ordered + reviewed
}

function tireScore(p: Extract<Product, { category: "tires" }>, now: Date) {
  const model = p.tire.model ?? ""
  let score = TIRE_MODEL_SCORE[p.brand]?.[model] ?? 50
  score += TIRE_SIZE_SCORE[`${p.tire.width}/${p.tire.aspect}R${p.tire.rim}`] ?? (p.tire.rim >= 16 && p.tire.rim <= 20 ? 10 : 0)
  if (p.tire.season === "winter") score += WINTER_MONTHS.has(now.getMonth()) ? 10 : -10
  if (p.tire.utqg) score += 6
  if (p.gtin) score += 8
  return score
}

function wheelScore(p: Extract<Product, { category: "wheels" }>) {
  let score = WHEEL_BRAND_SCORE[p.brand] ?? 45
  score += WHEEL_BOLT_SCORE[p.wheel.boltPattern.replace(/\s+/g, "").toLowerCase()] ?? 0
  if (p.wheel.diameter >= 17 && p.wheel.diameter <= 20) score += 25
  else if (p.wheel.diameter > 20) score += 12
  if (p.wheel.approvals.us) score += 6
  return score
}

function brakeScore(p: Extract<Product, { category: "brakes" }>) {
  let score = BRAKE_BRAND_SCORE[p.brand] ?? 60
  score += BRAKE_KIND_SCORE[p.brake.kind] ?? 0
  if (p.brake.axle === "front") score += 5
  if (p.brake.fitment.length) score += Math.min(p.brake.fitment.length, 10)
  return score
}

function slugPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

// Model line (tires), wheel style or brake kind: the unit the per-group cap applies to.
export function productGroup(p: Product): string {
  if (p.category === "tires") return `${slugPart(p.brand)}:${slugPart(p.tire.model || p.name.replace(/\s+\d{3}\/.*$/, ""))}`
  if (p.category === "wheels") {
    return `${slugPart(p.brand)}:${slugPart(p.name.replace(/\s+\d{1,2}(?:\.\d)?x\d{1,2}(?:\.\d)?\b.*$/i, ""))}`
  }
  return `${slugPart(p.brand)}:${p.brake.kind}`
}

const CAPS: Record<Category, { perBrand: number; perGroup: number }> = {
  tires: { perBrand: 30, perGroup: 8 },
  wheels: { perBrand: 12, perGroup: 3 },
  brakes: { perBrand: 18, perGroup: 10 },
}

// Per-brand tire caps that follow US replacement-market share instead of one flat limit.
const TIRE_BRAND_CAP: Record<string, number> = {
  Michelin: 46, Goodyear: 38, Firestone: 32, Bridgestone: 30, BFGoodrich: 20, Falken: 30, Continental: 30,
  Hankook: 26, Pirelli: 24, Nokian: 22, Yokohama: 20, Kumho: 14, Nexen: 12, Dunlop: 8,
}

function brandCap(p: Product) {
  return p.category === "tires" ? (TIRE_BRAND_CAP[p.brand] ?? CAPS.tires.perBrand) : CAPS[p.category].perBrand
}

export function scoreProduct(p: Product, signals: DemandSignals, now = new Date()): number {
  const base = p.category === "tires" ? tireScore(p, now) : p.category === "wheels" ? wheelScore(p) : brakeScore(p)
  return base + demandBoost(p.slug, signals)
}

function selectBatchFromPool(
  pool: Product[],
  signals: DemandSignals,
  now: Date,
  total: number,
  options: { includeStarter?: boolean; includePinned?: boolean; prioritySlugs?: ReadonlySet<string> } = {},
): ScoredProduct[] {
  const targetTotal = Math.min(Math.max(1, Math.trunc(total)), pool.length)
  const pinned = new Set<string>(options.includePinned !== false ? US_TOP500_PINNED : [])
  if (options.prioritySlugs) {
    for (const slug of options.prioritySlugs) pinned.add(slug)
  }
  const starter = new Set(options.includeStarter ? US_GMC_STARTER_SLUGS : [])
  const isCommercialTruckTire = (p: Product) => p.category === "tires" && !Number.isInteger(p.tire.rim)
  const isCommercialTruckWheel = (p: Product) =>
    p.category === "wheels" && (!Number.isInteger(p.wheel.diameter) || /^10x/i.test(p.wheel.boltPattern))
  const isCommercialTruck = (p: Product) => isCommercialTruckTire(p) || isCommercialTruckWheel(p)
  const scored = pool
    .map((product) => ({ product, score: scoreProduct(product, signals, now), group: productGroup(product) }))
    .sort(
      (a, b) =>
        Number(pinned.has(b.product.slug)) - Number(pinned.has(a.product.slug)) ||
        Number(isCommercialTruck(b.product)) - Number(isCommercialTruck(a.product)) ||
        b.score - a.score ||
        a.product.slug.localeCompare(b.product.slug),
    )

  const chosen = new Map<string, ScoredProduct>()
  const brandCount = new Map<string, number>()
  const groupCount = new Map<string, number>()
  const categoryCount: Record<Category, number> = { tires: 0, wheels: 0, brakes: 0 }

  const take = (entry: (typeof scored)[number]) => {
    const { product } = entry
    chosen.set(product.slug, { ...entry, tier: "core" })
    categoryCount[product.category] += 1
    const brandKey = `${product.category}:${product.brand}`
    brandCount.set(brandKey, (brandCount.get(brandKey) ?? 0) + 1)
    groupCount.set(entry.group, (groupCount.get(entry.group) ?? 0) + 1)
  }

  for (const entry of scored) {
    if (chosen.size >= targetTotal) break
    if (
      pinned.has(entry.product.slug) ||
      isCommercialTruck(entry.product) ||
      starter.has(entry.product.slug) ||
      (signals.orderedQty.get(entry.product.slug) ?? 0) > 0
    ) {
      take(entry)
    }
  }

  const fill = (targets: Record<Category, number>, limit: number, multiplier: number) => {
    for (const entry of scored) {
      if (chosen.size >= limit) return
      const { product } = entry
      if (chosen.has(product.slug) || categoryCount[product.category] >= targets[product.category]) continue
      if (Number.isFinite(multiplier)) {
        if ((brandCount.get(`${product.category}:${product.brand}`) ?? 0) >= Math.ceil(brandCap(product) * multiplier)) continue
        if ((groupCount.get(entry.group) ?? 0) >= Math.ceil(CAPS[product.category].perGroup * multiplier)) continue
      }
      take(entry)
    }
  }

  const scale = Math.max(1, targetTotal / 500)
  const targets = targetsForTopTotal(targetTotal)
  fill(targets, targetTotal, 1 * scale)
  fill(targets, targetTotal, 2 * scale)
  fill(targets, targetTotal, Infinity)
  fill({ tires: Infinity, wheels: Infinity, brakes: Infinity }, targetTotal, 2 * scale)
  fill({ tires: Infinity, wheels: Infinity, brakes: Infinity }, targetTotal, Infinity)

  const order: Record<Category, number> = { tires: 0, wheels: 1, brakes: 2 }
  const sorted = [...chosen.values()].sort(
    (a, b) =>
      order[a.product.category] - order[b.product.category] ||
      Number(pinned.has(b.product.slug)) - Number(pinned.has(a.product.slug)) ||
      Number(isCommercialTruck(b.product)) - Number(isCommercialTruck(a.product)) ||
      b.score - a.score ||
      a.product.slug.localeCompare(b.product.slug),
  )

  const rank: Record<Category, number> = { tires: 0, wheels: 0, brakes: 0 }
  return sorted.map((entry) => {
    const { slug, category } = entry.product
    const position = rank[category]++ / Math.max(categoryCount[category], 1)
    const ordered = (signals.orderedQty.get(slug) ?? 0) > 0
    const tier: ScoredProduct["tier"] =
      pinned.has(slug) || isCommercialTruck(entry.product)
        ? "pinned"
        : ordered || position < 0.25
          ? "bestseller"
          : position < 0.65
            ? "popular"
            : "core"
    return { ...entry, tier }
  })
}

/**
 * Selects US GMC feed batches:
 * - Batch 2 (`total = 500`, `batch = 2`): 500-product feed (`top500`).
 * - Batch 3 (`total = 600`, `batch = 3`, i.e. `top600`): 600 brand-new products with 0% overlap
 *   against both the initial 100 starter products (`US_GMC_STARTER_SLUGS`) and Batch 2 (`top500`).
 * - Batch 4 (`batch = 4`, i.e. `batch4-600`): 600 brand-new products with 0% overlap against
 *   Batches 1–3, guaranteed to include all 40 new commercial truck & trailer tires and wheels.
 * - Subsequent daily batches (`batch = 5, 6...`): each batch strictly excludes all products
 *   from every earlier batch so every daily upload adds 100% new SKUs to GMC.
 */
export function selectUsTop500(
  eligible: Product[],
  signals: DemandSignals,
  now = new Date(),
  total = US_TOP500_TOTAL,
  batch?: number,
): ScoredProduct[] {
  const effectiveBatch = batch ?? (total === 500 ? 2 : 3)
  // Batches 2 & 3 were uploaded before the 40 new commercial truck tires & wheels were added,
  // so keep those 40 slugs out of Batches 2–3 and deliver all 40 in Batch 4 (`batch4-600`).
  const preBatch4Eligible = eligible.filter((p) => !BATCH4_COMMERCIAL_SET.has(p.slug))

  if (effectiveBatch <= 2) {
    const source = total === 500 ? preBatch4Eligible : eligible
    const base = selectBatchFromPool(source, signals, now, total, { includeStarter: false, includePinned: true })
    if (total !== 500) return base
    const chosenSlugs = new Set(base.map((item) => item.product.slug))
    const starterSet = new Set<string>(US_GMC_STARTER_SLUGS)
    const extraStarter = source
      .filter((p) => starterSet.has(p.slug) && !chosenSlugs.has(p.slug))
      .map((product) => ({
        product,
        score: scoreProduct(product, signals, now),
        group: productGroup(product),
        tier: "core" as const,
      }))
    return [...base, ...extraStarter]
  }

  const excluded = new Set<string>(US_GMC_STARTER_SLUGS)
  for (const item of selectBatchFromPool(preBatch4Eligible, signals, now, 500, { includeStarter: false, includePinned: true })) {
    excluded.add(item.product.slug)
  }
  for (const item of selectBatchFromPool(preBatch4Eligible, signals, now, 500, { includeStarter: true, includePinned: true })) {
    excluded.add(item.product.slug)
  }

  for (let b = 3; b < effectiveBatch; b++) {
    const source = b === 3 ? preBatch4Eligible : eligible
    const prevPool = source.filter((p) => !excluded.has(p.slug))
    const prioritySlugs = b === 4 ? BATCH4_COMMERCIAL_SET : undefined
    for (const item of selectBatchFromPool(prevPool, signals, now, 600, { includeStarter: false, includePinned: false, prioritySlugs })) {
      excluded.add(item.product.slug)
    }
  }

  const finalSource = effectiveBatch === 3 ? preBatch4Eligible : eligible
  const pool = finalSource.filter((p) => !excluded.has(p.slug))
  const prioritySlugs = effectiveBatch === 4 ? BATCH4_COMMERCIAL_SET : undefined
  return selectBatchFromPool(pool, signals, now, total, { includeStarter: false, includePinned: false, prioritySlugs })
}
