import type { Market } from "@/lib/markets"

export type PolicyLink = { slug: string; title: string }

// Each market has its own policy set — US and EU law differ, so the pages are
// written separately rather than one page with regional footnotes.
export const POLICY_PAGES: Record<Market, PolicyLink[]> = {
  us: [
    { slug: "shipping", title: "Shipping Policy" },
    { slug: "returns", title: "Return & Refund Policy" },
    { slug: "warranty", title: "Warranty" },
    { slug: "payments", title: "Payment Methods" },
    { slug: "terms", title: "Terms of Service" },
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "privacy-choices", title: "Your Privacy Choices" },
  ],
  eu: [
    { slug: "shipping", title: "Delivery Policy" },
    { slug: "returns", title: "Right of Withdrawal & Returns" },
    { slug: "withdrawal-form", title: "Model Withdrawal Form" },
    { slug: "warranty", title: "Legal Guarantee & Warranty" },
    { slug: "payments", title: "Payment Methods" },
    { slug: "terms", title: "Terms & Conditions" },
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "cookies", title: "Cookie Policy" },
    { slug: "legal-notice", title: "Legal Notice" },
  ],
}

export function policyHref(market: Market, slug: string) {
  return `/${market}/policies/${slug}`
}
