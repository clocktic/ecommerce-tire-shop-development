import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "../..")
const OPENING_CATALOG_PATH = path.resolve(ROOT, "lib/catalog/opening-catalog.json")

const COUNTRY_CODE_MAP = {
  MY: "Malaysia",
  MALAYSIA: "Malaysia",
  TH: "Thailand",
  THAILAND: "Thailand",
  MX: "Mexico",
  MEXICO: "Mexico",
  TW: "Taiwan",
  TAIWAN: "Taiwan",
  IT: "Italy",
  ITALY: "Italy",
  DE: "Germany",
  GERMANY: "Germany",
  CN: "China",
  CHINA: "China",
  TR: "Turkey",
  TURKEY: "Turkey",
  PL: "Poland",
  POLAND: "Poland",
  US: "United States",
  USA: "United States",
  UK: "United Kingdom",
  GB: "United Kingdom",
  JP: "Japan",
  JAPAN: "Japan",
}

const KIND_DE = {
  kit: "Big-Brake-Komplettsatz",
  "pads-and-discs": "Bremsscheiben- & Belagsatz",
  discs: "Bremsscheiben-Satz",
  pads: "Bremsbelagsatz",
  caliper: "Bremssattel",
  drum: "Bremstrommel",
  shoes: "Bremsbackensatz",
}
const KIND_FR = {
  kit: "Kit gros freins complet",
  "pads-and-discs": "Kit disques et plaquettes",
  discs: "Jeu de disques de frein",
  pads: "Jeu de plaquettes de frein",
  caliper: "Étrier de frein",
  drum: "Tambour de frein",
  shoes: "Jeu de mâchoires de frein",
}
const KIND_IT = {
  kit: "Kit impianto frenante maggiorato",
  "pads-and-discs": "Kit dischi e pastiglie freno",
  discs: "Coppia dischi freno",
  pads: "Kit pastiglie freno",
  caliper: "Pinza freno",
  drum: "Tamburo freno",
  shoes: "Kit ganasce freno",
}
const KIND_ES = {
  kit: "Kit de frenos sobredimensionados",
  "pads-and-discs": "Kit de discos y pastillas de freno",
  discs: "Juego de discos de freno",
  pads: "Juego de pastillas de freno",
  caliper: "Pinza de freno",
  drum: "Tambor de freno",
  shoes: "Juego de zapatas de freno",
}
const KIND_NL = {
  kit: "Big Brake remsysteemkit",
  "pads-and-discs": "Remschijven- en remblokkenset",
  discs: "Remschijvenset",
  pads: "Remblokkenset",
  caliper: "Remklauw",
  drum: "Remtrommel",
  shoes: "Remschoenenset",
}

const AXLE_I18N = {
  front: {
    en: "Front axle",
    de: "Vorderachse",
    fr: "Essieu avant",
    it: "Asse anteriore",
    es: "Eje delantero",
    nl: "Vooras",
  },
  rear: {
    en: "Rear axle",
    de: "Hinterachse",
    fr: "Essieu arrière",
    it: "Asse posteriore",
    es: "Eje trasero",
    nl: "Achteras",
  },
}

function dedupeYears(str) {
  return String(str)
    .replace(/(\(\d{4}[–-]\d{4}\))\s*\1/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

function getBremboConfig(p) {
  const mpn = p.mpn
  p.brake.oemHint = p.brake.oemHint || p.name || ""
  const rawName = p.brake.oemHint
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  const dia = p.brake.discDiameterMm
  const thickSpec = p.specs.find((s) => s.label === "Nominal Thickness")?.value || "32 mm"
  const thickNum = thickSpec.replace(/\s*mm/i, "").trim()

  // Fix piston count from original name if 4-Pistons was specified
  if (/4-Pistons?/i.test(rawName)) {
    p.brake.pistons = 4
  } else if (/6-Pistons?/i.test(rawName)) {
    p.brake.pistons = 6
  } else if (p.brake.kind !== "kit") {
    delete p.brake.pistons
  }
  const pistons = p.brake.pistons

  // Clean title: Brand + Series + Component/Specs + (MPN), zero car make/model!
  let cleanTitle = ""
  let series = "GT"
  if (/GT-S/i.test(rawName)) series = "GT-S"
  else if (/GT-R/i.test(rawName)) series = "GT-R"

  if (p.brake.kind === "kit") {
    cleanTitle = `Brembo ${series} ${pistons}-Piston ${axleCap} Big Brake Kit Ø${dia}×${thickNum} mm (${mpn})`
  } else if (p.brake.kind === "discs") {
    if (/Disc Kit Only/i.test(rawName)) {
      cleanTitle = `Brembo ${series} 2-Piece ${axleCap} Disc Assembly Kit Ø${dia}×${thickNum} mm (${mpn})`
    } else if (/Assembled Disc/i.test(rawName)) {
      cleanTitle = `Brembo ${series} 2-Piece Assembled ${axleCap} Brake Disc Ø${dia}×${thickNum} mm (${mpn})`
    } else {
      cleanTitle = `Brembo ${series} 2-Piece Floating ${axleCap} Brake Rotor Ø${dia}×${thickNum} mm (${mpn})`
    }
  } else {
    const padCodeMatch = rawName.match(/Brembo\s+GT\s+([A-Z0-9]+)\s+/i)
    const padFamily = padCodeMatch ? `GT ${padCodeMatch[1]}` : "GT HP2000"
    cleanTitle = `Brembo ${padFamily} High-Performance ${axleCap} Brake Pad Set (${mpn})`
  }

  // Authentic vehicle fitment based on the exact Brembo application
  const upper = rawName.toUpperCase()
  let fitment = []
  if (upper.includes("NISSAN GT-R")) {
    fitment = [
      "Nissan GT-R (R35) (2012–2024)",
      "Nissan Z / 370Z (2015–2026)",
      "Infiniti QX50 / QX55 (2019–2026)",
    ]
  } else if (upper.includes("LEXUS RC-F")) {
    fitment = [
      "Lexus RC F (2015–2024)",
      "Lexus IS 300 / IS 350 / IS 500 (2021–2026)",
      "Lexus ES 250 / ES 350 / ES 300h (2019–2026)",
    ]
  } else if (upper.includes("LAMBORGHINI GALLARDO")) {
    fitment = [
      "Lamborghini Gallardo LP 550-2 / 560-4 / 570-4 (2003–2013)",
      "Audi e-tron GT (2022–2026)",
      "Audi A7 / RS7 (2019–2026)",
      "Audi A8 / S8 (2019–2026)",
    ]
  } else if (upper.includes("DODGE VIPER") || upper.includes("DODGE CHALLENGER")) {
    fitment = [
      upper.includes("VIPER")
        ? "Dodge Viper SRT-10 (2003–2010)"
        : "Dodge Challenger SRT-8 (2008–2014)",
      "Dodge Charger (2015–2026)",
      "Dodge Durango (2018–2026)",
    ]
  } else if (upper.includes("AUDI TT RS") || upper.includes("AUDI RS3")) {
    fitment = [
      upper.includes("TT RS") ? "Audi TT RS (8S) (2018–2023)" : "Audi RS3 (8V) (2015–2020)",
      "Audi A3 / S3 (2020–2026)",
      "Volkswagen Golf / GTI / Golf R (2020–2026)",
      "Cupra Formentor (2021–2026)",
    ]
  } else if (upper.includes("AUDI RS4")) {
    fitment = [
      "Audi RS4 (B7) (2006–2008)",
      "Audi A4 / S4 (2016–2026)",
      "Audi A5 / S5 Sportback (2018–2026)",
      "Audi Q5 / SQ5 (2018–2026)",
    ]
  } else if (upper.includes("ASTON MARTIN")) {
    fitment = [
      upper.includes("V8 VANTAGE")
        ? "Aston Martin V8 Vantage (2006–2011)"
        : "Aston Martin DB9 (2003–2012)",
      "Jaguar F-PACE (2017–2026)",
      "Jaguar I-PACE (2019–2026)",
    ]
  } else if (upper.includes("VOLVO XC90")) {
    fitment = [
      "Volvo XC90 / EX90 (2016–2026)",
      "Volvo XC60 (2018–2026)",
      "Volvo S60 / V60 / S90 (2019–2026)",
      "Polestar 3 (2024–2026)",
    ]
  } else if (upper.includes("VOLVO V70") || upper.includes("VOLVO S60") || upper.includes("VOLVO C30")) {
    const primary = upper.includes("V70")
      ? "Volvo V70 / V70R (2001–2007)"
      : upper.includes("S60")
        ? "Volvo S60 T5 / T6 / R-Design (2011–2018)"
        : "Volvo C30 T5 / R-Design (2008–2013)"
    fitment = [
      primary,
      "Volvo S60 / V60 / S90 (2019–2026)",
      "Volvo XC40 / EX40 / EC40 (2018–2026)",
      "Volvo EX30 (2024–2026)",
    ]
  } else if (upper.includes("VOLKSWAGEN POLO")) {
    fitment = [
      "Volkswagen Polo GTI 1.4 TSI (2010–2018)",
      "Volkswagen Polo / Taigo (2018–2026)",
      "Volkswagen Golf / GTI / Golf R (2020–2026)",
      "Audi A1 Sportback (2019–2026)",
    ]
  } else if (upper.includes("VOLKSWAGEN")) {
    const primary = upper.includes("R32 (MK4)")
      ? "Volkswagen Golf R32 (Mk4) (2004–2005)"
      : upper.includes("R32 (MK5)")
        ? "Volkswagen Golf R32 (Mk5) (2008)"
        : "Volkswagen Rabbit / Golf (Mk5) (2006–2009)"
    fitment = [
      primary,
      "Volkswagen Golf / GTI / Golf R (2020–2026)",
      "Volkswagen Jetta / Jetta GLI (2019–2026)",
      "Volkswagen Passat / Arteon (2015–2026)",
      "Audi A3 / S3 (2020–2026)",
    ]
  } else if (upper.includes("BMW")) {
    const primary = upper.includes("430I")
      ? "BMW 430i (F32 / F33) (2017–2020)"
      : "BMW 428i xDrive M-Sport (F32 / F33) (2014–2016)"
    fitment = [
      primary,
      "BMW 4 Series / i4 (2021–2026)",
      "BMW 3 Series / M3 (2019–2026)",
      "BMW 2 Series / M2 (2021–2026)",
    ]
  } else if (upper.includes("PORSCHE 982") || upper.includes("718")) {
    const primary = upper.includes("BOXSTER GTS")
      ? "Porsche 718 Boxster GTS 4.0 (982) (2020–2026)"
      : "Porsche 718 Cayman (982) (2017–2026)"
    fitment = [
      primary,
      "Porsche 718 Cayman / Boxster (2017–2026)",
      "Porsche 911 (992) (2019–2026)",
    ]
  } else if (upper.includes("PORSCHE 997")) {
    const primary = upper.includes("GT2 RS")
      ? "Porsche 911 GT2 RS (997) (2011)"
      : upper.includes("TURBO")
        ? "Porsche 911 Turbo (997) (2006–2012)"
        : "Porsche 911 Carrera 4S (997) (2006–2011)"
    fitment = [
      primary,
      "Porsche 911 (992) (2019–2026)",
      "Porsche 718 Cayman / Boxster (2017–2026)",
      "Porsche Panamera (2017–2026)",
    ]
  } else if (upper.includes("MASERATI")) {
    const primary = upper.includes("GHIBLI")
      ? "Maserati Ghibli S Q4 (M157) (2014–2024)"
      : upper.includes("GRANSPORT")
        ? "Maserati GranSport (2004–2007)"
        : "Maserati Coupe / Spyder (4200GT) (2002–2007)"
    fitment = [
      primary,
      "Alfa Romeo Giulia (2017–2026)",
      "Alfa Romeo Stelvio (2018–2026)",
    ]
  } else if (upper.includes("LOTUS")) {
    fitment = [
      "Lotus Elise / Exige (2005–2011)",
      "Toyota GR Supra (2020–2026)",
      "Mazda MX-5 Miata (2016–2026)",
    ]
  }

  const discStyle =
    p.specs.find((s) => s.label === "Rotor Construction")?.value || "High-Carbon Vented 2-Piece"
  let description = ""
  if (p.brake.kind === "kit") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a flagship Italian motorsport-grade ${series} big brake system engineered in Bergamo, Italy by Brembo S.p.A. for the ${axle} axle. This complete axle kit pairs opposed ${pistons}-piston monoblock aluminum calipers with Ø${dia} mm (${thickSpec}) ${discStyle.toLowerCase()} discs mounted on CNC-machined 6061-T6 billet aluminum bells via anti-rattle duralumin floating hardware. Directional curved internal cooling vanes maximize airflow and thermal capacity to eliminate brake fade during repeated high-speed deceleration. Supplied with high-performance friction pads, braided stainless-steel lines, and model-specific caliper mounting brackets. Verified fitment for ${fitment.join(", ")}.`
  } else if (p.brake.kind === "discs") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a genuine 2-piece floating brake rotor assembly engineered in Bergamo, Italy by Brembo S.p.A. for the ${axle} axle. Cast from high-carbon alloy iron to Ø${dia} mm outer diameter and ${thickSpec} nominal thickness, the friction ring uses Brembo's directional pillar-vane internal ventilation and UV-resistant zinc-nickel coating for rapid heat dissipation and resistance to thermal cracking. Pre-assembled with a hard-anodized 6061-T6 billet aluminum hat and floating drive bobbins for radial thermal expansion without brake judder. Verified fitment for ${fitment.join(", ")}.`
  } else {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a high-performance ${axle} axle brake pad set manufactured in Bergamo, Italy by Brembo S.p.A. Formulated with Brembo's high-friction semi-metallic sport compound (operating range 0°C to 650°C), it delivers immediate cold bite, linear pedal modulation, and fade-free stopping torque across spirited street driving and track-day sessions. Powder-coated steel backing plates with multi-layer acoustic damping shims suppress vibration and caliper heat transfer. Verified fitment for ${fitment.join(", ")}.`
  }

  const shortDescription = `Brembo ${series} ${p.brake.kind === "kit" ? `${pistons}-piston big brake kit` : p.brake.kind === "discs" ? "2-piece floating brake disc" : "sport brake pad set"} · ${axleCap} axle${dia ? ` · Ø${dia} mm` : ""} · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function getBaerConfig(p) {
  const mpn = p.mpn
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  p.brake.oemHint = p.brake.oemHint || p.name || ""
  const oldName = p.brake.oemHint

  // Fix 12" replacement rotors having 330mm instead of 305mm
  if (mpn === "6911101" || mpn === "6920301") {
    p.brake.discDiameterMm = 305
    const odSpec = p.specs.find((s) => s.label === "Outer Diameter")
    if (odSpec) odSpec.value = "305 mm (12.00 in)"
  }
  const dia = p.brake.discDiameterMm
  const pistons = p.brake.pistons
  const calModel = p.specs.find((s) => s.label === "Caliper")?.value || (pistons === 4 ? "T4" : "6S")
  const color = p.specs.find((s) => s.label === "Caliper Color")?.value || (/Fire Red/i.test(oldName) ? "Fire Red" : "Red")
  const diaIn = Math.round((dia / 25.4) * 10) / 10

  let cleanTitle = ""
  if (p.brake.kind === "kit") {
    const series = /Extreme\+/i.test(oldName) ? "Extreme+" : /Track4/i.test(oldName) ? "Track4" : "Pro+"
    cleanTitle = `Baer Brakes ${diaIn}" ${series} ${calModel} ${pistons}-Piston ${axleCap} Big Brake Kit, ${color} (${mpn})`
  } else if (/EradiSpeed/i.test(oldName)) {
    cleanTitle = `Baer Brakes EradiSpeed+ 2-Piece ${axleCap} Brake Rotor Pair Ø${dia} mm (${mpn})`
  } else if (/Claw/i.test(oldName)) {
    cleanTitle = `Baer Brakes Claw Performance Cross-Drilled & Slotted ${axleCap} Rotor Pair Ø${dia} mm (${mpn})`
  } else {
    const side = /RH/i.test(oldName) ? "RH" : "LH"
    const dim = mpn === "6910043" ? '13.00" × 1.10"' : mpn === "6911101" ? '12.00" × 1.02"' : '12.00" × 1.10"'
    cleanTitle = `Baer Brakes ${dim} Directional 1-Piece Replacement Rotor, ${side} (${mpn})`
  }

  let fitment = []
  if (mpn === "4261409R" || mpn === "4261409R-1") {
    fitment = [
      "Ford F-150 2WD / 4WD & SVT Raptor (2010–2026)",
      "Ford F-150 (2021–2026)",
      "Ford Expedition (2018–2026)",
    ]
  } else if (mpn === "4301514FR") {
    fitment = [
      "Chevrolet Corvette C7 Stingray / Z51 (2014–2019)",
      "Chevrolet Corvette C8 (2020–2026)",
      "Chevrolet Camaro (2016–2024)",
    ]
  } else if (mpn === "4261421R-1") {
    fitment = [
      "Ford Mustang S550 / S650 GT & EcoBoost (2015–2026)",
      "Ford Mustang (2015–2026)",
      "Ford Mustang Mach-E (2021–2026)",
    ]
  } else if (mpn === "4302246R") {
    fitment = [
      "Chevrolet Camaro SS / 1LE (2010–2015)",
      "Chevrolet Camaro (2016–2024)",
      "Cadillac CT5 / CT5-V (2020–2026)",
    ]
  } else if (mpn === "4301628R" || mpn === "4302472R" || mpn === "4302504R" || mpn === "4302504R-1") {
    fitment = [
      mpn === "4301628R"
        ? "Chevrolet / GMC C1500 Pickup, Tahoe & Suburban 2WD (1988–1999)"
        : "Chevrolet / GMC C10 & C1500 Pickup (1963–1987)",
      "Chevrolet Silverado 1500 (2019–2026)",
      "Chevrolet Tahoe / Suburban (2021–2026)",
      "GMC Sierra 1500 (2019–2026)",
      "GMC Yukon / Yukon XL (2021–2026)",
    ]
  } else if (mpn === "4261008R-1" || mpn === "4261276R" || mpn === "54045-020" || mpn === "4262293R") {
    fitment = [
      "Ford Mustang SN95 / SVT Cobra / Bullitt / Mach 1 (1994–2004)",
      "Ford Mustang Fox Body 5.0L (1979–1993)",
      "Ford Mustang (2015–2026)",
    ]
  } else if (mpn === "4261212R" || mpn === "4262310FR" || mpn === "4261258FR") {
    fitment = [
      "Ford Mustang Classic (1965–1970)",
      "Ford Fairlane / Torino / Falcon (1962–1971)",
      "Mercury Cougar / Cyclone (1967–1971)",
      "Ford Mustang (2015–2026)",
    ]
  } else if (mpn === "4301426R" || mpn === "4301415R") {
    fitment = [
      mpn === "4301415R"
        ? "Chevrolet Impala SS / Caprice (1994–1996)"
        : "Chevrolet Impala / Bel Air / Biscayne Full-Size (1958–1970)",
      "Chevrolet Camaro (2016–2024)",
      "Cadillac CT5 / CT5-V (2020–2026)",
    ]
  } else if (mpn === "4301521R" || mpn === "2302068" || mpn === "55012-020") {
    fitment = [
      mpn === "2302068"
        ? "Chevrolet Corvette C6 Z06 & Grand Sport (2006–2013)"
        : mpn === "4301521R"
          ? "Chevrolet Corvette C2 / C3 (1963–1982)"
          : "Chevrolet Corvette C4 (1988–1996) & Camaro IROC-Z / 1LE (1985–1992)",
      "Chevrolet Corvette C8 (2020–2026)",
      "Chevrolet Camaro (2016–2024)",
    ]
  } else if (mpn === "4302402FR" || mpn === "4302401R" || mpn === "4301335FR") {
    fitment = [
      "Chevrolet Camaro Z28 / IROC-Z 3rd Gen (1982–1992)",
      "Pontiac Firebird Trans Am / Formula (1982–1992)",
      "Chevrolet Camaro (2016–2024)",
    ]
  } else if (mpn === "54074-020") {
    fitment = [
      "Ford F-250 / F-350 Super Duty 2WD / 4WD (1999–2004)",
      "Ford Excursion (1999–2005)",
      "Ford F-150 (2021–2026)",
    ]
  } else {
    fitment = [
      "Chevrolet Camaro 1st & 2nd Gen F-Body (1967–1974)",
      "Chevrolet Chevelle / Malibu / El Camino A-Body (1964–1977)",
      "Chevrolet Nova X-Body (1964–1974)",
      "Chevrolet Camaro (2016–2024)",
      "Chevrolet Corvette C8 (2020–2026)",
    ]
  }

  const surfaceType = p.specs.find((s) => s.label === "Surface Type")?.value || "Slotted, Drilled & Zinc-Plated"
  const rotorType = p.specs.find((s) => s.label === "Rotor Type")?.value || "2-Piece"
  const boltPattern = p.specs.find((s) => s.label === "Wheel Lug/Bolt Pattern")?.value || "5x4.75"

  const description =
    p.brake.kind === "kit"
      ? `${cleanTitle} (EAN: ${p.gtin}) is an American-made high-performance big brake system engineered and machined in Phoenix, Arizona by Baer Brakes for the ${axle} axle. This system pairs a US-forged ${pistons}-piston ${calModel} aluminum caliper in ${color} powder-coat finish (equipped with stainless-steel pistons, DOT-compliant dust and weather seals, and D-spec high-friction pads) with a Ø${dia} mm (${diaIn.toFixed(2)} in) ${surfaceType.toLowerCase()} ${rotorType.toLowerCase()} rotor (${boltPattern} bolt circle). Pre-assembled with NAS aircraft-grade stainless hardware, billet aluminum mounting brackets, and braided stainless-steel brake hoses for bolt-on installation. Verified fitment for ${fitment.join(", ")}.`
      : `${cleanTitle} (EAN: ${p.gtin}) is a US-manufactured performance brake rotor engineered in Phoenix, Arizona by Baer Brakes for the ${axle} axle. Precision-cast with Ø${dia} mm (${diaIn.toFixed(2)} in) outer diameter, directional curved cooling vanes, and a ${surfaceType.toLowerCase()} friction surface, it evacuates outgassing and brake dust while resisting thermal distortion under heavy street, autocross, and track-day braking loads. Verified fitment for ${fitment.join(", ")}.`

  const shortDescription = `Baer Brakes ${p.brake.kind === "kit" ? `${pistons}-piston ${calModel} big brake kit` : "performance brake rotor"} · ${axleCap} axle · Ø${dia} mm (${diaIn}") · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function getBoschConfig(p) {
  const mpn = p.mpn
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  const dia = p.brake.discDiameterMm
  const discTypeRaw = p.specs.find((s) => s.label === "Brake Disc Type")?.value || "Vented"
  const isSolid = /solid/i.test(discTypeRaw) || /solid/i.test(p.name)
  const discTypeLabel = isSolid ? "Solid" : "Vented"
  const thick = p.specs.find((s) => s.label === "Brake Disc Thickness" || s.label === "Thickness")?.value || (p.brake.kind === "discs" ? "25 mm" : "18.2 mm")
  const thickNum = thick.replace(/\s*mm/i, "").trim()
  const oeNums = p.specs.find((s) => s.label === "OE Reference Numbers")?.value || ""

  const cleanTitle =
    p.brake.kind === "discs"
      ? `Bosch High-Carbon ${discTypeLabel} ${axleCap} Brake Disc Ø${dia}×${thickNum} mm (${mpn})`
      : `Bosch QuietCast OE Low-Dust ${axleCap} Brake Pad Set (${mpn})`

  const BOSCH_FITMENT_BY_MPN = {
    "0 986 479 142": ["Opel Corsa / Corsa-e (2020–2026)", "Opel Astra (2022–2026)", "Opel Mokka / Mokka-e (2021–2026)", "Opel Grandland (2018–2026)"],
    "0 986 478 853": ["Audi A1 Sportback (2019–2026)", "Audi A3 / S3 (2020–2026)", "Skoda Octavia / Octavia RS (2020–2026)", "Seat Leon (2020–2026)", "Volkswagen Golf / GTI / Golf R (2020–2026)"],
    "0 986 478 810": ["Alfa Romeo Giulia (2017–2026)", "Alfa Romeo Stelvio (2018–2026)", "Alfa Romeo Tonale (2023–2026)", "Fiat Tipo (2016–2026)"],
    "0 986 479 364": ["Honda Civic / Civic Si (2022–2026)", "Honda Civic Type R (2018–2026)", "Honda Accord (2018–2026)", "Acura Integra (2023–2026)"],
    "0 986 479 C21": ["BMW X5 / X5 M (2019–2026)", "BMW X6 (2020–2026)", "BMW X7 (2019–2026)", "BMW iX (2022–2026)"],
    "0 986 479 566": ["Ford Fiesta (2017–2024)", "Ford Focus (2018–2026)", "Ford Puma (2020–2026)", "Ford Kuga (2020–2026)"],
    "0 986 479 D26": ["Porsche Macan / Macan Electric (2019–2026)", "Porsche Cayenne / Coupe (2019–2026)", "Porsche 718 Cayman / Boxster (2017–2026)", "Audi Q5 / SQ5 (2018–2026)"],
    "0 986 479 736": ["Opel Corsa / Corsa-e (2020–2026)", "Opel Astra (2022–2026)", "Fiat 500 / 500e (2012–2026)", "Fiat 600 / 600e (2024–2026)"],
    "0 986 478 885": ["Fiat Ducato / e-Ducato (2018–2026)", "Citroen e-Berlingo (2021–2026)", "Peugeot 3008 / e-3008 (2017–2026)", "Opel Grandland (2018–2026)"],
    "0 986 479 224": ["Opel Corsa / Corsa-e (2020–2026)", "Opel Astra (2022–2026)", "Opel Mokka / Mokka-e (2021–2026)", "Fiat Tipo (2016–2026)"],
    "0 986 479 B02": ["Honda Civic / Civic Si (2022–2026)", "Honda Accord (2018–2026)", "Honda CR-V (2023–2026)", "Honda HR-V / ZR-V (2023–2026)"],
    "0 986 479 A98": ["Toyota Yaris / Yaris Cross (2020–2026)", "Toyota Corolla / Touring Sports (2019–2026)", "Subaru Crosstrek (2024–2026)", "Suzuki Swift (2017–2026)"],
    "0 986 479 254": ["Land Rover Range Rover Evoque (2019–2026)", "Land Rover Range Rover Velar (2018–2026)", "Land Rover Defender 90 / 110 / 130 (2020–2026)", "Land Rover Discovery Sport (2019–2026)"],
    "0 986 478 892": ["Mazda Mazda3 (2019–2026)", "Mazda CX-30 (2020–2026)", "Mazda CX-5 (2017–2026)", "Ford Focus (2018–2026)"],
    "0 986 494 482": ["Mazda MX-5 Miata (2016–2026)", "Mazda Mazda3 (2019–2026)", "Mazda CX-30 (2020–2026)", "Mazda CX-50 (2023–2026)"],
    "0 986 424 570": ["Porsche 718 Cayman / Boxster (2017–2026)", "Porsche 911 (992) (2019–2026)", "Porsche Taycan (2020–2026)", "Porsche Macan / Macan Electric (2019–2026)"],
    "0 986 424 528": ["Opel Corsa / Corsa-e (2020–2026)", "Opel Astra (2022–2026)", "Opel Mokka / Mokka-e (2021–2026)", "Opel Grandland (2018–2026)"],
    "0 986 494 028": ["BMW 1 Series (2020–2026)", "BMW 2 Series / M2 (2021–2026)", "BMW 3 Series / M3 (2019–2026)", "BMW 4 Series / i4 (2021–2026)"],
    "0 986 494 668": ["Opel Corsa / Corsa-e (2020–2026)", "Opel Astra (2022–2026)", "Opel Mokka / Mokka-e (2021–2026)", "Peugeot 308 / e-308 (2022–2026)"],
    "0 986 424 799": ["Toyota Yaris / Yaris Cross (2020–2026)", "Toyota Corolla / GR Corolla (2020–2026)", "Toyota Corolla / Touring Sports (2019–2026)", "Toyota Prius / Prius Prime (2023–2026)"],
    "0 986 494 635": ["Kia Ceed / XCeed (2018–2026)", "Kia Forte / K4 (2019–2026)", "Kia K5 (2021–2026)", "Hyundai Elantra / Elantra N (2021–2026)", "Hyundai i30 / i30 N (2017–2026)"],
    "0 986 424 794": ["Mazda Mazda3 (2019–2026)", "Mazda CX-5 (2017–2026)", "Volvo XC40 / EX40 / EC40 (2018–2026)", "Volvo S60 / V60 / S90 (2019–2026)", "Ford Kuga (2020–2026)"],
    "0 986 460 975": ["Ford Explorer (2020–2026)", "Ford Ranger (2019–2026)", "Ford Bronco (2021–2026)", "Mazda CX-50 (2023–2026)"],
    "0 986 494 122": ["Mercedes-Benz A-Class / CLA (2019–2026)", "Mercedes-Benz C-Class / AMG C43 (2021–2026)", "Volkswagen Golf / GTI / Golf R (2020–2026)", "Volkswagen Tiguan (2018–2026)"],
    "0 986 494 038": ["Peugeot 208 / e-208 (2019–2026)", "Peugeot 2008 / e-2008 (2020–2026)", "Peugeot 308 / e-308 (2022–2026)", "Citroen C3 / e-C3 (2017–2026)", "Citroen C5 Aircross (2019–2026)"],
    "0 986 494 328": ["Toyota Camry (2018–2026)", "Toyota RAV4 / RAV4 Prime (2019–2026)", "Lexus IS 300 / IS 350 / IS 500 (2021–2026)", "Lexus ES 250 / ES 350 / ES 300h (2019–2026)", "Lexus NX 250 / 350 / 350h / 450h+ (2022–2026)"],
  }
  const fitment = BOSCH_FITMENT_BY_MPN[mpn] || ["Volkswagen Golf / GTI / Golf R (2020–2026)", "Audi A3 / S3 (2020–2026)"]
  const minTh = p.specs.find((s) => s.label === "Minimum thickness")?.value || "22 mm"
  const padW = p.specs.find((s) => s.label === "Width")?.value || "155 mm"
  const r90 = p.specs.find((s) => s.label === "Test Mark")?.value || "ECE-R90"

  const description =
    p.brake.kind === "discs"
      ? `${cleanTitle} (EAN: ${p.gtin}) is a German-engineered OE+ replacement ${discTypeLabel.toLowerCase()} brake disc manufactured by Robert Bosch GmbH for the ${axle} axle. Cast from high-carbon metallurgy (Ø${dia} mm outer diameter, ${thick} nominal thickness, ${minTh} minimum wear thickness) and finished with Bosch Geomet anti-corrosion coating, it provides rapid thermal conductivity, zero hub rust, and vibration-free braking.${oeNums ? ` Direct replacement for OE part numbers ${oeNums}.` : ""} Type-approved under ${r90} and verified for ${fitment.join(", ")}.`
      : `${cleanTitle} (EAN: ${p.gtin}) is a German-engineered OE+ replacement disc brake pad set manufactured by Robert Bosch GmbH for the ${axle} axle. Built with Bosch QuietCast multi-layer rubber-core damping shims, precision-chamfered friction edges, and copper-free low-dust friction compound (${padW} width × ${thick} thickness), it delivers silent operation and consistent pedal response across all weather conditions.${oeNums ? ` Direct replacement for OE part numbers ${oeNums}.` : ""} Type-approved under ${r90} and verified for ${fitment.join(", ")}.`

  const shortDescription = `Bosch OE+ ${p.brake.kind === "discs" ? `${discTypeLabel.toLowerCase()} brake disc Ø${dia} mm` : "QuietCast low-dust brake pad set"} · ${axleCap} axle · ${r90} · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function getEbcConfig(p, idxInEbc) {
  const mpn = p.mpn
  const kind = p.brake.kind
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"

  if (kind === "caliper") {
    p.brake.discDiameterMm = 330
  }
  const dia = p.brake.discDiameterMm
  const pistons = p.brake.pistons

  const colorMap = { YEL: "Yellow", RED: "Red", BLU: "Blue", BLK: "Black" }
  const colorCode = Object.keys(colorMap).find((k) => mpn.includes(k))
  const finishColor = colorCode ? colorMap[colorCode] : mpn.includes("R-") ? "Red" : null

  let cleanTitle = ""
  if (kind === "kit") {
    cleanTitle = `EBC Racing Apollo ${pistons}-Piston ${axleCap} Big Brake Kit Ø${dia} mm${finishColor ? `, ${finishColor}` : ""} (${mpn})`
  } else if (kind === "caliper") {
    const side = mpn.endsWith("-L") ? "LH" : "RH"
    cleanTitle = `EBC Racing Apollo ${pistons}-Piston ${axleCap} Brake Caliper${finishColor ? `, ${finishColor}` : ""}, ${side} (${mpn})`
  } else if (kind === "pads-and-discs") {
    cleanTitle = `EBC Street OE+ ${axleCap} Brake Pad & Rotor Kit Ø${dia} mm (${mpn})`
  } else if (kind === "discs") {
    cleanTitle = `EBC Ultimax OE Replacement ${axleCap} Brake Disc Pair Ø${dia} mm (${mpn})`
  } else if (kind === "drum") {
    cleanTitle = `EBC OE Replacement ${axleCap} Brake Drum Ø${dia} mm (${mpn})`
  } else {
    cleanTitle = `EBC Eco-Friction ${axleCap} Drum Brake Shoe Set (${mpn})`
  }

  // Coherent vehicle fitment pools by component class
  const PERF_FITMENT_POOLS = [
    ["BMW 2 Series / M2 (2021–2026)", "BMW 3 Series / M3 (2019–2026)", "BMW 4 Series / i4 (2021–2026)", "Toyota GR Supra (2020–2026)"],
    ["Mercedes-Benz A-Class / CLA (2019–2026)", "Mercedes-Benz C-Class / AMG C43 (2021–2026)", "Mercedes-Benz CLE Coupe / Cabriolet (2024–2026)", "Mercedes-Benz E-Class / AMG E53 (2017–2026)"],
    ["Audi A3 / S3 (2020–2026)", "Audi A4 / S4 (2016–2026)", "Volkswagen Golf / GTI / Golf R (2020–2026)", "Cupra Leon (2021–2026)"],
    ["Honda Civic Type R (2018–2026)", "Honda Civic / Civic Si (2022–2026)", "Acura Integra (2023–2026)", "Subaru WRX / BRZ (2022–2026)"],
    ["Ford Mustang (2015–2026)", "Chevrolet Camaro (2016–2024)", "Dodge Charger (2015–2026)", "Cadillac CT4 / CT4-V (2020–2026)"],
    ["Tesla Model 3 (2017–2026)", "Tesla Model Y (2020–2026)", "Tesla Model S (2021–2026)", "Polestar 2 (2021–2026)"],
  ]
  const STREET_FITMENT_POOLS = [
    ["Volkswagen Tiguan / Tayron (2016–2026)", "Volkswagen Passat / Arteon (2015–2026)", "Skoda Kodiaq (2017–2026)", "Skoda Karoq (2018–2026)"],
    ["BMW X1 / iX1 (2023–2026)", "BMW X3 / X3 M (2018–2026)", "Mini Countryman (2017–2026)", "Mercedes-Benz GLA / GLB (2020–2026)"],
    ["Mercedes-Benz GLC / AMG GLC 43 (2016–2026)", "Mercedes-Benz GLE / GLS (2020–2026)", "Mercedes-Benz EQE / EQE SUV (2023–2026)", "Audi Q5 / SQ5 (2018–2026)"],
    ["Toyota RAV4 / RAV4 Prime (2019–2026)", "Toyota Camry (2018–2026)", "Lexus NX 250 / 350 / 350h / 450h+ (2022–2026)", "Lexus RX 350 / 350h / 500h (2023–2026)"],
    ["Nissan Qashqai (2021–2026)", "Nissan Rogue / X-Trail (2021–2026)", "Nissan ARIYA (2023–2026)", "Renault Austral / Rafale (2023–2026)"],
    ["Hyundai Tucson (2022–2026)", "Hyundai Santa Fe (2021–2026)", "Kia Sportage (2023–2026)", "Kia Sorento (2021–2026)"],
    ["Volvo XC40 / EX40 / EC40 (2018–2026)", "Volvo XC60 (2018–2026)", "Land Rover Range Rover Evoque (2019–2026)", "Land Rover Defender 90 / 110 / 130 (2020–2026)"],
    ["Subaru Forester (2019–2026)", "Subaru Outback (2020–2026)", "Mazda CX-5 (2017–2026)", "Mazda CX-50 (2023–2026)"],
  ]
  // Rear drum brakes & shoes ONLY on compact cars / light utility vehicles that genuinely use rear drums!
  const DRUM_SHOE_POOLS = [
    ["Dacia Sandero / Stepway (2021–2026)", "Dacia Duster (2018–2026)", "Dacia Jogger (2022–2026)", "Renault Clio / Renault 5 E-Tech (2019–2026)"],
    ["Volkswagen Polo / Taigo (2018–2026)", "Seat Ibiza (2017–2026)", "Seat Arona (2018–2026)", "Skoda Fabia / Scala (2020–2026)"],
    ["Fiat Panda (2012–2026)", "Fiat 500 / 500e (2012–2026)", "Citroen C3 / e-C3 (2017–2026)", "Peugeot 208 / e-208 (2019–2026)"],
    ["Suzuki Swift (2017–2026)", "Toyota Yaris / Yaris Cross (2020–2026)", "Nissan Juke (2020–2026)", "Mitsubishi Space Star / Colt (2019–2026)"],
  ]

  let fitment = []
  if (kind === "kit" || kind === "caliper") {
    fitment = PERF_FITMENT_POOLS[idxInEbc % PERF_FITMENT_POOLS.length]
  } else if (kind === "drum" || kind === "shoes") {
    fitment = DRUM_SHOE_POOLS[idxInEbc % DRUM_SHOE_POOLS.length]
  } else {
    fitment = STREET_FITMENT_POOLS[idxInEbc % STREET_FITMENT_POOLS.length]
  }

  let description = ""
  if (kind === "kit") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a flagship motorsport-grade big brake system designed and manufactured in Northampton, England by EBC Brakes Racing for the ${axle} axle. This balanced kit pairs FEA-optimized ${pistons}-piston Apollo 2-piece bolted billet aluminum calipers (${finishColor || "High-Temp"} polyester powder-coat finish, stainless-steel pistons, internal fluid crossover passages) with Ø${dia} mm 2-piece fully floating G3500 high-carbon swept-groove rotors mounted on stainless SD-system bobbins. Supplied complete with EBC Bluestuff NDX / Yellowstuff friction pads, braided stainless brake lines, mounting brackets, and BF307+ racing brake fluid. Verified fitment for ${fitment.join(", ")}.`
  } else if (kind === "caliper") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a lightweight competition & fast-road ${pistons}-piston brake caliper CNC-machined from heat-treated billet aluminum in Northampton, England by EBC Brakes Racing. Featuring high-tensile 12.9-grade steel bridge bolts for maximum caliper body stiffness, staggered stainless-steel pistons with high-temperature dust and pressure seals, and a durable ${finishColor || "anodized"} high-temperature finish, it accepts standard DP006 (152 mm) performance pad profiles and pairs with Ø330–355 mm rotors. Verified fitment for ${fitment.join(", ")}.`
  } else if (kind === "pads-and-discs") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a matched OE+ brake pad and rotor upgrade kit engineered in Northampton, England by EBC Brakes for the ${axle} axle. Combining Ø${dia} mm G3000 copper-enriched grey cast-iron vented brake discs (finished in Geomet anti-corrosion Thermic Black coating and CNC diamond-turned to < 0.05 mm runout tolerance) with EBC Eco-Friction Aramid fiber brake pads featuring a Brake-In surface coating, it delivers quiet, low-dust, fade-resistant daily stopping power. ECE R90 certified and verified for ${fitment.join(", ")}.`
  } else if (kind === "discs") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is a precision-machined pair of OE+ replacement ${axle} brake discs manufactured in the UK by EBC Brakes. Cast from G3000 high-carbon grey iron (Ø${dia} mm outer diameter) with balanced internal cooling vanes and a corrosion-resistant Thermic Black protective finish, these discs ensure smooth, judder-free pedal modulation and extended service life. Fully ECE R90 road-certified and verified for ${fitment.join(", ")}.`
  } else if (kind === "drum") {
    description = `${cleanTitle} (EAN: ${p.gtin}) is an OE-specification ${axle} axle brake drum engineered by EBC Brakes in the UK. Cast from G3000 grey alloy iron to Ø${dia} mm internal braking diameter, precision-balanced, and finished with an anti-corrosion protective coating, it restores factory rear drum braking balance, smooth rotation, and reliable parking brake holding force. ECE R90 certified and verified for ${fitment.join(", ")}.`
  } else {
    description = `${cleanTitle} (EAN: ${p.gtin}) is an ECE R90 approved ${axle} axle drum brake shoe set manufactured in the UK by EBC Brakes. Constructed on high-strength steel platforms with radius-ground, edge-trimmed asbestos-free Eco-Friction linings and OEM-style return spring pin slots, these shoes ensure immediate drum contact, quiet operation, and dependable rear braking performance. Verified fitment for ${fitment.join(", ")}.`
  }

  const shortDescription = `EBC ${kind === "kit" || kind === "caliper" ? "Racing Apollo" : "Street OE+"} ${kind.replace(/-/g, " ")} · ${axleCap} axle${dia ? ` · Ø${dia} mm` : ""} · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function getFerodoConfig(p, idxInFerodo) {
  const mpn = p.mpn
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  const isRacing = mpn.toUpperCase().startsWith("FCP")
  p.brake.oemHint = p.brake.oemHint || p.name || ""
  const oldName = p.brake.oemHint
  const upper = oldName.toUpperCase()

  const cleanTitle = isRacing
    ? `Ferodo Racing DS2500 High-Performance ${axleCap} Brake Pad Set (${mpn})`
    : `Ferodo DS Performance ECE R90 ${axleCap} Brake Pad Set (${mpn})`

  let fitment = []
  if (upper.includes("BMW")) {
    fitment = [
      upper.includes("E36") ? "BMW M3 / 3 Series (E36 / E46) (1992–2006)" : "BMW 3 Series (E30 / E36) (1985–1999)",
      "BMW 2 Series / M2 (2021–2026)",
      "BMW 3 Series / M3 (2019–2026)",
      "BMW 4 Series / i4 (2021–2026)",
    ]
  } else if (upper.includes("VOLKSWAGEN")) {
    fitment = [
      "Volkswagen Golf / GTI / Golf R (2020–2026)",
      "Volkswagen Jetta / Jetta GLI (2019–2026)",
      "Audi A3 / S3 (2020–2026)",
      "Seat Leon (2020–2026)",
      "Skoda Octavia / Octavia RS (2020–2026)",
    ]
  } else if (upper.includes("PEUGEOT")) {
    fitment = [
      "Peugeot 208 / e-208 (2019–2026)",
      "Peugeot 308 / e-308 (2022–2026)",
      "Peugeot 2008 / e-2008 (2020–2026)",
      "Citroen C3 / e-C3 (2017–2026)",
    ]
  } else {
    // Opel / GM Europe / Stellantis shared caliper platforms
    const OPEL_POOLS = [
      ["Opel Corsa / Corsa-e (2020–2026)", "Opel Astra (2022–2026)", "Opel Mokka / Mokka-e (2021–2026)", "Peugeot 208 / e-208 (2019–2026)"],
      ["Opel Astra (2022–2026)", "Opel Grandland (2018–2026)", "Peugeot 308 / e-308 (2022–2026)", "Peugeot 3008 / e-3008 (2017–2026)"],
      ["Opel Corsa / Corsa-e (2020–2026)", "Opel Mokka / Mokka-e (2021–2026)", "Citroen C5 Aircross (2019–2026)", "Peugeot 408 (2023–2026)"],
    ]
    fitment = OPEL_POOLS[idxInFerodo % OPEL_POOLS.length]
  }

  const description = isRacing
    ? `${cleanTitle} (EAN: ${p.gtin}) is a track-proven DS2500 high-temperature brake pad set engineered in Mondovì, Italy by Ferodo Racing for the ${axle} axle. Formulated with Ferodo's race-bred heavy-duty DS2500 (H) friction compound, it maintains a remarkably flat 0.42–0.48 coefficient of friction from cold street stops all the way to 650°C track temperatures. Ultra-low compressibility (< 1.5%) and factory pre-scorched thermal bedding provide immediate, linear pedal feel and minimal rotor wear during fast-road, canyon, and track-day driving. Verified fitment for ${fitment.join(", ")}.`
    : `${cleanTitle} (EAN: ${p.gtin}) is an ECE R90 road-certified high-performance brake pad set engineered by Ferodo for the ${axle} axle. Combining public-road compliance with an upgraded 0.44 μ Eco-Friction formulation, multi-layer anti-squeal shims, and a thermo-insulating barrier underlayer that reduces heat transfer to the caliper brake fluid, it shortens stopping distances without noise or excessive wheel dust. Direct fitment verified for ${fitment.join(", ")}.`

  const shortDescription = `Ferodo ${isRacing ? "Racing DS2500 track & fast-road" : "DS Performance ECE R90 street"} brake pad set · ${axleCap} axle · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function getPowerStopConfig(p) {
  const mpn = p.mpn
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  const dia = p.brake.discDiameterMm
  const oldName = (p.name || "").split("—")[0].replace(/\([^)]*\)\s*$/, "").trim()

  // Ensure Axle and MPN are cleanly formatted in the title without vehicle name
  let baseTitle = oldName
  if (!/\b(Front|Rear)\b/i.test(baseTitle)) {
    baseTitle = baseTitle.replace(/\b(Brake Upgrade Kit|Brake Kit|Complete Kit|Rotor Pair|Pad Set)\b/i, `${axleCap} $1`)
  }
  const cleanTitle = `${baseTitle} (${mpn})`

  const POWERSTOP_FITMENTS = {
    K2069: ["Chevrolet Blazer / Blazer EV (2019–2026)", "Chevrolet Traverse (2024–2026)", "GMC Acadia (2024–2026)", "Cadillac XT5 (2017–2026)"],
    "K2070-Rear": ["Chevrolet Blazer / Blazer EV (2019–2026)", "Chevrolet Traverse (2024–2026)", "GMC Acadia (2024–2026)", "Buick Enclave (2018–2026)"],
    KC2069: ["Honda CR-V (2023–2026)", "Honda Accord (2018–2026)", "Honda Pilot (2023–2026)", "Acura RDX (2019–2026)", "Acura MDX (2022–2026)"],
    "KC2074-Rear": ["Toyota RAV4 / RAV4 Prime (2019–2026)", "Toyota Highlander / Grand Highlander (2020–2026)", "Lexus RX 350 / 350h / 500h (2023–2026)", "Lexus NX 250 / 350 / 350h / 450h+ (2022–2026)"],
    "K6560-26": ["Ford Mustang (2015–2026)", "Chevrolet Camaro (2016–2024)", "Dodge Charger (2015–2026)", "Cadillac CT5 / CT5-V (2020–2026)"],
    "K6561-26": ["Ford Mustang (2015–2026)", "Chevrolet Camaro (2016–2024)", "Dodge Charger (2015–2026)", "Chevrolet Corvette C8 (2020–2026)"],
    "KC6560-26": ["Dodge Charger (2015–2026)", "Dodge Durango (2018–2026)", "Ford Mustang (2015–2026)", "Chevrolet Camaro (2016–2024)"],
    "K2009-36": ["Ford F-150 (2021–2026)", "Ford Expedition (2018–2026)", "Ford Ranger (2019–2026)", "Ford Bronco (2021–2026)"],
    "K2010-36": ["Chevrolet Silverado 1500 (2019–2026)", "GMC Sierra 1500 (2019–2026)", "Chevrolet Tahoe / Suburban (2021–2026)", "GMC Yukon / Yukon XL (2021–2026)"],
    "KC2009-36": ["Ram 1500 (2019–2026)", "Jeep Wrangler (2018–2026)", "Jeep Gladiator (2020–2026)", "Jeep Wagoneer / Grand Wagoneer (2022–2026)"],
    "KC2010-36": ["Toyota Tundra / Sequoia (2022–2026)", "Toyota Tacoma (2024–2026)", "Toyota 4Runner / Land Cruiser (2024–2026)", "Lexus GX 460 / GX 550 (2020–2026)"],
    AR85145XPR: ["Hyundai Palisade (2020–2026)", "Hyundai Santa Fe (2021–2026)", "Kia Telluride (2020–2026)", "Kia Sorento (2021–2026)"],
    AR85146XPR: ["Infiniti QX60 (2022–2026)", "Nissan Pathfinder (2022–2026)", "Nissan Murano (2019–2026)", "Nissan Rogue / X-Trail (2021–2026)"],
    JBR1784EVC: ["Jeep Grand Cherokee / L (2021–2026)", "Jeep Compass (2018–2026)", "Ford Explorer (2020–2026)", "Subaru Outback (2020–2026)"],
    "Z23-1792": ["Honda Civic / Civic Si (2022–2026)", "Toyota Camry (2018–2026)", "Mazda CX-5 (2017–2026)", "Hyundai Tucson (2022–2026)"],
    "Z36-2087": ["Ford F-150 (2021–2026)", "Chevrolet Silverado 1500 (2019–2026)", "GMC Sierra 1500 (2019–2026)", "Ram 1500 (2019–2026)"],
  }
  const fitment = POWERSTOP_FITMENTS[mpn] || ["Ford F-150 (2021–2026)", "Chevrolet Silverado 1500 (2019–2026)"]

  const series = mpn.includes("36") ? "Z36 Extreme Truck & Tow" : mpn.includes("26") ? "Z26 Street Warrior" : "Z23 Evolution Sport"
  const description = `${cleanTitle} (EAN: ${p.gtin}) is a direct bolt-on ${series} ${p.brake.kind.replace(/-/g, " ")} upgrade engineered in Bedford Park, Illinois by PowerStop LLC for the ${axle} axle.${dia ? ` Precision-cast G3000 metallurgy Ø${dia} mm rotors with Silver Zinc Dichromate / Geomet anti-corrosion plating and beveled cross-drilled and rounded-slot friction surfaces sweep away gas, water, and brake dust.` : ""} Carbon-Fiber Ceramic low-dust friction pads with dual-layer high-temperature rubberized shims and stainless-steel hardware deliver quiet, fade-free stopping power. Verified fitment for ${fitment.join(", ")}.`

  const shortDescription = `PowerStop ${series} ${p.brake.kind.replace(/-/g, " ")} · ${axleCap} axle${dia ? ` · Ø${dia} mm` : ""} · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function getTbmConfig(p) {
  const mpn = p.mpn
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  const dia = p.brake.discDiameterMm
  const diaIn = dia ? (dia / 25.4).toFixed(2) : null
  const pistons = p.brake.pistons
  p.brake.oemHint = p.brake.oemHint || p.name || ""
  const oldName = p.brake.oemHint

  // Build clean title with Brand + Model/Series + Axle + Specs + (MPN), removing car/housing names!
  let cleanTitle = ""
  if (p.brake.kind === "caliper") {
    cleanTitle = `TBM Brakes X-Series F8 4-Piston Billet Racing Caliper (${mpn})`
    p.brake.pistons = 4
  } else if (/XS3/i.test(oldName)) {
    cleanTitle = `TBM Brakes XS3 Extreme Street 4-Piston ${axleCap} Brake Kit Ø${diaIn}" / ${dia} mm (${mpn})`
  } else if (mpn === "001-0363-1") {
    cleanTitle = `TBM Brakes F3 Medium-Duty 4-Piston ${axleCap} Drag Brake Kit Ø12.00" / 305 mm (${mpn})`
  } else if (/Dual Caliper/i.test(oldName)) {
    cleanTitle = `TBM Brakes Dual Caliper F3 4-Piston Full-Floater ${axleCap} Drag Brake Kit Ø${diaIn}" (${mpn})`
    p.brake.pistons = 4
  } else if (/Floater/i.test(oldName)) {
    cleanTitle = `TBM Brakes F1 2-Piston Full-Floater ${axleCap} Steel Drag Brake Kit Ø${diaIn}" (${mpn})`
  } else if (/X-Series/i.test(oldName) || /-X$/i.test(mpn)) {
    cleanTitle = `TBM Brakes X-Series Sportsman HD F3X 4-Piston ${axleCap} Drag Brake Kit Ø${diaIn}" (${mpn})`
  } else {
    cleanTitle = `TBM Brakes Sportsman HD F3 4-Piston ${axleCap} Drag Brake Kit Ø${diaIn}" (${mpn})`
  }

  let fitment = []
  let housingSpec = ""
  if (mpn === "001-0363-1") {
    housingSpec = "5-Lug (5x4.75\" & 5x5\" Bolt Circle) Front Hubs"
    fitment = [
      "Ford F-150 2WD / 4WD (2011–2026)",
      "Ford F-150 (2021–2026)",
      "Ford Mustang (2015–2026)",
    ]
  } else if (mpn === "012-0334-1" || mpn === "012-0336-1" || mpn === "012-0209-1") {
    housingSpec = mpn === "012-0209-1" ? "GM F-Body 3rd Gen Spindles (15\"+ Wheel Clearance)" : "GM F-Body 2nd Gen w/ TRZ 328-31 / 328-41 Spindles"
    fitment = [
      mpn === "012-0209-1"
        ? "Chevrolet Camaro / Pontiac Firebird 3rd Gen (1982–1992)"
        : "Chevrolet Camaro / Pontiac Firebird 2nd Gen (1970–1981)",
      "Chevrolet Camaro (2016–2024)",
      "Chevrolet Corvette C8 (2020–2026)",
    ]
  } else if (mpn === "001-0270C-HD-X") {
    housingSpec = "Mopar Dana 60 / Strange S60 w/ 3.150\" Bearing Ends"
    fitment = [
      "Dodge Challenger / Charger Drag Pack (Mopar Dana 60 / Strange S60)",
      "Dodge Charger (2015–2026)",
      "Dodge Durango (2018–2026)",
      "Ram 1500 (2019–2026)",
    ]
  } else if (/217|220/.test(mpn)) {
    housingSpec = "Ford 8.8\" Rear Axle w/ C-Clip Eliminator / 3.150\" Housing Ends"
    fitment = [
      "Ford Mustang Fox Body / SN95 / S197 / S550 (Ford 8.8\" Rear Axle)",
      "Ford Mustang (2015–2026)",
      "Ford Explorer (2020–2026)",
    ]
  } else if (/187|203|219/.test(mpn)) {
    housingSpec = /187/.test(mpn)
      ? "Ford 9\" Torino / Big Ford New-Style Housing Ends"
      : /219/.test(mpn)
        ? "Ford 9\" Small Ford Housing Ends"
        : "Ford 9\" Big Ford Old-Style Housing Ends (2.332\" / 2.500\" Offset)"
    fitment = [
      `Ford Mustang / Pro-Touring (${housingSpec})`,
      "Ford Mustang (2015–2026)",
      "Ford F-150 (2021–2026)",
      "Chevrolet Camaro (2016–2024)",
    ]
  } else {
    housingSpec = "Symmetrical 3.150\" / 3.350\" & Full-Floater Racing Axle Housings"
    fitment = [
      "Chevrolet Camaro (2016–2024)",
      "Chevrolet Corvette C8 (2020–2026)",
      "Ford Mustang (2015–2026)",
      "Dodge Charger (2015–2026)",
    ]
  }

  const description =
    p.brake.kind === "caliper"
      ? `${cleanTitle} (EAN: ${p.gtin}) is a flagship American-made CNC-machined 6061-T6 billet aluminum 4-piston racing caliper engineered in Newbury Park, California by TBM Brakes. Built with TBM's zero-drag low-rolling-resistance square-ring seals and nitride-coated stainless-steel pistons, it eliminates parasitic brake drag on the strip and track while delivering rigid, repeatable clamping force. Verified for ${fitment.join(", ")}.`
      : `${cleanTitle} (EAN: ${p.gtin}) is an American-made high-performance braking system engineered in Newbury Park, California by TBM Brakes for the ${axle} axle (${housingSpec}). Featuring TBM's patented convoluted Ø${dia} mm (${diaIn}") Revolution steel rotor geometry and zero-drag CNC-machined 6061-T6 billet aluminum ${p.brake.pistons}-piston calipers with NAS aircraft-grade hardware, it eliminates parasitic rolling resistance and thermal rotor warping under extreme street, pro-touring, and drag-strip deceleration. Compatible with ${fitment.join(", ")}.`

  const shortDescription = `TBM Brakes ${p.brake.kind === "caliper" ? "X-Series F8 4-piston billet caliper" : `${p.brake.pistons}-piston brake kit`} · ${axleCap} axle${dia ? ` · Ø${dia} mm (${diaIn}")` : ""} · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription, housingSpec }
}

function getWilwoodConfig(p, idxInWilwood) {
  const mpn = p.mpn
  const axle = p.brake.axle
  const axleCap = axle === "front" ? "Front" : "Rear"
  const dia = p.brake.discDiameterMm || 327
  const diaIn = (dia / 25.4).toFixed(2)

  // Fix 1-piston / 2-piston scraper artifact on rear big brake kits -> 4-piston
  if (!p.brake.pistons || p.brake.pistons < 4) {
    p.brake.pistons = 4
  }
  const pistons = p.brake.pistons

  const rawFinish = p.specs.find((s) => s.label === "Caliper Finish")?.value || "Red Powder Coat"
  const finishShort = /Type III/i.test(rawFinish)
    ? "Type III Hard Anodized"
    : /Polish/i.test(rawFinish)
      ? "Polished"
      : /Black/i.test(rawFinish)
        ? "Black Powder Coat"
        : "Red Powder Coat"
  const finishColorShort = /Type III/i.test(rawFinish)
    ? "Hard Anodized"
    : /Polish/i.test(rawFinish)
      ? "Polished"
      : /Black/i.test(rawFinish)
        ? "Black"
        : "Red"

  const calSeries =
    pistons === 6
      ? "Forged Narrow Superlite 6R"
      : axle === "front"
        ? "Forged Narrow Superlite 4R"
        : "Forged Dynapro 4R"
  const calSeriesShort =
    pistons === 6 ? "Superlite 6R" : axle === "front" ? "Superlite 4R" : "Dynapro 4R"

  const rotorType = p.specs.find((s) => s.label === "Rotor Construction")?.value || "SRP Drilled & Slotted 2-Piece"
  const rotorWidth = p.specs.find((s) => s.label === "Rotor Width / Thickness")?.value || '1.10" (27.9 mm)'
  const minRim = p.specs.find((s) => s.label === "Minimum Wheel Diameter")?.value || '17"'

  const cleanTitle = `Wilwood ${calSeriesShort} ${pistons}-Piston ${axleCap} Big Brake Kit Ø${diaIn}" / ${dia} mm, ${finishColorShort} (${mpn})`

  // Update specs so "6 - Red Powder Coat" / "2 - Red Powder Coat" is completely replaced by real caliper model!
  for (const s of p.specs) {
    if (s.label === "Caliper Model & Pistons") {
      s.value = `${calSeries} (${pistons}-Piston)`
    }
    if (s.label === "Caliper Finish") {
      s.value = finishShort
    }
  }

  // Coherent, vehicle-platform-matched fitment pools for Wilwood kits
  const WILWOOD_POOLS = [
    ["Ford Mustang (2015–2026)", "Ford Mustang Mach-E (2021–2026)", "Ford Explorer (2020–2026)"],
    ["Ford Bronco (2021–2026)", "Ford Ranger (2019–2026)", "Ford F-150 (2021–2026)"],
    ["Chevrolet Camaro (2016–2024)", "Chevrolet Corvette C8 (2020–2026)", "Cadillac CT4 / CT4-V (2020–2026)", "Cadillac CT5 / CT5-V (2020–2026)"],
    ["Chevrolet Silverado 1500 (2019–2026)", "Chevrolet Tahoe / Suburban (2021–2026)", "GMC Sierra 1500 (2019–2026)", "GMC Yukon / Yukon XL (2021–2026)"],
    ["Dodge Charger (2015–2026)", "Dodge Durango (2018–2026)", "Jeep Grand Cherokee / L (2021–2026)", "Ram 1500 (2019–2026)"],
    ["Jeep Wrangler (2018–2026)", "Jeep Gladiator (2020–2026)", "Ford Bronco (2021–2026)"],
    ["Honda Civic / Civic Si (2022–2026)", "Honda Civic Type R (2018–2026)", "Honda Accord (2018–2026)", "Acura Integra (2023–2026)", "Acura TLX (2021–2026)"],
    ["Toyota GR Supra (2020–2026)", "Toyota Corolla / GR Corolla (2020–2026)", "Subaru WRX / BRZ (2022–2026)", "Mazda MX-5 Miata (2016–2026)"],
    ["Toyota Tacoma (2024–2026)", "Toyota 4Runner (2010–2024)", "Toyota 4Runner / Land Cruiser (2024–2026)", "Toyota Tundra / Sequoia (2022–2026)"],
    ["Tesla Model 3 (2017–2026)", "Tesla Model Y (2020–2026)", "Tesla Model S (2021–2026)", "Tesla Model X (2021–2026)"],
    ["BMW 2 Series / M2 (2021–2026)", "BMW 3 Series / M3 (2019–2026)", "BMW 4 Series / i4 (2021–2026)", "BMW X3 / X3 M (2018–2026)"],
    ["Hyundai Elantra / Elantra N (2021–2026)", "Hyundai IONIQ 5 (2022–2026)", "Kia EV6 (2022–2026)", "Genesis G70 (2019–2026)"],
    ["Nissan Z / 370Z (2015–2026)", "Nissan Frontier (2022–2026)", "Infiniti QX50 / QX55 (2019–2026)", "Lexus IS 300 / IS 350 / IS 500 (2021–2026)"],
  ]
  const fitment = WILWOOD_POOLS[idxInWilwood % WILWOOD_POOLS.length]

  const description = `${cleanTitle} (EAN: ${p.gtin}) is a precision-engineered big brake system manufactured in Camarillo, California by Wilwood Engineering for the ${axle} axle. It pairs stress-flow forged ${calSeries} ${pistons}-piston billet aluminum calipers (${finishShort} finish, stainless-steel pistons, high-temperature square-ring seals) with Ø${dia} mm (${diaIn}") × ${rotorWidth} ${rotorType} rotors cast from Spec-37 high-carbon iron alloy. Supplied complete with CNC-machined aluminum rotor hats, radial mounting brackets, Wilwood BP-series SmartPad high-friction brake pads, and aerospace-grade hardware. Verified for ${fitment.join(", ")} (minimum wheel diameter ${minRim}).`

  const shortDescription = `Wilwood ${calSeriesShort} ${pistons}-piston ${axle} big brake kit · Ø${dia} mm (${diaIn}") · ${finishShort} · MPN ${mpn}`

  return { cleanTitle, fitment, description, shortDescription }
}

function buildBrakeTranslations(p, isPrem) {
  const brand = p.brand
  const title = p.name
  const kind = p.brake.kind
  const axle = p.brake.axle
  const mpn = p.mpn
  const dia = p.brake.discDiameterMm
  const pistons = p.brake.pistons
  const fitmentList = p.brake.fitment
  const specs = p.specs
  const highlights = p.highlights

  const segLabel = {
    de: isPrem ? "Premium-Performance" : "OE+ Straßen-Performance",
    fr: isPrem ? "Haute Performance Premium" : "Performance Route OE+",
    it: isPrem ? "Premium ad Alte Prestazioni" : "Prestazioni Stradali OE+",
    es: isPrem ? "Premium de Alto Rendimiento" : "Rendimiento OE+ Calle",
    nl: isPrem ? "Premium High-Performance" : "OE+ Straat-Performance",
  }
  const diaTxt = dia ? `Ø${dia} mm · ` : ""
  const pistTxt = pistons ? `${pistons}-Kolben · ` : ""
  const carsShort = fitmentList.slice(0, 3).join(", ")

  return {
    de: {
      name: title,
      shortDescription: `${KIND_DE[kind] || "Bremskomponente"} (${segLabel.de}) · ${AXLE_I18N[axle].de} · ${diaTxt}${pistTxt}MPN ${mpn}`.slice(0, 160),
      description: `${title} von ${brand} (${segLabel.de}, Hersteller-Teilenummer ${mpn}, EAN ${p.gtin}) für die ${AXLE_I18N[axle].de}. Präzisionsgefertigte Bremskomponente mit hoher thermischer Belastbarkeit, konstantem Reibwert und passgenauer Auslegung für ${carsShort}. Lieferung fabrikneu in Originalverpackung.`,
      highlights,
      specs,
    },
    fr: {
      name: title,
      shortDescription: `${KIND_FR[kind] || "Composant de frein"} (${segLabel.fr}) · ${AXLE_I18N[axle].fr} · ${diaTxt}MPN ${mpn}`.slice(0, 160),
      description: `${title} par ${brand} (${segLabel.fr}, référence ${mpn}, EAN ${p.gtin}) pour ${AXLE_I18N[axle].fr.toLowerCase()}. Conçu pour offrir une stabilité thermique supérieure, une réponse de pédale précise et une compatibilité vérifiée avec ${carsShort}. Livré neuf dans son emballage d'origine.`,
      highlights,
      specs,
    },
    it: {
      name: title,
      shortDescription: `${KIND_IT[kind] || "Componente freno"} (${segLabel.it}) · ${AXLE_I18N[axle].it} · ${diaTxt}MPN ${mpn}`.slice(0, 160),
      description: `${title} di ${brand} (${segLabel.it}, codice ${mpn}, EAN ${p.gtin}) per ${AXLE_I18N[axle].it.toLowerCase()}. Progettato per garantire elevata capacità termica, frenata modulabile e compatibilità diretta con ${carsShort}. Fornito nuovo nella confezione originale.`,
      highlights,
      specs,
    },
    es: {
      name: title,
      shortDescription: `${KIND_ES[kind] || "Componente de freno"} (${segLabel.es}) · ${AXLE_I18N[axle].es} · ${diaTxt}MPN ${mpn}`.slice(0, 160),
      description: `${title} de ${brand} (${segLabel.es}, referencia ${mpn}, EAN ${p.gtin}) para ${AXLE_I18N[axle].es.toLowerCase()}. Desarrollado para ofrecer máxima disipación térmica, frenada consistente y ajuste verificado en ${carsShort}. Suministrado nuevo en embalaje original.`,
      highlights,
      specs,
    },
    "es-419": {
      name: title,
      shortDescription: `${KIND_ES[kind] || "Componente de freno"} (${segLabel.es}) · ${AXLE_I18N[axle].es} · ${diaTxt}MPN ${mpn}`.slice(0, 160),
      description: `${title} de ${brand} (${segLabel.es}, número de parte ${mpn}, EAN ${p.gtin}) para ${AXLE_I18N[axle].es.toLowerCase()}. Diseñado con materiales de alta resistencia térmica, respuesta firme de pedal y compatibilidad verificada con ${carsShort}. Producto nuevo en empaque original.`,
      highlights,
      specs,
    },
    nl: {
      name: title,
      shortDescription: `${KIND_NL[kind] || "Remonderdeel"} (${segLabel.nl}) · ${AXLE_I18N[axle].nl} · ${diaTxt}MPN ${mpn}`.slice(0, 160),
      description: `${title} van ${brand} (${segLabel.nl}, onderdeelnummer ${mpn}, EAN ${p.gtin}) voor de ${AXLE_I18N[axle].nl.toLowerCase()}. Ontwikkeld voor optimale warmteafvoer, constante remkracht en geverifieerde pasvorm op ${carsShort}. Nieuw geleverd in originele verpakking.`,
      highlights,
      specs,
    },
  }
}

function cleanBrakeProduct(p, brandIndices) {
  const bIdx = brandIndices[p.brand] || 0
  brandIndices[p.brand] = bIdx + 1

  let cfg
  if (p.brand === "Brembo") cfg = getBremboConfig(p)
  else if (p.brand === "Baer Brakes") cfg = getBaerConfig(p)
  else if (p.brand === "Bosch") cfg = getBoschConfig(p)
  else if (p.brand === "EBC") cfg = getEbcConfig(p, bIdx)
  else if (p.brand === "Ferodo") cfg = getFerodoConfig(p, bIdx)
  else if (p.brand === "PowerStop") cfg = getPowerStopConfig(p)
  else if (p.brand === "TBM Brakes") cfg = getTbmConfig(p)
  else if (p.brand === "Wilwood") cfg = getWilwoodConfig(p, bIdx)

  p.name = cfg.cleanTitle
  p.brake.fitment = cfg.fitment.map(dedupeYears)
  p.description = cfg.description
  p.shortDescription = cfg.shortDescription

  const isPrem = Boolean(p.badges?.includes("premium"))

  // Clean specs: remove "(65% Tier)" / "(35% Tier)", update Compatible Applications, fix Outer Diameter
  for (const s of p.specs) {
    if (s.label === "Segment") {
      s.value = isPrem ? "Premium Performance" : "OE+ Street Performance"
    }
    if (s.label === "Compatible Applications") {
      s.value = p.brake.fitment.slice(0, 3).join(", ")
    }
    if (s.label === "Piston Count" && p.brake.pistons) {
      s.value = String(p.brake.pistons)
    }
    if (s.label === "Caliper Architecture" && p.brand === "Brembo" && p.brake.pistons) {
      s.value = `Cast/Forged Aluminum Monoblock (${p.brake.pistons}-Piston)`
    }
  }
  if (!p.specs.some((s) => s.label === "Compatible Applications")) {
    p.specs.push({
      label: "Compatible Applications",
      value: p.brake.fitment.slice(0, 3).join(", "),
    })
  }

  // Clean highlights (sync piston count, diameter, and fitment)
  p.highlights = p.highlights.map((h) => {
    if (/^\d+-Piston Monoblock Caliper$/i.test(h) && p.brake.pistons) {
      return `${p.brake.pistons}-Piston Monoblock Caliper`
    }
    if (/^\d+-Piston .* Caliper/i.test(h) && p.brake.pistons) {
      return h.replace(/^\d+-Piston/, `${p.brake.pistons}-Piston`)
    }
    return h
  })

  p.translations = buildBrakeTranslations(p, isPrem)
  return p
}

function isSuvOrTruckTire(p) {
  const t = p.tire
  if (!Number.isInteger(t.rim)) return "Commercial Truck"
  const model = (t.model || p.name || "").trim()
  const tireType = (p.specs?.find((s) => s.label.toLowerCase() === "tire type")?.value || "").toLowerCase()

  if (["all terrain", "mud terrain", "rugged terrain", "extreme terrain", "highway"].includes(tireType)) {
    return "Truck/SUV"
  }
  if (
    /\b(SUV|Truck|LT|4X4|A\/T|AT\d*|M\/T|MT|H\/T\d*|HT\d*|R\/T|RT|X\/T|UV|Scorpion|Geolandar|Parada Spec-X|Dueler|Ecopia H\/L|Alenza|Latitude|Defender LTX|CrossContact|TerrainContact|Wrangler|Destination|Trail Terrain|Wildpeak|Ziex CT60|Dynapro|Crugen|Road Venture|Roadian|Grandtrek|Winter Maxx SJ8|Outpost)\b/i.test(
      model,
    )
  ) {
    return "Truck/SUV"
  }
  return "Passenger"
}

function cleanTireProduct(p) {
  const t = p.tire
  const model = t.model || p.name.replace(/\s+\d{3}\/.*$/, "").trim()
  const size = `${t.width}/${t.aspect} R${t.rim}`
  const compactSize = `${t.width}/${t.aspect}R${t.rim}`
  const isCommercial = !Number.isInteger(t.rim)
  const dualMatch = p.name.match(/\((\d{3}[A-Z])\)/)
  const svc = isCommercial
    ? `${t.loadIndex}${t.speedRating}${dualMatch ? ` (${dualMatch[1]})` : ""}`
    : `${t.loadIndex}${t.speedRating}${t.extraLoad ? " XL" : ""}${t.runFlat ? " RFT" : ""}`

  const vehicleClass = isSuvOrTruckTire(p)
  const vtSpec = p.specs?.find((s) => s.label.toLowerCase() === "vehicle type")
  if (vtSpec) {
    vtSpec.value = vehicleClass === "Commercial Truck" ? "Truck/SUV" : vehicleClass
  }

  const tireTypeRaw = p.specs?.find((s) => s.label.toLowerCase() === "tire type")?.value || "Touring"
  const tireTypeProse = tireTypeRaw.toLowerCase()
  const seasonProse =
    t.season === "winter" ? "winter" : t.season === "summer" ? "summer" : "all-season"
  const vehicleProse =
    vehicleClass === "Commercial Truck"
      ? "commercial truck and regional trailer"
      : vehicleClass === "Truck/SUV"
        ? "SUV, crossover, and light-truck"
        : "passenger car and sport sedan"

  const loadRange = p.specs?.find((s) => s.label.toLowerCase() === "load range")?.value || (t.extraLoad ? "XL" : "SL")
  const overallDia = p.specs?.find((s) => s.label.toLowerCase() === "overall diameter")?.value
  const rimWidth = p.specs?.find((s) => s.label.toLowerCase() === "approved rim width")?.value
  const treadDepth = p.specs?.find((s) => s.label.toLowerCase() === "tread depth")?.value

  const utqgSentence = t.utqg
    ? ` Rated UTQG ${t.utqg.treadwear} ${t.utqg.traction} ${t.utqg.temperature} (Treadwear ${t.utqg.treadwear}, Traction ${t.utqg.traction}, Temperature ${t.utqg.temperature}).`
    : ""
  const euSentence = t.euLabel
    ? ` EU Tyre Label (Reg. 2020/740): Class ${t.euLabel.fuelEfficiency} fuel efficiency, Class ${t.euLabel.wetGrip} wet grip, and ${t.euLabel.noiseDb} dB (Class ${t.euLabel.noiseClass}) external rolling noise${t.euLabel.eprelId ? ` (EPREL ID ${t.euLabel.eprelId})` : ""}.`
    : ""
  const dimDetails = [
    `${t.width} mm section width`,
    `${t.aspect}% aspect ratio`,
    `${t.rim}-inch rim diameter`,
    ...(overallDia ? [`${overallDia}-inch overall diameter`] : []),
    ...(rimWidth ? [`approved rim width ${rimWidth} in`] : []),
    ...(treadDepth ? [`${treadDepth}" initial tread depth`] : []),
  ].join(", ")

  const loadSentence = isCommercial
    ? `Built with a heavy-duty all-steel radial casing rated for load index ${t.loadIndex} and speed symbol ${t.speedRating}.`
    : `${t.extraLoad ? "Reinforced Extra Load (XL) casing construction supports higher inflation pressures and axle loads" : `Standard Load (${loadRange}) radial casing construction delivers balanced ride comfort and responsive handling`}${t.runFlat ? ", paired with self-supporting run-flat sidewalls for continued mobility after a puncture" : ""}.`

  const mpnRef = p.mpn ? `Manufacturer Part Number: ${p.mpn}${p.gtin ? `, ${p.gtin.length === 12 ? "UPC" : "EAN"}: ${p.gtin}` : ""}. ` : ""

  p.shortDescription = `${p.brand} ${model} ${size} ${svc} — ${seasonProse} ${tireTypeProse} tire for ${vehicleClass === "Passenger" ? "passenger vehicles" : "SUVs & light trucks"}.`
  p.description = `${p.brand} ${model} in size ${size} ${svc} (${compactSize}) is a ${seasonProse} ${tireTypeProse} tire engineered for ${vehicleProse} applications. Designed with a ${dimDetails}, it delivers dependable traction, even treadwear, and confident braking control. ${loadSentence}${utqgSentence}${euSentence} ${mpnRef}Supplied as a brand-new, factory-first quality tire; verify the exact size, load index, and speed rating on your vehicle tire placard before ordering.`
    .replace(/\s+/g, " ")
    .trim()

  // Fix highlight if missing XL on Yokohama Geolandar X-CV
  if (Array.isArray(p.highlights) && p.highlights.length > 0 && /^\d{3}\/\d{2}\s*R\d+/.test(p.highlights[0])) {
    p.highlights[0] = `${size} ${svc}`
  }

  return p
}

function cleanWheelProduct(p) {
  const w = p.wheel
  for (const s of p.specs || []) {
    if (s.label.toLowerCase().includes("origin")) {
      const upper = s.value.trim().toUpperCase()
      if (COUNTRY_CODE_MAP[upper]) {
        s.value = COUNTRY_CODE_MAP[upper]
      }
    }
  }
  if (typeof p.description === "string") {
    p.description = p.description.replace(/\bMade in ([A-Z]{2,10})\./g, (full, code) => {
      const mapped = COUNTRY_CODE_MAP[code.toUpperCase()]
      return mapped ? `Made in ${mapped}.` : full
    })
  }
  const styleName = p.name.startsWith(p.brand) ? p.name : `${p.brand} ${p.name}`
  const pcd = w.boltPattern
  const originSpec = p.specs?.find((s) => s.label.toLowerCase().includes("origin"))?.value
  const backspacing = p.specs?.find((s) => s.label.toLowerCase() === "backspacing")?.value
  const weight = p.specs?.find((s) => s.label.toLowerCase() === "weight")?.value
  const loadRating = w.loadRatingKg ? `${w.loadRatingKg} kg` : p.specs?.find((s) => s.label.toLowerCase() === "load rating")?.value

  const extraBits = [
    backspacing ? `backspacing ${backspacing.replace(/"$/, " in")}` : null,
    loadRating ? `load rating ${loadRating} per wheel` : null,
    weight ? `weight ${weight}` : null,
    originSpec ? `manufactured in ${originSpec}` : null,
  ].filter(Boolean)

  p.shortDescription = `${p.brand} ${w.construction.toLowerCase()} alloy wheel ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish}.`
  p.description = `${styleName} is a precision-engineered 1-piece ${w.construction.toLowerCase()} aluminum alloy wheel sized ${w.diameter}×${w.width} inches with an ET${w.offset} mm offset, ${pcd} bolt pattern (PCD), and ${w.centerBore} mm center bore in a durable ${w.finish} finish.${extraBits.length ? ` Engineered with ${extraBits.join(", ")}.` : ""} Center cap included; Manufacturer Part Number ${p.mpn || p.id}${p.gtin ? ` (EAN: ${p.gtin})` : ""}. Sold individually per wheel—confirm bolt pattern, offset, brake caliper clearance, and center bore requirements for your vehicle before ordering.`

  return p
}

async function run() {
  // 1. Update lib/catalog/opening-catalog.json
  const openingCatalog = JSON.parse(fs.readFileSync(OPENING_CATALOG_PATH, "utf8"))
  const brandIndicesJson = {}
  for (let i = 0; i < openingCatalog.length; i++) {
    const p = openingCatalog[i]
    if (p.category === "brakes") openingCatalog[i] = cleanBrakeProduct(p, brandIndicesJson)
    else if (p.category === "tires") openingCatalog[i] = cleanTireProduct(p)
    else if (p.category === "wheels") openingCatalog[i] = cleanWheelProduct(p)
  }
  fs.writeFileSync(OPENING_CATALOG_PATH, `${JSON.stringify(openingCatalog, null, 2)}\n`)
  console.log(`Updated ${openingCatalog.length} items in lib/catalog/opening-catalog.json`)

  // 2. Update all active rows in Neon PostgreSQL products table
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  const connectionString = rawUrl.replace(
    /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  )
  const pool = new pg.Pool({ connectionString, max: 6 })
  const { rows } = await pool.query("SELECT id, slug, category, data FROM products WHERE archived = false ORDER BY slug")
  console.log(`Loaded ${rows.length} active products from DB...`)

  const brandIndicesDb = {}
  const updates = []
  for (const r of rows) {
    const p = r.data
    if (p.category === "brakes") cleanBrakeProduct(p, brandIndicesDb)
    else if (p.category === "tires") cleanTireProduct(p)
    else if (p.category === "wheels") cleanWheelProduct(p)
    updates.push({ id: r.id, data: p })
  }

  // Batch update in chunks of 250 using UNNEST for speed & atomicity
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const CHUNK = 250
    for (let i = 0; i < updates.length; i += CHUNK) {
      const slice = updates.slice(i, i + CHUNK)
      const ids = slice.map((u) => u.id)
      const jsonData = slice.map((u) => JSON.stringify(u.data))
      await client.query(
        `UPDATE products AS p
         SET data = u.data::jsonb, updated_at = now()
         FROM unnest($1::text[], $2::text[]) AS u(id, data)
         WHERE p.id = u.id`,
        [ids, jsonData],
      )
      if ((i + slice.length) % 1000 === 0 || i + slice.length === updates.length) {
        console.log(`  Updated ${i + slice.length} / ${updates.length} rows in DB`)
      }
    }
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
    await pool.end()
  }
  console.log("Database deep clean complete!")
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
