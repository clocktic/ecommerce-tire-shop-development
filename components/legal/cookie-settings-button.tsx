"use client"

import { OPEN_CONSENT_EVENT } from "@/components/legal/consent"
import type { Market } from "@/lib/markets"

export function CookieSettingsButton({ market }: { market: Market }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="text-left text-sm text-secondary-foreground/85 hover:text-secondary-foreground"
    >
      {market === "eu" ? "Cookie settings" : "Do Not Sell or Share My Personal Information"}
    </button>
  )
}
