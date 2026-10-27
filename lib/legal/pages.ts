import type { Market } from "@/lib/markets"
import { storePath, type Store } from "@/lib/i18n/config"

// Each market has its own policy set — US and EU law differ, so the pages are
// written separately rather than one page with regional footnotes. Titles come
// from the translated documents in lib/legal/<market>-<lang>.ts.
export const POLICY_ORDER: Record<Market, string[]> = {
  us: ["shipping", "returns", "warranty", "payments", "terms", "privacy", "privacy-choices"],
  eu: ["shipping", "customs", "returns", "withdrawal-form", "warranty", "payments", "terms", "privacy", "cookies", "legal-notice"],
}

export function policyHref(store: Store, slug: string) {
  return storePath(store, `/policies/${slug}`)
}
