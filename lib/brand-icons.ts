// Brand, payment, and logistics SVG icon helper powered by theSVG (https://thesvg.org) via jsDelivr CDN,
// plus 24x24 monochrome SVG emblems for vehicle makes and all 63 tire, wheel, and brake manufacturers in the catalog.
// Individual brand marks remain trademarks of their respective owners.

const THESVG_CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons"

export function theSvgUrl(slug: string, variant: "default" | "mono" | "light" | "dark" = "default"): string {
  return `${THESVG_CDN}/${slug}/${variant}.svg`
}

function svgDataUri(innerPaths: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">${innerPaths}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Crisp geometric motorsport badge with 1-3 monogram characters inside an octagonal/shield frame
function monogramEmblem(code: string, shape: "hex" | "ring" | "slanted" | "rotor" | "spoke" = "slanted"): string {
  const clean = code.toUpperCase().slice(0, 3)
  const fontSize = clean.length === 1 ? "11.5" : clean.length === 2 ? "9.2" : "7.2"
  const textEl = `<text x="12" y="15.3" text-anchor="middle" font-family="Arial Black, Impact, system-ui, sans-serif" font-weight="900" font-style="italic" font-size="${fontSize}" letter-spacing="-0.3" fill="#000000">${clean}</text>`

  if (shape === "ring") {
    return svgDataUri(
      `<path d="M12 1.2a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6zm0 2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 0 1 0-17.6z"/>` +
        `<path d="M12 4.4a7.6 7.6 0 0 1 6.2 3.2h-2.1a5.8 5.8 0 0 0-8.2 0H5.8A7.6 7.6 0 0 1 12 4.4zm0 15.2a7.6 7.6 0 0 1-6.2-3.2h2.1a5.8 5.8 0 0 0 8.2 0h2.1a7.6 7.6 0 0 1-6.2 3.2z"/>` +
        textEl,
    )
  }
  if (shape === "hex") {
    return svgDataUri(
      `<path d="M12 1.3 21.3 6.6v10.8L12 22.7 2.7 17.4V6.6L12 1.3zm0 2.2L4.6 7.7v8.6l7.4 4.2 7.4-4.2V7.7L12 3.5z"/>` +
        textEl,
    )
  }
  if (shape === "rotor") {
    return svgDataUri(
      `<path d="M12 1.2a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6zm0 2.1a8.7 8.7 0 1 1 0 17.4 8.7 8.7 0 0 1 0-17.4z"/>` +
        `<circle cx="12" cy="4.9" r="0.9"/><circle cx="12" cy="19.1" r="0.9"/><circle cx="4.9" cy="12" r="0.9"/><circle cx="19.1" cy="12" r="0.9"/>` +
        textEl,
    )
  }
  if (shape === "spoke") {
    return svgDataUri(
      `<path d="M12 1.2a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6zm0 1.9a8.9 8.9 0 1 1 0 17.8 8.9 8.9 0 0 1 0-17.8z"/>` +
        `<path d="M4.2 8.2h15.6v7.6H4.2V8.2zm1.6 1.5v4.6h12.4V9.7H5.8z"/>` +
        textEl,
    )
  }
  // slanted motorsport parallelogram crest
  return svgDataUri(
    `<path d="M4.2 4.5h17.3l-2.7 15H1.5l2.7-15zm1.7 2-2 11h13.2l2-11H5.9z"/>` +
      `<path d="M2.2 18.2h3.2l.4-2.2H2.6l-.4 2.2z"/>` +
      textEl,
  )
}

// 34 makes with native 24x24 mono.svg in theSVG
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

// 12 makes that need a clean 24x24 monochrome emblem (either missing in theSVG or only available as wide wordmarks)
const CUSTOM_MONO_MAKES: Record<string, string> = {
  "Mercedes-Benz": svgDataUri(
    `<path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm0 1.6a9.4 9.4 0 0 1 8.58 13.22L13.4 11.4 12 3.1l-1.4 8.3-7.18 4.42A9.4 9.4 0 0 1 12 2.6zm0 11.2 7.75 3.63a9.4 9.4 0 0 1-15.5 0L12 13.8z"/>`,
  ),
  Lexus: svgDataUri(
    `<path d="M12 3.5C5.9 3.5 1 7.3 1 12s4.9 8.5 11 8.5 11-3.8 11-8.5-4.9-8.5-11-8.5zm0 1.8c5.05 0 9.15 3.02 9.15 6.7 0 1.48-.65 2.84-1.76 3.95H9.8c-.45 0-.62-.32-.35-.78l4.15-7.17h-2.35L6.8 14.8c-.65 1.1-.1 2.2 1.25 2.2h9.72c-1.52.95-3.54 1.7-5.77 1.7-5.05 0-9.15-3.02-9.15-6.7S6.95 5.3 12 5.3z"/>`,
  ),
  "Land Rover": svgDataUri(
    `<path d="M12 4.5C5.6 4.5 1 7.8 1 12s4.6 7.5 11 7.5 11-3.3 11-7.5-4.6-7.5-11-7.5zm0 1.7c5.3 0 9.3 2.58 9.3 5.8s-4 5.8-9.3 5.8-9.3-2.58-9.3-5.8 4-5.8 9.3-5.8zm-5.5 3.3v5h3.4v-1.3H8v-3.7H6.5zm5.2 0v5h1.5v-1.8h.9l1.1 1.8h1.7l-1.3-2c.65-.28 1.05-.82 1.05-1.52 0-1.02-.75-1.48-1.95-1.48h-3zm1.5 1.1h1.3c.45 0 .7.2.7.52 0 .33-.25.53-.7.53h-1.3v-1.05z"/>`,
  ),
  "Alfa Romeo": svgDataUri(
    `<path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm0 2a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 1.8a7.2 7.2 0 0 0-6.5 4.1h3.3V5.5A7.2 7.2 0 0 0 5.5 9h3.3V5.5c.9-.45 1.9-.7 3.2-.7zm-1.4.4v5.9H4.9a7.2 7.2 0 0 0 0 1.8h5.7v5.9a7.2 7.2 0 0 0 1.4.2V4.8c-.5 0-.95.1-1.4.4zm2.8.3v13c2.8-.65 5-3.2 5-6.5s-2.2-5.85-5-6.5zm1.5 2.7c1.1.8 1.8 2.1 1.8 3.8s-.7 3-1.8 3.8V8.2z"/>`,
  ),
  Cupra: svgDataUri(
    `<path d="M12 2 3.5 7.5l3.6 6.2L12 10.6l4.9 3.1 3.6-6.2L12 2zm0 2.4 5.8 3.7-2 3.4L12 9.1l-3.8 2.4-2-3.4L12 4.4zM6.4 14.6 12 22l5.6-7.4-2.1-1.3L12 17.9l-3.5-4.6-2.1 1.3z"/>`,
  ),
  Genesis: svgDataUri(
    `<path d="M1 8.5 4.5 15h3.8l1.2 1.8h5L15.7 15h3.8L23 8.5h-5.2l-1.6 1.8H7.8L6.2 8.5H1zm7.6 3h6.8l-.9 2.3H9.5l-.9-2.3zM3.8 10.2h2.1l1.1 1.3H4.6l-.8-1.3zm14.3 0h2.1l-.8 1.3H17l1.1-1.3z"/>`,
  ),
  Jaguar: svgDataUri(
    `<path d="M21.5 8.5c-1.8-.9-4.1-.8-6.3.2l-3.6 1.6-3.9-.6c-1.6-.2-3.2.3-4.5 1.4L1.5 12.6l1.2 1.1 2.2-1.1c1-.5 2.1-.6 3.2-.3l3.6 1.1-2.5 2.2H6.5v1.6h3.4l3.5-2.9 3.8.6 3.8 1.8.8-1.4-2.9-1.9 2.6-2.1.8-.9-.8-1.9z"/>`,
  ),
  Lincoln: svgDataUri(
    `<path d="M12 1.5 9.8 9.8 1.5 12l8.3 2.2L12 22.5l2.2-8.3 8.3-2.2-8.3-2.2L12 1.5zm0 5.3 1.1 4.1 4.1 1.1-4.1 1.1-1.1 4.1-1.1-4.1-4.1-1.1 4.1-1.1 1.1-4.1z"/>`,
  ),
  Rivian: svgDataUri(
    `<path d="M12 2 5 9l4.2 3L5 15l7 7 7-7-4.2-3L19 9l-7-7zm0 3.2L15.8 9 12 11.6 8.2 9 12 5.2zm0 9.2L15.8 17 12 19.8 8.2 17 12 14.4z"/>`,
  ),
  Buick: svgDataUri(
    `<path d="M12 1.5A10.5 10.5 0 1 0 22.5 12 10.5 10.5 0 0 0 12 1.5zm0 1.8a8.7 8.7 0 1 1-8.7 8.7A8.7 8.7 0 0 1 12 3.3zM6.2 9.5v6.8l2.4-1.4V8.1L6.2 9.5zm4.6-2.2v8.2l2.4-1.4V5.9l-2.4 1.4zm4.6-1.4v8.2l2.4-1.4V4.5l-2.4 1.4z"/>`,
  ),
  Dodge: svgDataUri(
    `<path d="M11.2 4.5 4 19.5h3.8l7.2-15h-3.8zm5 0-7.2 15H13l7.2-15h-4z"/>`,
  ),
  GMC: svgDataUri(
    `<path d="M1.5 8.5v7h5.8v-4.2H4.6v1.4h.9v1H3.3V10.3h4V8.5H1.5zm7 0v7h1.7v-4.1l1.4 3h1l1.4-3v4.1h1.7v-7h-2l-1.6 3.4L10.5 8.5h-2zm8.2 0v7h5.8v-1.8h-4V10.3h4V8.5h-5.8z"/>`,
  ),
}

// Product brands available directly in theSVG.org
const THESVG_PRODUCT_BRANDS: Record<string, string> = {
  Bosch: "bosch",
}

// Custom 24x24 monochrome SVG marks for all tire, wheel, and brake manufacturers in the catalog
const PRODUCT_BRAND_ICONS: Record<string, string> = {
  // ================= TIRES (14 brands) =================
  // Michelin — Slanted M + motorsport underline bar
  Michelin: svgDataUri(
    `<path d="M3.2 16.5 5.8 5.2h3.5l1.9 6.6 3.7-6.6h3.5l-2.6 11.3h-2.8l1.6-7.2-3.4 6.1H9.5L7.8 9.3l-1.7 7.2H3.2zm-1.2 2.1h20l-.5 1.8H1.5l.5-1.8z"/>`,
  ),
  // Pirelli — Iconic elongated roof-P mark
  Pirelli: svgDataUri(
    `<path d="M2 4.5h20v2.8H7.2v3.1h11.3c2.1 0 3.5 1.2 3.5 3.2s-1.4 3.3-3.5 3.3H7.2v3.6H3.8V7.3H2V4.5zm5.2 8.1v2.1h10.4c.7 0 1.1-.4 1.1-1.05S18.3 12.6 17.6 12.6H7.2z"/>`,
  ),
  // Bridgestone — Keystone B with upward arrow cutout
  Bridgestone: svgDataUri(
    `<path d="M4.5 3.5h10.8c3.4 0 5.4 1.7 5.4 4.2 0 1.8-1 3.2-2.7 3.8 2.1.5 3.3 2 3.3 4.1 0 3-2.4 4.9-6.2 4.9H2.5L4.5 3.5zm4.1 3.2-.6 3.6h5.5c1.4 0 2.3-.7 2.3-1.8 0-1.1-.8-1.8-2.2-1.8H8.6zm-1.1 6.4-.7 4.2h6.3c1.6 0 2.6-.8 2.6-2.1 0-1.3-1-2.1-2.6-2.1H7.5zM9.2 9.2l3.8-3.8 1.5 1.5-3.8 3.8-1.5-1.5z"/>`,
  ),
  // Continental — Circular double-ring C crest with prancing-wheel core
  Continental: svgDataUri(
    `<path d="M12 1.2a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6zm0 2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 0 1 0-17.6zm3.9 5.5a5.5 5.5 0 1 0 0 6.6l-1.9-1.4a3.2 3.2 0 1 1 0-3.8l1.9-1.4z"/>`,
  ),
  // Goodyear — Winged-foot speed emblem
  Goodyear: svgDataUri(
    `<path d="M22.2 6.2c-3.8 0-7.2 1.4-9.5 3.8L9.5 6.8H3.2l3.2 3.2H2l2.8 2.8h4.5l-4.8 4.8h6.2c3.2 0 5.9-1.5 7.6-4.1l3.9-7.3zm-7.8 5.2c-.9 1.6-2.5 2.6-4.5 2.6H8.4l2.8-2.8h3.2v.2z"/>`,
  ),
  // Dunlop — Iconic Flying-D arrow circle emblem
  Dunlop: svgDataUri(
    `<path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm0 2a8.5 8.5 0 0 1 8.2 6.3L7.2 4.8A8.4 8.4 0 0 1 12 3.5zM4.2 8.6l11.2 3.4-11.2 3.4a8.5 8.5 0 0 1 0-6.8zm3 10.6 13-5a8.5 8.5 0 0 1-13 5z"/>`,
  ),
  // Hankook — Dynamic twin-wing speed slash
  Hankook: svgDataUri(
    `<path d="M2.5 7.2c5.5-2.8 12.2-3.2 19-1.2-4.8 1.5-9.2 4.2-12.8 7.8L2.5 7.2zm4.2 8.2c4.4-3.1 9.6-4.8 14.8-4.9-3.6 2.8-7.4 5.5-11.4 7.7l-3.4-2.8z"/>`,
  ),
  // Yokohama — Iconic 5-chevron Y performance emblem
  Yokohama: svgDataUri(
    `<path d="M2 5h4.2l5.8 6.8L17.8 5H22l-7.8 9.2V19h-4.4v-4.8L2 5zm4.8 0h2.6L12 8.2 14.6 5h2.6L12 11.2 6.8 5z"/>`,
  ),
  // Nokian — Nordic tread-chevron crown mark
  Nokian: svgDataUri(
    `<path d="M12 2 3 8.2v3.6L12 5.6l9 6.2V8.2L12 2zm0 5.8L3 14v3.6l9-6.2 9 6.2V14l-9-6.2zm0 5.8-6.5 4.5v3.4L12 17l6.5 4.5v-3.4L12 13.6z"/>`,
  ),
  // Falken — Slanted twin-stripe F mark
  Falken: svgDataUri(
    `<path d="M4.5 4.5h16.8l-1.2 3.6H9.2l-.8 2.5h9.8l-1.1 3.4H7.3l-1.8 5.5H1.7L4.5 4.5zm12.8 11.2h4l-1.3 3.8h-4l1.3-3.8z"/>`,
  ),
  // Kumho — Winged K emblem
  Kumho: svgDataUri(
    `<path d="M4 4.5h3.8v6.2l6.8-6.2h4.8l-7.6 6.8 8.2 8.2h-4.9l-6-6.2-1.3 1.2v5H4V4.5zm14.5 0h2.5l-3.5 3.2h-2.5L18.5 4.5z"/>`,
  ),
  // Nexen — Dynamic N-chevron arrow mark
  Nexen: svgDataUri(
    `<path d="M3 19.5 6.2 4.5h3.9l4.8 9.2 2-9.2h3.6l-3.2 15h-3.9L8.6 10.3l-2 9.2H3z"/>`,
  ),
  // BFGoodrich — Off-road tread-shield BFG crest
  BFGoodrich: monogramEmblem("BFG", "hex"),
  // Firestone — Classic 5-point F shield crest
  Firestone: svgDataUri(
    `<path d="M4 3.5h16l-1.4 11.2L12 21.5 5.4 14.7 4 3.5zm3.4 3 .9 7.1 3.7 3.8 3.7-3.8.9-7.1H7.4zm2.1 1.6h5.8v2h-3.6v1.2h3v1.8h-3v2.5H9.5V8.1z"/>`,
  ),

  // ================= BRAKES (8 brands) =================
  // Bosch — uses theSVG (bosch/mono.svg) via THESVG_PRODUCT_BRANDS
  // Brembo — Iconic vented-rotor + caliper slash circle emblem
  Brembo: svgDataUri(
    `<path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm0 2.5a8 8 0 0 1 7.4 5h-4.3a4 4 0 0 0-6.2 0H4.6a8 8 0 0 1 7.4-5zm-4 8a4 4 0 0 1 8 0 4 4 0 0 1-8 0zm4 8a8 8 0 0 1-7.4-5h4.3a4 4 0 0 0 6.2 0h4.3a8 8 0 0 1-7.4 5z"/>`,
  ),
  // EBC — Checkered racing brake flag emblem
  EBC: monogramEmblem("EBC", "slanted"),
  // Ferodo — Racing F brake-pad shield
  Ferodo: monogramEmblem("FRD", "hex"),
  // PowerStop — Drilled & slotted rotor lightning emblem
  PowerStop: svgDataUri(
    `<path d="M12 1.2a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6zm0 2.1a8.7 8.7 0 1 1 0 17.4 8.7 8.7 0 0 1 0-17.4zm1.4 2.2-5.6 7.3h3.7l-.9 5.7 5.6-7.3h-3.7l.9-5.7z"/>`,
  ),
  // Wilwood — Multi-piston caliper W emblem
  Wilwood: svgDataUri(
    `<path d="M1.8 6h3.5l2.4 7.8L10.3 6h3.4l2.6 7.8L18.7 6h3.5l-4.2 12h-3.4L12 10.6 9.4 18H6L1.8 6z"/>`,
  ),
  "Baer Brakes": monogramEmblem("BAER", "rotor"),
  "TBM Brakes": monogramEmblem("TBM", "rotor"),

  // ================= WHEELS (41 brands) =================
  // BBS — Iconic cross-spoke mesh wheel + BBS badge
  BBS: monogramEmblem("BBS", "spoke"),
  // OZ Racing — Iconic multi-spoke racing ring + OZ monogram
  "OZ Racing": monogramEmblem("OZ", "ring"),
  "MSW (by OZ)": monogramEmblem("MSW", "ring"),
  // Enkei — 3-blade turbine infinity wheel emblem
  Enkei: svgDataUri(
    `<path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm0 2.2a8.3 8.3 0 0 1 7.1 4L13.5 11V3.7h-1.5zm-1.5 0V11L4.9 7.7a8.3 8.3 0 0 1 5.6-4zm-6.4 5.5 5.6 3.3-5.6 3.3a8.3 8.3 0 0 1 0-6.6zm1.5 8.1 5.6-3.3v6.3a8.3 8.3 0 0 1-5.6-3zm7.9 3v-6.3l5.6 3.3a8.3 8.3 0 0 1-5.6 3zm6.4-4.5-5.6-3.3 5.6-3.3a8.3 8.3 0 0 1 0 6.6z"/>`,
  ),
  // Sparco — S-shield motorsport emblem
  Sparco: svgDataUri(
    `<path d="M12 1.5 3 5.5v6.5c0 5.5 3.8 9.2 9 10.5 5.2-1.3 9-5 9-10.5V5.5l-9-4zm3.8 6.8H9.6c-.6 0-1 .3-1 .8s.4.8 1 .8h4.2c1.9 0 3.2 1.1 3.2 2.8 0 1.8-1.4 3-3.4 3H7.2v-2.2h6.4c.6 0 1-.3 1-.8s-.4-.8-1-.8H9.4c-1.9 0-3.2-1.1-3.2-2.8 0-1.8 1.4-3 3.4-3h6.2v2.2z"/>`,
  ),
  // HRE Forged — Crest shield with crossbars
  "HRE Forged": monogramEmblem("HRE", "hex"),
  // Rotiform — Hexagonal R wheel nut crest
  Rotiform: monogramEmblem("RTF", "hex"),
  // Fifteen52 — 52 tarmac star emblem
  Fifteen52: monogramEmblem("52", "spoke"),
  // American Racing — 5-spoke Torq-Thrust star inside wheel ring
  "American Racing": svgDataUri(
    `<path d="M12 1.2a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6zm0 2.3 2.1 5.6h5.9l-4.8 3.5 1.8 5.7-5-3.5-5 3.5 1.8-5.7-4.8-3.5h5.9L12 3.5z"/>`,
  ),
  Borbet: monogramEmblem("BRB", "ring"),
  Ronal: monogramEmblem("RNL", "ring"),
  Konig: svgDataUri(
    `<path d="M3.5 6.5 7 12l5-6.5L17 12l3.5-5.5-1.8 11.5H5.3L3.5 6.5zm3.6 8.8h9.8l.5-2.8-2.8 1.8L12 10.8l-2.6 3.5-2.8-1.8.5 2.8z"/>`,
  ),
  Method: monogramEmblem("MRW", "hex"),
  Weld: monogramEmblem("WLD", "rotor"),
  TSW: monogramEmblem("TSW", "spoke"),
  "TSW Alloy": monogramEmblem("TSW", "spoke"),
  "3SDM": monogramEmblem("3S", "hex"),
  AEZ: monogramEmblem("AEZ", "ring"),
  ATS: monogramEmblem("ATS", "spoke"),
  Alutec: monogramEmblem("ALU", "ring"),
  Asanti: monogramEmblem("ASN", "hex"),
  Autec: monogramEmblem("AUT", "ring"),
  Beyern: monogramEmblem("BYN", "spoke"),
  "Black Rhino": monogramEmblem("BR", "hex"),
  Calibre: monogramEmblem("CAL", "ring"),
  Dezent: monogramEmblem("DEZ", "ring"),
  Dotz: monogramEmblem("DTZ", "spoke"),
  Dub: monogramEmblem("DUB", "hex"),
  Fondmetal: monogramEmblem("FND", "ring"),
  Forgestar: svgDataUri(
    `<path d="M12 1.5 14.6 9h7.9l-6.4 4.6 2.4 7.5L12 16.5l-6.5 4.6 2.4-7.5L1.5 9h7.9L12 1.5z"/>`,
  ),
  "Fox Racing": monogramEmblem("FOX", "slanted"),
  Helo: monogramEmblem("HLO", "hex"),
  MAK: monogramEmblem("MAK", "slanted"),
  Mandrus: monogramEmblem("MND", "ring"),
  Motegi: monogramEmblem("MTG", "slanted"),
  "Moto Metal": monogramEmblem("MM", "hex"),
  Niche: monogramEmblem("NCH", "spoke"),
  "Pro Comp": monogramEmblem("PC", "rotor"),
  Ultra: monogramEmblem("ULT", "hex"),
  "Victor Equipment": monogramEmblem("VE", "hex"),
  XXR: monogramEmblem("XXR", "slanted"),
}

export function getVehicleMakeIconUrl(make?: string | null): string | null {
  if (!make) return null
  const monoSlug = THESVG_MONO_MAKES[make]
  if (monoSlug) return theSvgUrl(monoSlug, "mono")
  return CUSTOM_MONO_MAKES[make] ?? null
}

export function getProductBrandIconUrl(brand?: string | null): string | null {
  if (!brand) return null
  const trimmed = brand.trim()
  const thesvgSlug = THESVG_PRODUCT_BRANDS[trimmed]
  if (thesvgSlug) return theSvgUrl(thesvgSlug, "mono")
  if (PRODUCT_BRAND_ICONS[trimmed]) return PRODUCT_BRAND_ICONS[trimmed]

  // Case-insensitive match
  const lower = trimmed.toLowerCase()
  for (const [k, slug] of Object.entries(THESVG_PRODUCT_BRANDS)) {
    if (k.toLowerCase() === lower) return theSvgUrl(slug, "mono")
  }
  for (const [k, uri] of Object.entries(PRODUCT_BRAND_ICONS)) {
    if (k.toLowerCase() === lower) return uri
  }

  // Fallback monogram emblem so even newly added Admin brands always render a sharp badge
  const initials = trimmed
    .split(/[\s()-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
  return monogramEmblem(initials.length >= 2 ? initials.slice(0, 3) : trimmed.slice(0, 3), "slanted")
}

export function getBrandIconUrl(brandOrMake?: string | null): string | null {
  if (!brandOrMake) return null
  return getVehicleMakeIconUrl(brandOrMake) ?? getProductBrandIconUrl(brandOrMake)
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

export const FEATURED_CATALOG_BRANDS = {
  tires: [
    { brand: "Michelin", tagline: "Pilot Sport · Primacy · CrossClimate" },
    { brand: "Pirelli", tagline: "P Zero · Cinturato · Scorpion" },
    { brand: "Continental", tagline: "SportContact · PremiumContact · WinterContact" },
    { brand: "Bridgestone", tagline: "Potenza · Turanza · Blizzak" },
    { brand: "Goodyear", tagline: "Eagle F1 · EfficientGrip · UltraGrip" },
    { brand: "Dunlop", tagline: "Sport Maxx · Winter Sport · Grandtrek" },
    { brand: "Hankook", tagline: "Ventus S1 · Kinergy · Winter i*cept" },
    { brand: "Yokohama", tagline: "ADVAN Sport · BluEarth · Geolandar" },
    { brand: "Nokian", tagline: "Hakkapeliitta · Snowproof · Wetproof" },
    { brand: "Falken", tagline: "Azenis FK520 · Eurowinter · Wildpeak" },
    { brand: "Kumho", tagline: "Ecsta PS71 · Solus · WinterCraft" },
    { brand: "BFGoodrich", tagline: "All-Terrain KO2 · g-Force · Trail-Terrain" },
    { brand: "Firestone", tagline: "Firehawk · Roadhawk · Winterhawk" },
    { brand: "Nexen", tagline: "N'Fera Sport · N'Blue · Winguard" },
  ],
  wheels: [
    { brand: "BBS", tagline: "Forged & Flow-Formed Motorsport" },
    { brand: "OZ Racing", tagline: "Ultraleggera · Superturismo · Rally" },
    { brand: "Enkei", tagline: "RPF1 · NT03+M · MAT Technology" },
    { brand: "HRE Forged", tagline: "FlowForm & Monoblok Forged" },
    { brand: "Rotiform", tagline: "Aerodisc · LAS-R · Monoblock" },
    { brand: "Fifteen52", tagline: "Turbomac · Tarmac · Rally Sport" },
    { brand: "Sparco", tagline: "Assetto Gara · Terra · Corsa" },
    { brand: "Borbet", tagline: "OEM German Alloy Engineering" },
    { brand: "Ronal", tagline: "OE-Grade European Cast Wheels" },
    { brand: "Konig", tagline: "Hypergram · Ampliform · Flow Formed" },
    { brand: "Method", tagline: "Bead Grip · Overland & Rally" },
    { brand: "American Racing", tagline: "Torq Thrust · Heritage Muscle" },
  ],
  brakes: [
    { brand: "Brembo", tagline: "GT Big Brake Kits · Two-Piece Rotors" },
    { brand: "Bosch", tagline: "OE QuietCast & High-Carbon Discs" },
    { brand: "EBC", tagline: "Yellowstuff · Redstuff · GD Rotors" },
    { brand: "Ferodo", tagline: "DS2500 · DS Performance Compounds" },
    { brand: "Wilwood", tagline: "Forged Narrow Superlite 6R Kits" },
    { brand: "PowerStop", tagline: "Z23 & Z26 Extreme Street Warrior" },
    { brand: "Baer Brakes", tagline: "6P Pro+ Monoblock Brake Systems" },
    { brand: "TBM Brakes", tagline: "Revolution Billet Drag & Track Kits" },
  ],
} as const
