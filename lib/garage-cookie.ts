// Shared between client (reading/writing the cookie) and server (SSR read in
// the layout) — no "server-only" or "use client" pragma on this file.

export const GARAGE_COOKIE = "cp_garage"

export type GarageSelection = {
  kind: "vehicle" | "size"
  label: string
  make?: string
  model?: string
  year?: number
  vehicleId?: string
  width: number
  aspect: number
  rim: number
}

export function encodeGarageCookie(selection: GarageSelection): string {
  return encodeURIComponent(JSON.stringify(selection))
}

export function parseGarageCookie(raw: string | undefined | null): GarageSelection | null {
  if (!raw) return null
  try {
    const value = JSON.parse(decodeURIComponent(raw))
    if (
      value &&
      (value.kind === "vehicle" || value.kind === "size") &&
      typeof value.label === "string" &&
      Number.isFinite(value.width) &&
      Number.isFinite(value.aspect) &&
      Number.isFinite(value.rim)
    ) {
      return value as GarageSelection
    }
    return null
  } catch {
    return null
  }
}
