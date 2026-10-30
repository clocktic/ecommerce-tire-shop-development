"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { TireSizeIcon, VehicleIcon, WheelRimIcon } from "@/components/garage/fitment-icons"
import { findVehicleById, type FactorySize } from "@/lib/catalog/vehicles"
import type { Category } from "@/lib/catalog/types"
import { storePath } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

export function FitmentBanner({
  category,
  filters,
  matchingCount,
}: {
  category: Category
  filters: Record<string, string | undefined>
  matchingCount: number
}) {
  const { store, t, x } = useI18n()
  const g = x.garage
  const router = useRouter()
  const { active, applySelection } = useGarage()

  const urlVehicle = findVehicleById(filters.vehicle)
  const garageVehicle = findVehicleById(active?.vehicleId)
  const vehicle = urlVehicle ?? garageVehicle
  const boltPattern = vehicle?.boltPattern ?? active?.boltPattern

  const isFilteredByFitment =
    category === "tires"
      ? Boolean(
          filters.vehicle ||
            (active &&
              filters.width === String(active.width) &&
              filters.aspect === String(active.aspect) &&
              filters.rim === String(active.rim)),
        )
      : category === "wheels"
        ? Boolean(
            filters.vehicle ||
              (active &&
                boltPattern &&
                filters.bolt === boltPattern &&
                (!filters.diameter || filters.diameter === String(active.rim))),
          )
        : Boolean(filters.vehicle)

  if (!active && !urlVehicle) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/25 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
            {category === "wheels" ? <VehicleIcon className="size-6 w-8" /> : <TireSizeIcon className="size-6" />}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{g.addFitment}</span>
            <span className="text-xs text-muted-foreground">{g.vehicleTabHint}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FitmentModal
            defaultTab="vehicle"
            trigger={
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <VehicleIcon className="size-5 w-6 text-primary" />
                {g.vehicleTab}
              </Button>
            }
          />
          <FitmentModal
            defaultTab="size"
            trigger={
              <Button type="button" size="sm" className="gap-2">
                <TireSizeIcon className="size-4" />
                {g.sizeTab}
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const label = active?.label ?? (urlVehicle ? `${urlVehicle.yearTo} ${urlVehicle.make} ${urlVehicle.model}` : "")
  const width = Number(filters.width) || active?.width || urlVehicle?.sizes[0]?.width || 225
  const aspect = Number(filters.aspect) || active?.aspect || urlVehicle?.sizes[0]?.aspect || 45
  const rim = Number(filters.rim || filters.diameter) || active?.rim || urlVehicle?.sizes[0]?.rim || 17

  const applyFilterHref =
    category === "wheels" && boltPattern
      ? `${storePath(store, "/wheels")}?${new URLSearchParams({
          ...(vehicle ? { vehicle: vehicle.id } : {}),
          diameter: String(rim),
          bolt: boltPattern,
        }).toString()}`
      : category === "tires"
        ? `${storePath(store, "/tires")}?${new URLSearchParams({
            ...(vehicle ? { vehicle: vehicle.id } : {}),
            width: String(width),
            aspect: String(aspect),
            rim: String(rim),
          }).toString()}`
        : `${storePath(store, `/${category}`)}?${new URLSearchParams(
            vehicle ? { vehicle: vehicle.id } : {},
          ).toString()}`

  const switchPackageSize = (s: FactorySize) => {
    if (!vehicle) return
    applySelection({
      kind: "vehicle",
      label: active?.label ?? `${vehicle.yearTo} ${vehicle.make} ${vehicle.model}`,
      make: vehicle.make,
      model: vehicle.model,
      year: active?.year ?? vehicle.yearTo,
      vehicleId: vehicle.id,
      boltPattern: vehicle.boltPattern,
      centerBore: vehicle.centerBore,
      sizeLabel: s.label,
      width: s.width,
      aspect: s.aspect,
      rim: s.rim,
    })
    if (category === "wheels") {
      router.push(
        `${storePath(store, "/wheels")}?${new URLSearchParams({
          vehicle: vehicle.id,
          diameter: String(s.rim),
          bolt: vehicle.boltPattern,
        }).toString()}`,
      )
    } else {
      router.push(
        `${storePath(store, "/tires")}?${new URLSearchParams({
          vehicle: vehicle.id,
          width: String(s.width),
          aspect: String(s.aspect),
          rim: String(s.rim),
        }).toString()}`,
      )
    }
  }

  return (
    <div
      className={cn(
        "mt-6 flex flex-col gap-3 border px-4 py-3.5 transition-colors",
        isFilteredByFitment ? "border-primary bg-primary/5" : "border-primary/40 bg-muted/30",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
            {vehicle || active?.kind === "vehicle" ? (
              <VehicleIcon className="size-7 w-9" />
            ) : (
              <TireSizeIcon className="size-7" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold">{label}</span>
              {isFilteredByFitment && (
                <span className="inline-flex items-center gap-1 bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-foreground">
                  <Check aria-hidden="true" className="size-3" />
                  {g.active} ({matchingCount})
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {width}/{aspect} R{rim}
              </span>
              {boltPattern && <span>· PCD {boltPattern.replace("x", "×")}</span>}
              {vehicle?.centerBore && <span>· CB {vehicle.centerBore} mm</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isFilteredByFitment ? (
            <Link
              href={applyFilterHref}
              className="inline-flex h-9 items-center gap-1.5 bg-primary px-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              <SlidersHorizontal aria-hidden="true" className="size-3.5" />
              {category === "wheels" ? t.categories.wheels.name : g.useThisSize}
            </Link>
          ) : (
            <>
              {category === "tires" && boltPattern && (
                <Link
                  href={`${storePath(store, "/wheels")}?${new URLSearchParams({
                    ...(vehicle ? { vehicle: vehicle.id } : {}),
                    diameter: String(rim),
                    bolt: boltPattern,
                  }).toString()}`}
                  className="inline-flex h-9 items-center gap-1.5 border border-border bg-background px-3 font-mono text-xs font-semibold hover:border-primary"
                >
                  <WheelRimIcon className="size-3.5 text-primary" />
                  {t.categories.wheels.name} (R{rim} · {boltPattern.replace("x", "×")})
                </Link>
              )}
              {category === "wheels" && (
                <Link
                  href={`${storePath(store, "/tires")}?${new URLSearchParams({
                    ...(vehicle ? { vehicle: vehicle.id } : {}),
                    width: String(width),
                    aspect: String(aspect),
                    rim: String(rim),
                  }).toString()}`}
                  className="inline-flex h-9 items-center gap-1.5 border border-border bg-background px-3 font-mono text-xs font-semibold hover:border-primary"
                >
                  <TireSizeIcon className="size-3.5 text-primary" />
                  {t.categories.tires.name} ({width}/{aspect}R{rim})
                </Link>
              )}
            </>
          )}

          <FitmentModal
            defaultTab={active?.kind === "size" ? "size" : "vehicle"}
            trigger={
              <Button type="button" variant="outline" size="sm" className="h-9">
                {g.change}
              </Button>
            }
          />

          {isFilteredByFitment && (
            <Link
              href={storePath(store, `/${category}`)}
              className="inline-flex h-9 items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              title={t.catalog.clear}
            >
              <X aria-hidden="true" className="size-3.5" />
              {t.catalog.clear}
            </Link>
          )}
        </div>
      </div>

      {/* Factory Trim / Size Switcher Pills when Vehicle has multiple OEM sizes */}
      {vehicle && vehicle.sizes.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5">
          <span className="mr-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.size}:
          </span>
          {vehicle.sizes.map((s) => {
            const isCurrent =
              category === "wheels"
                ? Number(filters.diameter || rim) === s.rim && (active?.width === s.width || !active)
                : width === s.width && aspect === s.aspect && rim === s.rim
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => switchPackageSize(s)}
                className={cn(
                  "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs transition-all",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-background text-foreground hover:border-primary",
                )}
              >
                <span>{s.label}</span>
                <span className={cn("text-[11px]", isCurrent ? "text-primary-foreground/90" : "text-muted-foreground")}>
                  {s.width}/{s.aspect}R{s.rim}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
