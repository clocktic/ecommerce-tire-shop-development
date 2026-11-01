import type { Product } from "@/lib/catalog/types"
import type { Store } from "@/lib/i18n/config"

export type ResolvedWarranty = {
  specLabel: string
  specValue: string
  accordionTitle: string
  detailParagraph: string
  policyLinkLabel: string
}

const TIRE_MILES_BY_BRAND: Record<string, { years: number; programUs: string; programEu: string }> = {
  Michelin: {
    years: 6,
    programUs: "Michelin Promise Plan (3-Year Flat Tire Roadside Assistance)",
    programEu: "Michelin Europe Commercial Quality Guarantee",
  },
  Bridgestone: {
    years: 5,
    programUs: "Bridgestone US Limited Warranty & 90-Day Buy & Try",
    programEu: "Bridgestone Europe Commercial Manufacturer Guarantee",
  },
  Firestone: {
    years: 5,
    programUs: "Firestone US Limited Pact & 90-Day Buy & Try",
    programEu: "Firestone Europe Commercial Manufacturer Guarantee",
  },
  Continental: {
    years: 6,
    programUs: "Continental Total Confidence Plan (Roadside & 60-Day Trial)",
    programEu: "Continental Europe Commercial Manufacturer Warranty",
  },
  Pirelli: {
    years: 5,
    programUs: "Pirelli Confidence Plus North America Limited Warranty",
    programEu: "Pirelli Tyres Europe Commercial Guarantee",
  },
  Goodyear: {
    years: 6,
    programUs: "Goodyear Highway Auto & Light Truck US Limited Warranty",
    programEu: "Goodyear Europe Commercial Manufacturer Warranty",
  },
  Dunlop: {
    years: 6,
    programUs: "Dunlop North America Limited Workmanship & Materials Warranty",
    programEu: "Dunlop Europe Commercial Manufacturer Warranty",
  },
  Hankook: {
    years: 6,
    programUs: "Hankook US Limited Warranty & 30-Day Free Trial",
    programEu: "Hankook Tire Europe Commercial Manufacturer Guarantee",
  },
  Falken: {
    years: 5,
    programUs: "Falken US Limited Warranty & 2-Year Road Hazard Protection",
    programEu: "Falken Tyre Europe GmbH Commercial Warranty",
  },
  Yokohama: {
    years: 5,
    programUs: "Yokohama US Limited Warranty & 30-Day Performance Promise",
    programEu: "Yokohama Europe Commercial Manufacturer Warranty",
  },
  Kumho: {
    years: 6,
    programUs: "Kumho Tire USA Limited Warranty & Road Hazard Coverage",
    programEu: "Kumho Tire Europe Commercial Manufacturer Warranty",
  },
  Nexen: {
    years: 6,
    programUs: "Nexen Total Coverage US Warranty (36-Mo Roadside & 1-Yr Road Hazard)",
    programEu: "Nexen Tire Europe Commercial Guarantee",
  },
  Nokian: {
    years: 5,
    programUs: "Nokian Tyres North America Limited Warranty & Pothole Protection",
    programEu: "Nokian Tyres Europe Commercial Guarantee",
  },
  BFGoodrich: {
    years: 6,
    programUs: "BFGoodrich US Standard Limited Warranty",
    programEu: "BFGoodrich Europe Commercial Manufacturer Guarantee",
  },
}

const BRAKE_WARRANTY_BY_BRAND: Record<string, { us: string; eu: string }> = {
  Brembo: {
    us: "2-Year / 24,000-Mile Brembo North America Limited Warranty on materials & workmanship",
    eu: "2-Year EU Statutory Guarantee (Directive 2019/771) + 24-Month Brembo S.p.A. Commercial Warranty (ECE R90 / TÜV)",
  },
  "Baer Brakes": {
    us: "1-Year Baer Brakes USA Limited Manufacturer Warranty on calipers, 2-piece rotors & hardware",
    eu: "2-Year EU Statutory Guarantee of Conformity (Directive 2019/771) + 12-Month Baer Commercial Structural Guarantee",
  },
  Wilwood: {
    us: "1-Year Wilwood Engineering USA Limited Warranty against defects in materials & CNC workmanship",
    eu: "2-Year EU Statutory Guarantee of Conformity (Directive 2019/771) + 12-Month Wilwood Commercial Guarantee",
  },
  "TBM Brakes": {
    us: "1-Year TBM Brakes USA Limited Warranty on zero-drag billet calipers, rotors & mounting brackets",
    eu: "2-Year EU Statutory Guarantee of Conformity (Directive 2019/771) + 12-Month TBM Commercial Structural Guarantee",
  },
  EBC: {
    us: "12-Month / 10,000-Mile EBC Brakes USA Limited Warranty against manufacturing & rotor runout defects",
    eu: "2-Year EU Statutory Guarantee (Directive 2019/771) + 24-Month / 30,000 km EBC Brakes UK European Warranty (ECE R90)",
  },
  Ferodo: {
    us: "2-Year / 24,000-Mile Ferodo North America Limited Warranty on friction bonding & backing plate integrity",
    eu: "2-Year EU Statutory Guarantee (Directive 2019/771) + 24-Month Ferodo Europe Commercial Warranty (ECE R90)",
  },
  Bosch: {
    us: "2-Year / 24,000-Mile Bosch North America Limited Warranty on QuietCast & High-Carbon brake components",
    eu: "2-Year EU Statutory Guarantee (Directive 2019/771) + 24-Month Robert Bosch GmbH European Warranty (ECE R90)",
  },
  PowerStop: {
    us: "3-Year / 36,000-Mile PowerStop USA Worry-Free Limited Warranty + 90-Day / 3,000-Mile Performance Promise",
    eu: "2-Year EU Statutory Guarantee of Conformity (Directive 2019/771) + 36-Month / 60,000 km PowerStop Commercial Warranty",
  },
}

function inferTireMileage(product: Product): number | null {
  if (product.category !== "tires") return null
  for (const s of product.specs) {
    const m = s.value.match(/(\d{2}),000[\s-]*mile/i)
    if (m) return Number(m[1]) * 1000
  }
  const descMatch = product.description.match(/(\d{2}),000[\s-]*mile/i)
  if (descMatch) return Number(descMatch[1]) * 1000
  const tw = product.tire.utqg?.treadwear
  if (!tw || product.tire.season === "winter") return null
  if (tw >= 700) return 70000
  if (tw >= 600) return 65000
  if (tw >= 500) return 55000
  if (tw >= 400) return 50000
  if (tw >= 300) return 40000
  return null
}

export function buildMarketWarrantyPair(product: Product): { us: string; eu: string } {
  if (product.category === "brakes") {
    return (
      BRAKE_WARRANTY_BY_BRAND[product.brand] ?? {
        us: `2-Year / 24,000-Mile ${product.brand} US Limited Manufacturer Warranty`,
        eu: `2-Year EU Statutory Guarantee (Directive 2019/771) + 24-Month ${product.brand} European Commercial Warranty`,
      }
    )
  }

  if (product.category === "wheels") {
    return {
      us: `Lifetime Limited Structural Warranty + 2-Year / 24,000-Mile Finish & Clearcoat Warranty (${product.brand} US)`,
      eu: `2-Year EU Statutory Guarantee (Directive 2019/771) + 5-Year Structural & 24-Month Finish ${product.brand} European Guarantee`,
    }
  }

  const meta = TIRE_MILES_BY_BRAND[product.brand] ?? {
    years: 5,
    programUs: `${product.brand} North America Limited Warranty`,
    programEu: `${product.brand} Europe Commercial Manufacturer Warranty`,
  }
  const miles = inferTireMileage(product)
  if (miles) {
    const km = Math.round((miles * 1.60934) / 5000) * 5000
    return {
      us: `${meta.years}-Year Workmanship & Materials + ${miles.toLocaleString("en-US")}-Mile Treadwear Limited Warranty · ${meta.programUs}`,
      eu: `2-Year EU Statutory Guarantee (Directive 2019/771) + ${meta.years}-Year / ${km.toLocaleString("en-US")} km ${meta.programEu}`,
    }
  }
  return {
    us: `${meta.years}-Year Workmanship & Materials Limited Warranty · ${meta.programUs}`,
    eu: `2-Year EU Statutory Guarantee of Conformity (Directive 2019/771) + ${meta.years}-Year ${meta.programEu}`,
  }
}

export function getProductWarranty(product: Product, store: Store): ResolvedWarranty {
  const pair = {
    ...buildMarketWarrantyPair(product),
    ...(product.warranty ?? {}),
  }

  if (store.market === "us") {
    if (store.lang === "es") {
      return {
        specLabel: "Garantía del fabricante (EE. UU.)",
        specValue: pair.us,
        accordionTitle: "Garantía (EE. UU.)",
        detailParagraph: `${pair.us}. Cubre defectos de materiales y fabricación conforme a la ley federal Magnuson-Moss de EE. UU. Tramitamos la reclamación directamente con ${product.brand} sin cargo por gestión.`,
        policyLinkLabel: "Política completa de garantía (EE. UU.)",
      }
    }
    return {
      specLabel: "Manufacturer warranty (US)",
      specValue: pair.us,
      accordionTitle: "Warranty (US)",
      detailParagraph: `${pair.us}. Backed by US federal Magnuson-Moss Warranty Act protections against defects in materials and workmanship. We file and coordinate manufacturer warranty claims directly on your behalf.`,
      policyLinkLabel: "Full US warranty policy",
    }
  }

  // EU market — localized by store language
  switch (store.lang) {
    case "de":
      return {
        specLabel: "Gewährleistung & Garantie (EU)",
        specValue: pair.eu,
        accordionTitle: "Gewährleistung & Garantie (EU)",
        detailParagraph: `Gesetzliche EU-Gewährleistung von 2 Jahren ab Lieferung gemäß Richtlinie (EU) 2019/771 (kostenlose Nachbesserung, Ersatzlieferung oder Erstattung bei Mängeln) zuzüglich der europäischen Herstellergarantie von ${product.brand}: ${pair.eu}.`,
        policyLinkLabel: "Vollständige EU-Garantiebedingungen",
      }
    case "fr":
      return {
        specLabel: "Garantie légale & fabricant (UE)",
        specValue: pair.eu,
        accordionTitle: "Garantie (UE)",
        detailParagraph: `Garantie légale de conformité de l’UE de 2 ans à compter de la livraison conformément à la directive (UE) 2019/771, complétée par la garantie commerciale européenne ${product.brand} : ${pair.eu}.`,
        policyLinkLabel: "Conditions complètes de garantie UE",
      }
    case "es":
      return {
        specLabel: "Garantía legal y del fabricante (UE)",
        specValue: pair.eu,
        accordionTitle: "Garantía (UE)",
        detailParagraph: `Garantía legal de conformidad de la UE de 2 años desde la entrega según la Directiva (UE) 2019/771 (reparación, sustitución o reembolso sin cargo), además de la garantía comercial europea de ${product.brand}: ${pair.eu}.`,
        policyLinkLabel: "Política completa de garantía UE",
      }
    case "it":
      return {
        specLabel: "Garanzia legale e del produttore (UE)",
        specValue: pair.eu,
        accordionTitle: "Garanzia (UE)",
        detailParagraph: `Garanzia legale di conformità UE di 2 anni dalla consegna ai sensi della Direttiva (UE) 2019/771 (riparazione, sostituzione o rimborso gratuiti), oltre alla garanzia commerciale europea ${product.brand}: ${pair.eu}.`,
        policyLinkLabel: "Condizioni complete di garanzia UE",
      }
    case "nl":
      return {
        specLabel: "Wettelijke & fabrieksgarantie (EU)",
        specValue: pair.eu,
        accordionTitle: "Garantie (EU)",
        detailParagraph: `Wettelijke EU-conformiteitsgarantie van 2 jaar na levering volgens Richtlijn (EU) 2019/771, aangevuld met de Europese commerciële fabrieksgarantie van ${product.brand}: ${pair.eu}.`,
        policyLinkLabel: "Volledige EU-garantievoorwaarden",
      }
    default:
      return {
        specLabel: "Warranty & legal guarantee (EU)",
        specValue: pair.eu,
        accordionTitle: "Warranty & EU legal guarantee",
        detailParagraph: `${pair.eu}. Protected by the mandatory 2-year EU statutory legal guarantee of conformity under Directive (EU) 2019/771 from the date of delivery (free repair, replacement, or refund), in addition to ${product.brand}'s European commercial manufacturer warranty.`,
        policyLinkLabel: "Full EU warranty & guarantee policy",
      }
  }
}
