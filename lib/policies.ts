import type { Market } from "@/lib/markets"

// Single source for every number a customer, Google Merchant Center or a feed
// can see: shipping cost, handling/transit days, return window, guarantee.
// Product pages, policy pages, checkout, JSON-LD and the Google feeds all read
// from here. Whatever is set here must be entered one-to-one in GMC
// (Shipping & returns settings) for each market. Values are working defaults —
// confirm them with the fulfilment partner before launch.

export type ShippingPolicy = {
  rateCents: number
  freeShipping: boolean
  handlingDays: [number, number]
  transitDays: [number, number]
  cutoff: string
  carriers: string[]
  area: string
  exclusions: string
  duties: string
}

export type ReturnPolicy = {
  windowDays: number
  // Days to issue the refund once the return is received (EU legal max is 14 from withdrawal notice).
  refundDays: number
  returnShippingPaidBy: "customer" | "merchant"
  // Standard per-item return label fee in cents (used in Schema.org MerchantReturnPolicy).
  returnShippingFeeCents: number
  restockingFeePercent: number
  method: string
  // EU Annex I(A): goods that cannot normally be returned by post need a cost estimate.
  bulkyReturnCostEstimate: string
}

export type WarrantyPolicy = {
  summary: string
  months: number | null
}

export type MarketPolicy = {
  shipping: ShippingPolicy
  returns: ReturnPolicy
  warranty: WarrantyPolicy
  paymentMethods: string[]
}

export const POLICIES: Record<Market, MarketPolicy> = {
  us: {
    shipping: {
      rateCents: 0,
      freeShipping: true,
      handlingDays: [1, 2],
      transitDays: [3, 6],
      cutoff: "2:00 PM PT",
      carriers: ["UPS", "FedEx", "USPS"],
      area: "the 48 contiguous United States",
      exclusions: "Alaska, Hawaii, Puerto Rico, US territories, APO/FPO/DPO military addresses and PO Boxes",
      duties: "Ships from our US warehouse network — no import duties or customs fees.",
    },
    returns: {
      windowDays: 30,
      refundDays: 5,
      returnShippingPaidBy: "customer",
      returnShippingFeeCents: 2500,
      restockingFeePercent: 0,
      method: "Prepaid return label emailed after RMA approval, or insured drop-off with your preferred carrier",
      bulkyReturnCostEstimate: "about $25 per tire or wheel and $15 per brake parcel",
    },
    warranty: {
      summary: "Manufacturer warranty applies; terms vary by brand and are linked on each product.",
      months: null,
    },
    paymentMethods: [
      "Visa",
      "Mastercard",
      "American Express",
      "Discover",
      "Apple Pay",
      "Google Pay",
      "Klarna",
      "Afterpay",
      "Amazon Pay",
      "Cash App Pay",
      "ACH Direct Debit",
      "Stripe Link",
    ],
  },
  eu: {
    shipping: {
      rateCents: 0,
      freeShipping: true,
      handlingDays: [1, 2],
      transitDays: [5, 9],
      cutoff: "2:00 PM Pacific Time",
      carriers: ["DHL Express", "UPS", "FedEx"],
      area: "all 27 EU member states",
      exclusions: "Non-EU countries (incl. UK, Switzerland, Norway), PO Boxes / Packstations, and EU outermost or non-VAT territories such as the Canary Islands, Ceuta, Melilla and French overseas territories",
      duties:
        "Ships from the United States (DAP). Prices exclude import duties and import VAT — you pay them to the carrier or customs on delivery. After you receive your order, we refund the import VAT you paid upon receipt of the customs/carrier invoice.",
    },
    returns: {
      windowDays: 14,
      refundDays: 14,
      returnShippingPaidBy: "customer",
      returnShippingFeeCents: 9000,
      restockingFeePercent: 0,
      method: "Withdrawal by email or the model withdrawal form; we issue a return authorisation (RMA) and a prepaid return label on request",
      bulkyReturnCostEstimate:
        "a maximum of approximately €90 per tyre or wheel and €45 per brake parcel for the return shipment to the United States",
    },
    warranty: {
      summary: "Statutory EU legal guarantee of conformity for 2 years from delivery, in addition to any manufacturer warranty.",
      months: 24,
    },
    paymentMethods: [
      "Visa",
      "Mastercard",
      "American Express",
      "Discover",
      "Apple Pay",
      "Google Pay",
      "Klarna",
      "Afterpay",
      "Amazon Pay",
      "Cash App Pay",
      "ACH Direct Debit",
      "Bancontact",
      "SEPA bank transfer",
      "Stripe Link",
    ],
  },
}

export function deliveryDays(market: Market): [number, number] {
  const { handlingDays, transitDays } = POLICIES[market].shipping
  return [handlingDays[0] + transitDays[0], handlingDays[1] + transitDays[1]]
}

export function deliveryLabel(market: Market): string {
  const [min, max] = deliveryDays(market)
  return `${min}–${max} business days`
}
