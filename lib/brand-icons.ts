// Brand, payment, and logistics logo helper powered by theSVG.org (via jsDelivr CDN),
// Simple Icons, official Wikimedia Commons vector SVGs, and verified manufacturer logos
// stored locally under /public/images/brands/.
// Individual brand marks remain trademarks of their respective owners.

const THESVG_CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons"
const SIMPLE_ICONS_CDN = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons"

export function theSvgUrl(slug: string, variant: "default" | "mono" | "light" | "dark" = "default"): string {
  return `${THESVG_CDN}/${slug}/${variant}.svg`
}

// ================= VEHICLE MAKES (46 makes) =================
const THESVG_MONO_MAKES: Record<string, string> = {
  Acura: "acura",
  Audi: "audi",
  BMW: "bmw",
  Cadillac: "cadillac",
  Chevrolet: "chevrolet",
  Chrysler: "chrysler",
  Citroen: "citroen",
  Dacia: "dacia",
  Fiat: "fiat",
  Ford: "ford",
  Honda: "honda",
  Hyundai: "hyundai",
  Infiniti: "infiniti",
  Jeep: "jeep",
  Kia: "kia",
  Lucid: "lucid",
  Mazda: "mazda",
  Mini: "mini",
  Mitsubishi: "mitsubishi",
  Nissan: "nissan",
  Opel: "opel",
  Peugeot: "peugeot",
  Polestar: "polestar",
  Porsche: "porsche",
  Ram: "ram",
  Renault: "renault",
  Seat: "seat",
  Skoda: "skoda",
  Subaru: "subaru",
  Suzuki: "suzuki",
  Tesla: "tesla",
  Toyota: "toyota",
  Volkswagen: "volkswagen",
  Volvo: "volvo",
}

const OFFICIAL_EXTRA_MAKES: Record<string, string> = {
  "Mercedes-Benz": theSvgUrl("mercedes-benz", "default"),
  Lexus: theSvgUrl("lexus", "default"),
  Jaguar: theSvgUrl("jaguar", "default"),
  Lincoln: theSvgUrl("lincoln-motor-company", "default"),
  Rivian: theSvgUrl("rivian", "default"),
  "Land Rover": `${SIMPLE_ICONS_CDN}/landrover.svg`,
  "Alfa Romeo": `${SIMPLE_ICONS_CDN}/alfaromeo.svg`,
  Cupra: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Cupra_symbol.svg",
  Genesis: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Genesis_Motor_Logo.svg",
  Buick: "https://upload.wikimedia.org/wikipedia/commons/8/85/Buick-logo.svg",
  Dodge: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Dodge_Logo_2010.svg",
  GMC: "https://upload.wikimedia.org/wikipedia/commons/f/f9/GMC-Logo_2.svg",
}

// ================= PRODUCT BRANDS (63 Tire, Wheel & Brake Manufacturers) =================
const PRODUCT_BRAND_LOGOS: Record<string, string> = {
  // -------- TIRES (All 14 from official Wikimedia Commons vector SVGs) --------
  Michelin: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Michelin_Wordmark.svg",
  Pirelli: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Pirelli_-_logo_full_%28Italy%2C_1997%29.svg",
  Bridgestone: "https://upload.wikimedia.org/wikipedia/commons/5/54/Bridgestone_logo_full_color.svg",
  Continental: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Continental_logo.svg",
  Goodyear: "https://upload.wikimedia.org/wikipedia/en/c/cc/Goodyear_Logo_2025.svg",
  Dunlop: "https://upload.wikimedia.org/wikipedia/commons/8/86/LogoDunlopTire.svg",
  Hankook: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Hankook_Logo_2024.svg",
  Yokohama: "https://upload.wikimedia.org/wikipedia/commons/5/57/Yokohama_%28Unternehmen%29_logo.svg",
  Nokian: "https://upload.wikimedia.org/wikipedia/commons/1/11/Nokian-Renkaat-Logo.svg",
  Falken: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Falken_Tire_logo.svg",
  Kumho: "https://upload.wikimedia.org/wikipedia/commons/6/67/Kumho_Tire_logo_%282023%29.svg",
  Nexen: "https://upload.wikimedia.org/wikipedia/en/a/af/Nexen_Tire_logo.svg",
  BFGoodrich: "https://upload.wikimedia.org/wikipedia/commons/9/90/BFGoodrich_logo.svg",
  Firestone: "https://upload.wikimedia.org/wikipedia/commons/4/41/Firestone.svg",

  // -------- BRAKES (8 brands) --------
  Bosch: "https://upload.wikimedia.org/wikipedia/commons/1/16/Bosch-logo.svg",
  Brembo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Brembo_logo_%282022%29.svg",
  EBC: "/images/brands/ebc.svg",
  Ferodo: "/images/brands/ferodo.png",
  Wilwood: "/images/brands/wilwood.png",
  PowerStop: "/images/brands/powerstop.svg",
  "Baer Brakes": "/images/brands/baer.png",
  "TBM Brakes": "/images/brands/tbm.png",

  // -------- WHEELS (46 brands) --------
  BBS: "https://upload.wikimedia.org/wikipedia/commons/8/8f/BBS_logo.svg",
  Borbet: "https://upload.wikimedia.org/wikipedia/commons/0/07/Borbet_%28Unternehmen%29_logo.svg",
  Enkei: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Enkei_company_logo.svg",
  Sparco: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Sparco_logo_with_subtitle.svg",
  Alutec: "https://upload.wikimedia.org/wikipedia/commons/8/80/Alutec_logo.svg",
  "Fox Racing": "https://upload.wikimedia.org/wikipedia/commons/8/85/Fox_Factory_Logo.svg",

  "OZ Racing": "/images/brands/oz-racing.png",
  "MSW (by OZ)": "/images/brands/msw.jpg",
  "HRE Forged": "/images/brands/hre.png",
  Rotiform: "/images/brands/rotiform.png",
  Fifteen52: "/images/brands/fifteen52.jpg",
  "American Racing": "/images/brands/american-racing.svg",
  Ronal: "/images/brands/ronal.svg",
  Konig: "/images/brands/konig.png",
  Method: "/images/brands/method.png",
  Weld: "/images/brands/weld.svg",
  TSW: "/images/brands/tsw.png",
  "TSW Alloy": "/images/brands/tsw.png",
  "3SDM": "/images/brands/3sdm.png",
  AEZ: "/images/brands/aez.png",
  ATS: "/images/brands/ats.svg",
  Asanti: "/images/brands/asanti.png",
  Autec: "/images/brands/autec.svg",
  Beyern: "/images/brands/beyern.png",
  "Black Rhino": "/images/brands/black-rhino.png",
  Calibre: "/images/brands/calibre.jpg",
  Dezent: "/images/brands/dezent.svg",
  Dotz: "/images/brands/dotz.svg",
  Dub: "/images/brands/dub.png",
  Fondmetal: "/images/brands/fondmetal.svg",
  Forgestar: "/images/brands/forgestar.png",
  Helo: "/images/brands/helo.png",
  MAK: "/images/brands/mak.png",
  Mandrus: "/images/brands/mandrus.png",
  Motegi: "/images/brands/motegi.png",
  "Moto Metal": "/images/brands/moto-metal.png",
  Niche: "/images/brands/niche.png",
  "Pro Comp": "/images/brands/pro-comp.png",
  Ultra: "/images/brands/ultra.png",
  "Victor Equipment": "/images/brands/victor-equipment.png",
  XXR: "/images/brands/xxr.png",
  Accuride: "/images/brands/accuride.svg",
  "Alcoa Wheels": "/images/brands/alcoa-wheels.svg",
  Jantsa: "/images/brands/jantsa.svg",
  "Maxion Wheels": "/images/brands/maxion-wheels.svg",
  "Speedline Truck": "/images/brands/speedline-truck.svg",
}

export function getVehicleMakeIconUrl(make?: string | null): string | null {
  if (!make) return null
  const monoSlug = THESVG_MONO_MAKES[make]
  if (monoSlug) return theSvgUrl(monoSlug, "mono")
  return OFFICIAL_EXTRA_MAKES[make] ?? null
}

export function getProductBrandIconUrl(brand?: string | null): string | null {
  if (!brand) return null
  const trimmed = brand.trim()
  if (PRODUCT_BRAND_LOGOS[trimmed]) return PRODUCT_BRAND_LOGOS[trimmed]

  const lower = trimmed.toLowerCase()
  for (const [k, uri] of Object.entries(PRODUCT_BRAND_LOGOS)) {
    if (k.toLowerCase() === lower) return uri
  }

  return null
}

export function getBrandIconUrl(brandOrMake?: string | null): string | null {
  if (!brandOrMake) return null
  return getProductBrandIconUrl(brandOrMake)
}

export const FEATURED_VEHICLE_BRANDS = [
  { make: "BMW", modelsHint: "3 Series · 5 Series · X3 · X5 · M3" },
  { make: "Porsche", modelsHint: "911 · Taycan · Cayenne · Macan" },
  { make: "Mercedes-Benz", modelsHint: "C-Class · E-Class · GLC · GLE" },
  { make: "Audi", modelsHint: "A3 · A4 · A6 · Q5 · e-tron" },
  { make: "Volkswagen", modelsHint: "Golf · Passat · Tiguan · ID.4" },
  { make: "Tesla", modelsHint: "Model 3 · Model Y · Model S" },
  { make: "Toyota", modelsHint: "Camry · RAV4 · Corolla · Tacoma" },
  { make: "Ford", modelsHint: "Mustang · F-150 · Explorer · Focus" },
  { make: "Volvo", modelsHint: "XC60 · XC90 · V60 · EX30" },
  { make: "Honda", modelsHint: "Civic · Accord · CR-V" },
  { make: "Hyundai", modelsHint: "IONIQ 5 · Tucson · Santa Fe" },
  { make: "Subaru", modelsHint: "Outback · Forester · WRX" },
] as const
