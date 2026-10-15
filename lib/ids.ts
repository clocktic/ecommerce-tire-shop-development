import { randomBytes } from "crypto"

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomBytes(5).toString("hex")}`
}

// Customer-facing order number: CP-<market>-<6 base32 chars>, no ambiguous 0/O/1/I.
export function newOrderNumber(market: string): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
  const bytes = randomBytes(6)
  let code = ""
  for (const b of bytes) code += alphabet[b % alphabet.length]
  return `CP-${market.toUpperCase()}-${code}`
}
