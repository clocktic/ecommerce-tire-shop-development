"use client"

import { OPEN_CONSENT_EVENT } from "@/components/legal/consent"

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="text-left text-sm text-secondary-foreground/85 hover:text-secondary-foreground"
    >
      {label}
    </button>
  )
}
