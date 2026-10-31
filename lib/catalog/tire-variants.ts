import type { Product, TireProduct } from "@/lib/catalog/types"

export function tireModelKey(product: TireProduct): string {
  const name = product.tire.model ?? product.name.split(/\s+(?:LT|P)?\d{3}\s*[/–-]\s*\d{2}/i)[0]
  const withoutBrand = name.toLowerCase().startsWith(`${product.brand.toLowerCase()} `)
    ? name.slice(product.brand.length + 1)
    : name
  return `${product.brand.toLowerCase()}:${withoutBrand.toLowerCase().replace(/[^a-z0-9]/g, "")}`
}

export function tireVariants(product: TireProduct, products: Product[]): TireProduct[] {
  const key = tireModelKey(product)
  return products
    .filter((candidate): candidate is TireProduct => candidate.category === "tires" && tireModelKey(candidate) === key)
    .sort((a, b) => a.tire.rim - b.tire.rim || a.tire.width - b.tire.width || a.tire.aspect - b.tire.aspect || a.tire.loadIndex - b.tire.loadIndex || a.slug.localeCompare(b.slug))
}
