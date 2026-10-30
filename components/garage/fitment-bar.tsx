"use client"

import Link from "next/link"
import { ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { TireSizeIcon, VehicleIcon, WheelRimIcon } from "@/components/garage/fitment-icons"
import { findVehicleById } from "@/lib/catalog/vehicles"
import { storePath } from "@/lib/i18n/config"

export function FitmentBar() {
  const { store, t, x } = useI18n()
  const g = x.garage
  const { active, clearActive } = useGarage()

  const vehicle = active?.vehicleId ? findVehicleById(active.vehicleId) : undefined
  const boltPattern = active?.boltPattern ?? vehicle?.boltPattern

  const tiresHref = active
    ? `${storePath(store, "/tires")}?${new URLSearchParams({
        ...(active.vehicleId ? { vehicle: active.vehicleId } : {}),
        width: String(active.width),
        aspect: String(active.aspect),
        rim: String(active.rim),
      }).toString()}`
    : storePath(store, "/tires")

  const wheelsHref =
    active && boltPattern
      ? `${storePath(store, "/wheels")}?${new URLSearchParams({
          ...(active.vehicleId ? { vehicle: active.vehicleId } : {}),
          diameter: String(active.rim),
          bolt: boltPattern,
        }).toString()}`
      : null

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-1.5 md:px-6">
        {active ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <FitmentModal
                defaultTab={active.kind === "size" ? "size" : "vehicle"}
                trigger={
                  <button
                    type="button"
                    className="group flex min-w-0 items-center gap-2.5 py-1 pr-2 text-left text-sm font-semibold transition-colors hover:text-primary"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
                      {active.kind === "vehicle" ? (
                        <VehicleIcon className="size-5 w-6" />
                      ) : (
                        <TireSizeIcon className="size-5" />
                      )}
                    </span>
                    <span className="truncate">{active.label}</span>
                    <span className="border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {active.width}/{active.aspect}R{active.rim}
                    </span>
                    {boltPattern && (
                      <span className="hidden border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground md:inline">
                        {boltPattern.replace("x", "×")}
                      </span>
                    )}
                    <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </button>
                }
              />
              <button
                type="button"
                onClick={clearActive}
                aria-label={g.remove}
                title={g.remove}
                className="p-1.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <Link
                href={tiresHref}
                className="flex items-center gap-1.5 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <TireSizeIcon className="size-3.5 text-primary" />
                <span>{t.categories.tires.name}</span>
              </Link>
              {wheelsHref && (
                <Link
                  href={wheelsHref}
                  className="flex items-center gap-1.5 font-semibold text-foreground transition-colors hover:text-primary"
                >
                  <WheelRimIcon className="size-3.5 text-primary" />
                  <span>{t.categories.wheels.name}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FitmentModal
              defaultTab="vehicle"
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto gap-2 px-2 py-1 text-xs font-semibold normal-case tracking-normal sm:text-sm"
                >
                  <VehicleIcon className="size-5 w-6 text-primary" />
                  {g.addFitment}
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
