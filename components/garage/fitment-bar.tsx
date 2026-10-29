"use client"

import { Car, ChevronDown, CircleGauge, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"

export function FitmentBar() {
  const { x } = useI18n()
  const g = x.garage
  const { active, clearActive } = useGarage()

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 md:px-6">
        {active ? (
          <div className="flex items-center gap-1">
            <FitmentModal
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 py-1 pr-2 text-left text-sm font-semibold hover:text-primary"
                >
                  {active.kind === "vehicle" ? (
                    <Car aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  ) : (
                    <CircleGauge aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  )}
                  <span className="truncate">{active.label}</span>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                    {active.width}/{active.aspect}R{active.rim}
                  </span>
                  <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              }
            />
            <button
              type="button"
              onClick={clearActive}
              aria-label={g.remove}
              title={g.remove}
              className="p-1.5 text-muted-foreground hover:text-primary"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        ) : (
          <FitmentModal
            trigger={
              <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 px-0 py-1 text-sm font-semibold normal-case tracking-normal">
                <Car aria-hidden="true" data-icon="inline-start" className="size-4 text-primary" />
                {g.addFitment}
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
