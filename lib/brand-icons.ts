// Brand, payment, and logistics SVG icon helper powered by theSVG (https://thesvg.org) via jsDelivr CDN,
// plus 24x24 monochrome SVG emblems for the 12 vehicle makes that only have wide wordmarks or are absent in theSVG.
// Individual brand marks remain trademarks of their respective owners.

const THESVG_CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons"

export function theSvgUrl(slug: string, variant: "default" | "mono" | "light" | "dark" = "default"): string {
  return `${THESVG_CDN}/${slug}/${variant}.svg`
}

function svgDataUri(innerPaths: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">${innerPaths}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
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

export function getVehicleMakeIconUrl(make?: string | null): string | null {
  if (!make) return null
  const monoSlug = THESVG_MONO_MAKES[make]
  if (monoSlug) return theSvgUrl(monoSlug, "mono")
  return CUSTOM_MONO_MAKES[make] ?? null
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
