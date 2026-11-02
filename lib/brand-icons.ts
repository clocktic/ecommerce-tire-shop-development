// Brand, payment, and logistics SVG icon helper powered by theSVG.org (via jsDelivr CDN),
// Simple Icons, and official Wikimedia Commons vector SVGs, plus pure-vector (<path>)
// full-color motorsport logotypes for specialty wheel & brake manufacturers.
// Individual brand marks remain trademarks of their respective owners.

const THESVG_CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons"
const SIMPLE_ICONS_CDN = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons"

export function theSvgUrl(slug: string, variant: "default" | "mono" | "light" | "dark" = "default"): string {
  return `${THESVG_CDN}/${slug}/${variant}.svg`
}

function svgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`
}

// Pure-vector ultra-heavy motorsport block glyph paths (cap height = 24, 0..24 Y, variable advance width)
// Renders identically on Linux, macOS, Windows, iOS, and Android inside <img> tags with zero font dependencies.
const GLYPHS: Record<string, { w: number; d: string }> = {
  A: { w: 20, d: "M0 24 7.5 0h5L20 24h-5.6l-1.3-4.6H6.9L5.6 24H0zm8.2-9h3.6L10 8.2 8.2 15z" },
  B: { w: 19, d: "M0 0h12.2c4.2 0 6.4 2.1 6.4 5.6 0 2.5-1.3 4.4-3.4 5.2 2.5.7 4 2.7 4 5.7 0 4.3-2.8 7.5-7.4 7.5H0V0zm5.4 4.4v5.1h5.5c1.5 0 2.4-.9 2.4-2.5 0-1.7-.9-2.6-2.4-2.6H5.4zm0 9.3v5.9h6c1.7 0 2.7-1.1 2.7-2.9 0-1.9-1-3-2.7-3h-6z" },
  C: { w: 19, d: "M18.8 8.2h-5.5c-.4-2.2-1.7-3.5-3.7-3.5-2.7 0-4.2 2.4-4.2 7.3s1.5 7.3 4.2 7.3c2 0 3.3-1.3 3.7-3.5h5.5C18.2 21.1 14.8 24.4 9.5 24.4 3.4 24.4 0 19.8 0 12S3.4-.4 9.5-.4c5.3 0 8.7 3.3 9.3 8.6z" },
  D: { w: 19, d: "M0 0h10.2C16.2 0 19.4 4.2 19.4 12s-3.2 12-9.2 12H0V0zm5.5 4.8v14.4h4.4c3.1 0 4.6-2.4 4.6-7.2s-1.5-7.2-4.6-7.2H5.5z" },
  E: { w: 17, d: "M0 0h16.6v4.8H5.5v4.6h9.8v4.6H5.5v5.2h11.4V24H0V0z" },
  F: { w: 16, d: "M0 0h16.2v4.8H5.5v5h9.2v4.6H5.5V24H0V0z" },
  G: { w: 20, d: "M19.5 11.2v12.8h-3.8l-.5-2.4c-1.4 1.9-3.5 2.8-6.2 2.8C3.2 24.4 0 19.8 0 12S3.4-.4 9.8-.4c5.4 0 8.9 3.1 9.5 8.1h-5.5c-.4-2.1-1.7-3.3-3.9-3.3-2.9 0-4.4 2.5-4.4 7.6s1.5 7.6 4.5 7.6c2.5 0 4.1-1.5 4.3-4.2h-4.1v-4.2h9.3z" },
  H: { w: 19, d: "M0 0h5.5v9.4h8V0H19v24h-5.5v-9.6h-8V24H0V0z" },
  I: { w: 7, d: "M.8 0h5.5v24H.8V0z" },
  J: { w: 16, d: "M15.5 0v16.2c0 5.3-3 8.2-8 8.2-4.8 0-7.5-2.7-7.5-7.4v-1.6h5.3v1.3c0 1.9.8 2.9 2.3 2.9 1.6 0 2.4-1.1 2.4-3.3V0h5.5z" },
  K: { w: 19, d: "M0 0h5.5v9.8L13.4 0h6.2l-8 9.6L20 24h-6.2l-5.6-10.1-2.7 3.1V24H0V0z" },
  L: { w: 16, d: "M0 0h5.5v19h10.4v5H0V0z" },
  M: { w: 23, d: "M0 0h6.4l5.1 14.8L16.6 0H23v24h-5.1V8.4L13.3 24H9.7L5.1 8.4V24H0V0z" },
  N: { w: 19, d: "M0 0h5.6l8.2 15.2V0H19v24h-5.4L5.2 8.6V24H0V0z" },
  O: { w: 20, d: "M10-.4C16.4-.4 20 4.2 20 12s-3.6 12.4-10 12.4S0 19.8 0 12 3.6-.4 10-.4zm0 4.8c-2.9 0-4.5 2.5-4.5 7.6s1.6 7.6 4.5 7.6 4.5-2.5 4.5-7.6-1.6-7.6-4.5-7.6z" },
  "Ö": { w: 20, d: "M4.5-5h4v3.4h-4V-5zm7 0h4v3.4h-4V-5zM10-.4C16.4-.4 20 4.2 20 12s-3.6 12.4-10 12.4S0 19.8 0 12 3.6-.4 10-.4zm0 4.8c-2.9 0-4.5 2.5-4.5 7.6s1.6 7.6 4.5 7.6 4.5-2.5 4.5-7.6-1.6-7.6-4.5-7.6z" },
  P: { w: 18, d: "M0 0h11.4c4.5 0 7 2.8 7 7.6s-2.5 7.6-7 7.6H5.5V24H0V0zm5.5 4.6v6h5.1c1.6 0 2.5-1 2.5-3s-.9-3-2.5-3H5.5z" },
  Q: { w: 20, d: "M15.8 21.8 19.2 25l-2.8 2.8-3.5-3.4c-.9.2-1.9.3-2.9.3C3.6 24.4 0 19.8 0 12S3.6-.4 10-.4 20 4.2 20 12c0 4.4-1.5 7.8-4.2 9.8zM10 4.4c-2.9 0-4.5 2.5-4.5 7.6s1.6 7.6 4.5 7.6 4.5-2.5 4.5-7.6-1.6-7.6-4.5-7.6z" },
  R: { w: 19, d: "M0 0h11.8c4.4 0 6.8 2.5 6.8 6.8 0 3.1-1.5 5.3-4.1 6.2L19.4 24h-5.9l-4.2-10.2H5.5V24H0V0zm5.5 4.5v5.3h5.3c1.6 0 2.5-.9 2.5-2.6 0-1.8-.9-2.7-2.5-2.7H5.5z" },
  S: { w: 18, d: "M17.8 7.1h-5.3c-.2-1.9-1.4-2.9-3.5-2.9-1.9 0-3.1.8-3.1 2.2 0 1.4 1 2 4.3 2.9 4.8 1.3 7.9 3 7.9 7.6 0 4.8-3.5 7.5-9.2 7.5-5.7 0-9-2.9-9.2-7.8h5.4c.3 2.1 1.6 3.3 4 3.3 2.2 0 3.5-.9 3.5-2.4 0-1.5-1.1-2.2-4.5-3.1-4.6-1.2-7.6-3-7.6-7.3C.5 2.4 3.8-.4 9.1-.4c5.3 0 8.4 2.8 8.7 7.5z" },
  T: { w: 18, d: "M0 0h18v4.8h-6.2V24H6.3V4.8H0V0z" },
  U: { w: 19, d: "M0 0h5.5v15.4c0 2.7 1.3 4.2 4 4.2s4-1.5 4-4.2V0H19v15.2c0 6-3.4 9.2-9.5 9.2S0 21.2 0 15.2V0z" },
  V: { w: 20, d: "M0 0h5.8L10 16.5 14.2 0H20l-7.2 24H7.2L0 0z" },
  W: { w: 26, d: "M0 0h5.3l2.9 15.6L11.1 0h4.2l2.9 15.6L21.1 0h5.1l-5.2 24h-5.1L13.1 9.6 10.3 24H5.2L0 0z" },
  X: { w: 20, d: "M.4 0h6.1l3.6 7.4L13.7 0h5.9l-6.4 11.7L20 24h-6.1l-4-7.9L5.9 24H0l6.8-12.3L.4 0z" },
  Y: { w: 19, d: "M0 0h6l3.6 8.6L13.2 0h5.8l-6.7 14.4V24H6.8v-9.6L0 0z" },
  Z: { w: 18, d: "M.4 0h17.2v4.4L6.7 19.2h11.1V24H0v-4.5L10.9 4.8H.4V0z" },
  "0": { w: 18, d: "M9-.4c5.8 0 9 4.2 9 12.4s-3.2 12.4-9 12.4S0 20.2 0 12 3.2-.4 9-.4zm0 4.6c-2.4 0-3.6 2.5-3.6 7.8s1.2 7.8 3.6 7.8 3.6-2.5 3.6-7.8S11.4 4.2 9 4.2z" },
  "1": { w: 12, d: "M0 4.2C2.8 4.2 4.6 2.7 5.2 0h4.9v24H4.6V8.2H0v-4z" },
  "2": { w: 18, d: "M.2 8.2C.4 2.7 3.6-.4 9.1-.4c5.1 0 8.4 2.9 8.4 7.3 0 3.4-1.8 5.8-5.9 8.9l-4.2 3.2h10.3V24H0v-4.2l8.1-6.5c2.7-2.2 3.9-3.6 3.9-5.7 0-1.9-1.2-3.1-3-3.1-2 0-3.3 1.3-3.4 3.7H.2z" },
  "3": { w: 18, d: "M.3 6.6C.6 2.1 3.7-.4 8.9-.4c4.9 0 8.1 2.5 8.1 6.4 0 2.7-1.4 4.6-3.8 5.4 2.9.8 4.5 2.9 4.5 6 0 4.4-3.5 7-9 7-5.5 0-8.6-2.7-8.9-7.4h5.2c.2 1.9 1.4 3 3.6 3 2.1 0 3.5-1.1 3.5-2.9 0-2-1.3-3-3.9-3H6.7V9.9h1.4c2.3 0 3.5-.9 3.5-2.7 0-1.7-1.1-2.7-2.9-2.7-1.9 0-3 1-3.2 2.7H.3z" },
  "5": { w: 18, d: "M1.2 0h15.4v4.6H5.7l-.5 4.8c1.1-1 2.7-1.6 4.7-1.6 4.6 0 7.7 3.1 7.7 8.1 0 5.3-3.5 8.5-9.1 8.5-5.2 0-8.4-2.7-8.7-7.2H5c.3 1.8 1.5 2.8 3.5 2.8 2.3 0 3.7-1.5 3.7-4.1s-1.4-4-3.6-4c-1.7 0-2.9.7-3.4 1.9L.4 13.2 1.2 0z" },
  "·": { w: 8, d: "M1.5 9h5v6h-5V9z" },
  "-": { w: 11, d: "M1 9.5h9v5H1v-5z" },
  " ": { w: 8, d: "" },
}

function renderVectorWord(str: string, letterSpacing = 2.2): { width: number; paths: string } {
  const upper = str.toUpperCase()
  let x = 0
  let paths = ""
  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i]
    const g = GLYPHS[ch] ?? GLYPHS.X
    if (g.d) {
      paths += `<g transform="translate(${x.toFixed(1)},0)"><path d="${g.d}"/></g>`
    }
    x += g.w + (i < upper.length - 1 ? letterSpacing : 0)
  }
  return { width: x, paths }
}

// High-precision pure-vector horizontal logotype with tight bounding box and zero font dependencies
function wordmarkLogoSvg({
  text,
  accent = "#e11d48",
  primary = "#09090b",
  badge,
  badgeBg = "#e11d48",
  badgeFg = "#ffffff",
  style = "clean",
}: {
  text: string
  subtext?: string
  accent?: string
  primary?: string
  badge?: string
  badgeBg?: string
  badgeFg?: string
  style?: "clean" | "pill" | "stripe" | "slash" | "crest" | "underline"
}): string {
  const { width: rawTextW, paths: textPaths } = renderVectorWord(text, 2.4)

  if (style === "pill") {
    const padX = 22
    const vbW = Math.max(130, Math.round(rawTextW + padX * 2 + 16))
    const tx = Math.round((vbW - rawTextW) / 2 + 4)
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} 44">` +
      `<path d="M10 2h${vbW - 12}l-8 40H2L10 2z" fill="${accent}"/>` +
      `<g transform="translate(${tx},10) skewX(-10)" fill="#ffffff">${textPaths}</g>` +
      `</svg>`
    return svgDataUri(svg)
  }

  let markSvg = ""
  let markW = 0

  if (badge) {
    const { width: bw, paths: bp } = renderVectorWord(badge, 1.8)
    const boxW = Math.max(44, Math.round(bw * 0.72 + 22))
    const bx = Math.round((boxW - bw * 0.72) / 2 + 3)
    markSvg =
      `<path d="M7 3h${boxW - 7}l-6 38H1L7 3z" fill="${badgeBg}"/>` +
      `<g transform="translate(${bx},13) scale(0.72) skewX(-10)" fill="${badgeFg}">${bp}</g>`
    markW = boxW + 10
  } else if (style === "stripe") {
    markSvg =
      `<path d="M9 5h11l-7 34H2l7-34z" fill="${accent}"/>` +
      `<path d="M24 5h6.5l-7 34H17l7-34z" fill="${primary}"/>`
    markW = 38
  } else if (style === "slash") {
    markSvg =
      `<path d="M2 39 18 5h12L14 39H2z" fill="${accent}"/>` +
      `<path d="M18 39 28 18h7L25 39h-7z" fill="${primary}"/>`
    markW = 40
  } else if (style === "crest") {
    markSvg =
      `<path d="M20 3 37 9v14c0 10-7.2 16-17 19C10.2 39 3 33 3 23V9L20 3z" fill="${accent}"/>` +
      `<path d="M20 7.5 32.5 12v10.5c0 7.2-5 11.8-12.5 14-7.5-2.2-12.5-6.8-12.5-14V12L20 7.5z" fill="#ffffff"/>` +
      `<path d="M12 16.5h16v3.5H12v-3.5zm2.5 6h11V26h-11v-3.5z" fill="${accent}"/>`
    markW = 45
  }

  const textX = markW + 6
  const totalW = Math.round(textX + rawTextW + 12)
  const textY = style === "underline" ? 6 : 8

  const underlineSvg =
    style === "underline"
      ? `<path d="M${markW + 2} 35.5h${Math.round(rawTextW + 6)}l-2 5.5H${markW}l2-5.5z" fill="${accent}"/>`
      : `<path d="M${markW + 2} 36.5h${Math.round(rawTextW + 6)}l-1.5 4H${markW + 0.5}l1.5-4z" fill="${accent}"/>`

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} 44">` +
    markSvg +
    `<g transform="translate(${textX},${textY}) skewX(-10)" fill="${primary}">${textPaths}</g>` +
    underlineSvg +
    `</svg>`

  return svgDataUri(svg)
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
  EBC: wordmarkLogoSvg({ text: "EBC", accent: "#dc2626", style: "stripe" }),
  Ferodo: wordmarkLogoSvg({ text: "FERODO", accent: "#dc2626", style: "pill" }),
  Wilwood: wordmarkLogoSvg({ text: "WILWOOD", accent: "#dc2626", style: "underline" }),
  PowerStop: wordmarkLogoSvg({ text: "POWERSTOP", accent: "#dc2626", style: "slash" }),
  "Baer Brakes": wordmarkLogoSvg({ text: "BAER", accent: "#dc2626", style: "crest" }),
  "TBM Brakes": wordmarkLogoSvg({ text: "TBM", badge: "TBM", badgeBg: "#dc2626", accent: "#dc2626" }),

  // -------- WHEELS (41 brands) --------
  BBS: "https://upload.wikimedia.org/wikipedia/commons/8/8f/BBS_logo.svg",
  Borbet: "https://upload.wikimedia.org/wikipedia/commons/0/07/Borbet_%28Unternehmen%29_logo.svg",
  Enkei: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Enkei_company_logo.svg",
  Sparco: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Sparco_logo_with_subtitle.svg",
  Alutec: "https://upload.wikimedia.org/wikipedia/commons/8/80/Alutec_logo.svg",
  "Fox Racing": "https://upload.wikimedia.org/wikipedia/commons/8/85/Fox_Factory_Logo.svg",

  "OZ Racing": wordmarkLogoSvg({ text: "O·Z", accent: "#dc2626", style: "underline" }),
  "MSW (by OZ)": wordmarkLogoSvg({ text: "MSW", accent: "#dc2626", style: "slash" }),
  "HRE Forged": wordmarkLogoSvg({ text: "HRE", accent: "#b91c1c", style: "crest" }),
  Rotiform: wordmarkLogoSvg({ text: "ROTIFORM", badge: "R", badgeBg: "#dc2626", accent: "#dc2626" }),
  Fifteen52: wordmarkLogoSvg({ text: "FIFTEEN52", badge: "52", badgeBg: "#dc2626", accent: "#dc2626" }),
  "American Racing": wordmarkLogoSvg({ text: "AMERICAN", accent: "#dc2626", primary: "#1e3a8a", style: "stripe" }),
  Ronal: wordmarkLogoSvg({ text: "RONAL", accent: "#0284c7", style: "slash" }),
  Konig: wordmarkLogoSvg({ text: "KÖNIG", accent: "#d97706", style: "crest" }),
  Method: wordmarkLogoSvg({ text: "METHOD", accent: "#dc2626", style: "underline" }),
  Weld: wordmarkLogoSvg({ text: "WELD", accent: "#ca8a04", primary: "#09090b", style: "pill" }),
  TSW: wordmarkLogoSvg({ text: "TSW", accent: "#dc2626", style: "slash" }),
  "TSW Alloy": wordmarkLogoSvg({ text: "TSW", accent: "#dc2626", style: "slash" }),
  "3SDM": wordmarkLogoSvg({ text: "3SDM", badge: "3S", badgeBg: "#09090b", accent: "#dc2626" }),
  AEZ: wordmarkLogoSvg({ text: "AEZ", accent: "#dc2626", style: "stripe" }),
  ATS: wordmarkLogoSvg({ text: "ATS", accent: "#dc2626", style: "underline" }),
  Asanti: wordmarkLogoSvg({ text: "ASANTI", accent: "#b45309", style: "crest" }),
  Autec: wordmarkLogoSvg({ text: "AUTEC", accent: "#0284c7", style: "slash" }),
  Beyern: wordmarkLogoSvg({ text: "BEYERN", accent: "#0284c7", style: "stripe" }),
  "Black Rhino": wordmarkLogoSvg({ text: "BLACK RHINO", accent: "#dc2626", style: "underline" }),
  Calibre: wordmarkLogoSvg({ text: "CALIBRE", accent: "#dc2626", style: "slash" }),
  Dezent: wordmarkLogoSvg({ text: "DEZENT", accent: "#dc2626", style: "underline" }),
  Dotz: wordmarkLogoSvg({ text: "DOTZ", accent: "#eab308", primary: "#09090b", style: "stripe" }),
  Dub: wordmarkLogoSvg({ text: "DUB", accent: "#09090b", style: "pill" }),
  Fondmetal: wordmarkLogoSvg({ text: "FONDMETAL", accent: "#dc2626", style: "slash" }),
  Forgestar: wordmarkLogoSvg({ text: "FORGESTAR", badge: "F", badgeBg: "#dc2626", accent: "#dc2626" }),
  Helo: wordmarkLogoSvg({ text: "HELO", accent: "#dc2626", style: "underline" }),
  MAK: wordmarkLogoSvg({ text: "MAK", badge: "M", badgeBg: "#dc2626", accent: "#dc2626" }),
  Mandrus: wordmarkLogoSvg({ text: "MANDRUS", accent: "#3f3f46", style: "underline" }),
  Motegi: wordmarkLogoSvg({ text: "MOTEGI", accent: "#dc2626", style: "stripe" }),
  "Moto Metal": wordmarkLogoSvg({ text: "MOTO METAL", accent: "#dc2626", style: "slash" }),
  Niche: wordmarkLogoSvg({ text: "NICHE", accent: "#dc2626", style: "underline" }),
  "Pro Comp": wordmarkLogoSvg({ text: "PRO COMP", accent: "#dc2626", style: "stripe" }),
  Ultra: wordmarkLogoSvg({ text: "ULTRA", accent: "#0284c7", style: "crest" }),
  "Victor Equipment": wordmarkLogoSvg({ text: "VICTOR", accent: "#dc2626", style: "crest" }),
  XXR: wordmarkLogoSvg({ text: "XXR", accent: "#dc2626", style: "stripe" }),
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

  return wordmarkLogoSvg({
    text: trimmed.toUpperCase().slice(0, 12),
    accent: "#dc2626",
    style: "slash",
  })
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
