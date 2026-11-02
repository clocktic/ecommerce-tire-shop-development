import { formatPrice, type Market } from "@/lib/markets"

export const MEMBER_DISCOUNT_PERCENT = 7
export const MEMBER_DISCOUNT_RATE = 0.07

export function computeMemberDiscountCents(subtotalCents: number, isMember: boolean): number {
  if (!isMember || subtotalCents <= 0) return 0
  return Math.round(subtotalCents * MEMBER_DISCOUNT_RATE)
}

export function computePotentialMemberDiscountCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  return Math.round(subtotalCents * MEMBER_DISCOUNT_RATE)
}

export function formatMemberSavings(subtotalCents: number, market: Market, intlLocale: string): string {
  const cents = computePotentialMemberDiscountCents(subtotalCents)
  return formatPrice(cents, market, intlLocale)
}
