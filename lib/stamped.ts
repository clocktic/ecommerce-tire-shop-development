export const STAMPED_PUBLIC_API_KEY =
  process.env.NEXT_PUBLIC_STAMPED_API_KEY || "f03079df-4687-4975-aede-c8d069c21c1b"

export const STAMPED_STORE_HASH =
  process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || "364137"

export const STAMPED_STORE_URL = "tiresshop.net"

/**
 * Stamped.io requires `data-product-id` / `data-id` and `itemsList[].productId`
 * to be a numeric integer, while `data-product-sku` holds the string slug/handle.
 * This helper deterministically maps any product slug/ID to a stable positive integer.
 */
export function stampedProductId(slugOrId: string): string {
  const clean = slugOrId.trim()
  if (/^\d+$/.test(clean)) return clean

  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i)
    h1 ^= ch
    h1 = Math.imul(h1, 0x01000193)
    h2 ^= ch + i
    h2 = Math.imul(h2, 0x85ebca6b)
  }
  const hi = (h1 >>> 0) % 900000 + 100000
  const lo = (h2 >>> 0) % 1000000
  return `${hi}${String(lo).padStart(6, "0")}`
}
