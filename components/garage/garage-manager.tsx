"use client"

import { Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { TireSizeIcon, VehicleIcon } from "@/components/garage/fitment-icons"
import { findVehicleById } from "@/lib/catalog/vehicles"

export function GarageManager() {
  const { x } = useI18n()
  const g = x.garage
  const { saved, selectSaved, removeSaved, pending } = useGarage()

  return (
    <section aria-labelledby="garage-title" className="flex flex-col gap-4 border-b border-border py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="garage-title" className="label-caps">
          {g.yourGarage}
        </h2>
        <FitmentModal
          trigger={
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <VehicleIcon className="size-5 w-6 text-primary" />
              {saved.length > 0 ? g.addAnother : g.addVehicle}
            </Button>
          }
        />
      </div>

      {saved.length === 0 ? (
        <p className="text-muted-foreground">{g.noVehicles}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {saved.map((row) => {
            const vehicle = findVehicleById(row.vehicleId)
            return (
              <li key={row.id} className="flex items-center justify-between gap-3 border border-border bg-card p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
                    {row.kind === "vehicle" ? (
                      <VehicleIcon className="size-7 w-9" />
                    ) : (
                      <TireSizeIcon className="size-7" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{row.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.width}/{row.aspect}R{row.rim}
                      {vehicle?.boltPattern ? ` · PCD ${vehicle.boltPattern.replace("x", "×")}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.isActive ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary">
                      <Check aria-hidden="true" className="size-3.5" />
                      {g.active}
                    </span>
                  ) : (
                    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => selectSaved(row)}>
                      {g.setActive}
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSaved(row.id)}
                    disabled={pending}
                    aria-label={g.remove}
                    title={g.remove}
                    className="p-2 text-muted-foreground hover:text-primary disabled:opacity-50"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
