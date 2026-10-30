// Brand, payment, and logistics SVG icon helper powered by theSVG (https://thesvg.org) via jsDelivr CDN.
// Individual brand marks remain trademarks of their respective owners.

const THESVG_CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons"

export function theSvgUrl(slug: string, variant: "default" | "mono" | "light" | "dark" = "default"): string {
  return `${THESVG_CDN}/${slug}/${variant}.svg`
}

export const VEHICLE_MAKE_SLUGS: Record<string, { slug: string; hasMono: boolean }> = {
  Audi: { slug: "audi", hasMono: true },
  BMW: { slug: "bmw", hasMono: true },
  Chevrolet: { slug: "chevrolet", hasMono: true },
  Fiat: { slug: "fiat", hasMono: true },
  Ford: { slug: "ford", hasMono: true },
  Honda: { slug: "honda", hasMono: true },
  Hyundai: { slug: "hyundai", hasMono: true },
  Jeep: { slug: "jeep", hasMono: true },
  Kia: { slug: "kia", hasMono: true },
  Lexus: { slug: "lexus", hasMono: false },
  Mazda: { slug: "mazda", hasMono: true },
  "Mercedes-Benz": { slug: "mercedes-benz", hasMono: false },
  Nissan: { slug: "nissan", hasMono: true },
  Peugeot: { slug: "peugeot", hasMono: true },
  Porsche: { slug: "porsche", hasMono: true },
  Renault: { slug: "renault", hasMono: true },
  Skoda: { slug: "skoda", hasMono: true },
  Subaru: { slug: "subaru", hasMono: true },
  Tesla: { slug: "tesla", hasMono: true },
  Toyota: { slug: "toyota", hasMono: true },
  Volkswagen: { slug: "volkswagen", hasMono: true },
  Volvo: { slug: "volvo", hasMono: true },
}

export function getVehicleMakeIconUrl(make?: string | null): string | null {
  if (!make) return null
  const entry = VEHICLE_MAKE_SLUGS[make]
  if (!entry) return null
  return theSvgUrl(entry.slug, "default")
}

export const PAYMENT_BRAND_ICONS = [
  { slug: "visa", name: "Visa" },
  { slug: "mastercard", name: "Mastercard" },
  { slug: "american-express", name: "American Express" },
  { slug: "paypal", name: "PayPal" },
  { slug: "apple", name: "Apple Pay" },
  { slug: "klarna", name: "Klarna" },
  { slug: "stripe", name: "Stripe" },
] as const

export const CARRIER_BRAND_ICONS = [
  { slug: "dhl", name: "DHL" },
  { slug: "fedex", name: "FedEx" },
] as const

export const FEATURED_VEHICLE_BRANDS = [
  { make: "BMW", slug: "bmw", modelsHint: "3 Series · 5 Series · X3 · X5 · M3" },
  { make: "Porsche", slug: "porsche", modelsHint: "911 · Taycan · Cayenne · Macan" },
  { make: "Mercedes-Benz", slug: "mercedes-benz", modelsHint: "C-Class · E-Class · GLC · GLE" },
  { make: "Audi", slug: "audi", modelsHint: "A3 · A4 · A6 · Q5 · e-tron" },
  { make: "Volkswagen", slug: "volkswagen", modelsHint: "Golf · Passat · Tiguan · ID.4" },
  { make: "Tesla", slug: "tesla", modelsHint: "Model 3 · Model Y · Model S" },
  { make: "Toyota", slug: "toyota", modelsHint: "Camry · RAV4 · Corolla · Tacoma" },
  { make: "Ford", slug: "ford", modelsHint: "Mustang · F-150 · Explorer · Focus" },
  { make: "Volvo", slug: "volvo", modelsHint: "XC60 · XC90 · V60 · EX30" },
  { make: "Honda", slug: "honda", modelsHint: "Civic · Accord · CR-V" },
  { make: "Hyundai", slug: "hyundai", modelsHint: "IONIQ 5 · Tucson · Santa Fe" },
  { make: "Subaru", slug: "subaru", modelsHint: "Outback · Forester · WRX" },
] as const
