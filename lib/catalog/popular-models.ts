import type { Market } from "@/lib/markets"

export type PopularModel = { brand: string; model: string }

/*
 * Hand-picked from 2026 market research (Tire Rack / ADAC / auto-bild tests,
 * best-seller rankings, enthusiast wheel guides), limited to models we stock.
 * Order matters: the home carousel alternates tires and wheels in this order.
 */
export const POPULAR_MODELS: Record<Market, { tires: PopularModel[]; wheels: PopularModel[] }> = {
  us: {
    tires: [
      { brand: "Michelin", model: "Pilot Sport 4S" },
      { brand: "Michelin", model: "CrossClimate 2" },
      { brand: "BFGoodrich", model: "Trail Terrain T/A" },
      { brand: "Goodyear", model: "Eagle F1 Asymmetric 6" },
      { brand: "Michelin", model: "Primacy Tour A/S" },
      { brand: "Falken", model: "Wildpeak A/T3Wa" },
      { brand: "Continental", model: "CrossContact LX Sport" },
      { brand: "Goodyear", model: "Wrangler DuraTrac RT" },
      { brand: "Michelin", model: "Pilot Sport All Season 4" },
      { brand: "Pirelli", model: "P Zero" },
    ],
    wheels: [
      { brand: "Enkei", model: "RPF1" },
      { brand: "Konig", model: "Hypergram" },
      { brand: "Method", model: "701 Bead Grip" },
      { brand: "Enkei", model: "PF01" },
      { brand: "Konig", model: "Dekagram" },
      { brand: "Method", model: "315 Street" },
      { brand: "Forgestar", model: "F14" },
      { brand: "BBS", model: "CH-R" },
      { brand: "American Racing", model: "VN215 Classic Torq Thrust II 1PC" },
      { brand: "Rotiform", model: "KPR" },
    ],
  },
  eu: {
    tires: [
      { brand: "Michelin", model: "Pilot Sport 5" },
      { brand: "Continental", model: "PremiumContact 6" },
      { brand: "Michelin", model: "CrossClimate 2" },
      { brand: "Goodyear", model: "Eagle F1 Asymmetric 6" },
      { brand: "Pirelli", model: "Cinturato P7" },
      { brand: "Bridgestone", model: "Turanza T005A" },
      { brand: "Continental", model: "SportContact 7" },
      { brand: "Michelin", model: "Pilot Sport 4S" },
      { brand: "Hankook", model: "Ventus S1 Evo3" },
      { brand: "Continental", model: "EcoContact 6Q" },
    ],
    wheels: [
      { brand: "BBS", model: "CH-R" },
      { brand: "OZ Racing", model: "Ultraleggera" },
      { brand: "Dezent", model: "TR" },
      { brand: "Borbet", model: "Y" },
      { brand: "OZ Racing", model: "Leggera HLT" },
      { brand: "Ronal", model: "R41" },
      { brand: "AEZ", model: "Atlanta" },
      { brand: "Borbet", model: "CW3" },
      { brand: "BBS", model: "SR" },
      { brand: "Enkei", model: "RPF1" },
    ],
  },
}
