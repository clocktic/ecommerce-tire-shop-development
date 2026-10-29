"use client"

import Link from "next/link"
import { Car, CircleGauge } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { storePath } from "@/lib/i18n/config"

export function FitmentBanner({ currentWidth }: { currentWidth?: string }) {
  const { store, x } = useI18n()
  const g = x.garage
  const { active } = useGarage()

  if (!active || String(active.width) === currentWidth) return null

  const href = `${storePath(store, "/tires")}?${new URLSearchParams({
    width: String(active.width),
    aspect: String(active.aspect),
    rim: String(active.rim),
  }).toString()}`

  return (
    <Link
      href={href}
      className="mb-6 flex items-center gap-3 border border-primary/40 bg-primary/5 px-4 py-3 text-sm transition-colors hover:border-primary"
    >
      {active.kind === "vehicle" ? (
        <Car aria-hidden="true" className="size-4 shrink-0 text-primary" />
      ) : (
        <CircleGauge aria-hidden="true" className="size-4 shrink-0 text-primary" />
      )}
      <span className="min-w-0 flex-1 truncate">
        <span className="font-semibold">{active.label}</span>
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {active.width}/{active.aspect}R{active.rim}
        </span>
      </span>
      <span className="shrink-0 font-semibold text-primary underline underline-offset-4">{g.useThisSize}</span>
    </Link>
  )
}
