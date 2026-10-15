"use client"

import { Button } from "@/components/ui/button"
import { OPEN_CONSENT_EVENT } from "@/components/legal/consent"

export function PrivacyChoicesButton() {
  return (
    <div className="border border-border bg-card p-5">
      <Button size="lg" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
        Open privacy settings
      </Button>
    </div>
  )
}
