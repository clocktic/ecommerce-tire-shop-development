import { offerFor, type Product } from "@/lib/catalog"
import { COMPANY } from "@/lib/company"
import { MARKETS } from "@/lib/markets"
import { storePath, type Store } from "@/lib/i18n/config"
import { POLICIES } from "@/lib/policies"
import { absoluteUrl } from "@/lib/seo"

const AVAILABILITY = {
  in_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
  preorder: "https://schema.org/PreOrder",
} as const

// Schema.org rejects a 12-digit UPC in gtin13. Pick the property that matches the length.
function gtinProperty(gtin?: string) {
  if (!gtin) return {}
  if (gtin.length === 8) return { gtin8: gtin }
  if (gtin.length === 12) return { gtin12: gtin }
  if (gtin.length === 13) return { gtin13: gtin }
  if (gtin.length === 14) return { gtin14: gtin }
  return {}
}

// Shipping and return terms in the markup come from lib/policies.ts, the same
// source as the policy pages and the Google feed, so the three never disagree.
export function productJsonLd(product: Product, store: Store) {
  const { market } = store
  const offer = offerFor(product, market)
  if (!offer) return null
  const { currency, shipsTo } = MARKETS[market]
  const { shipping, returns } = POLICIES[market]
  const countries = shipsTo.map((c) => c.code)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => absoluteUrl(src)),
    sku: product.id,
    ...(product.mpn ? { mpn: product.mpn } : {}),
    ...gtinProperty(product.gtin),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(storePath(store, `/product/${product.slug}`)),
      price: (offer.priceCents / 100).toFixed(2),
      priceCurrency: currency,
      availability: AVAILABILITY[offer.availability],
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: COMPANY.tradingName },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: (shipping.rateCents / 100).toFixed(2), currency },
        shippingDestination: countries.map((code) => ({ "@type": "DefinedRegion", addressCountry: code })),
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: shipping.handlingDays[0], maxValue: shipping.handlingDays[1], unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: shipping.transitDays[0], maxValue: shipping.transitDays[1], unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: countries,
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: returns.windowDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees:
          returns.returnShippingPaidBy === "merchant"
            ? "https://schema.org/FreeReturn"
            : "https://schema.org/ReturnShippingFees",
        merchantReturnLink: absoluteUrl(storePath(store, "/policies/returns")),
      },
    },
  }
}
