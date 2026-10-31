"use client"

import Link from "next/link"
import { AlertCircle, CheckCircle2, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { TireSizeIcon, VehicleIcon } from "@/components/garage/fitment-icons"
import { useI18n } from "@/components/i18n/i18n-provider"
import { getVehicleMakeIconUrl } from "@/lib/brand-icons"
import { findVehicleById } from "@/lib/catalog/vehicles"
import { storePath } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

type FitmentTarget =
  | {
      category: "tires"
      width: number
      aspect: number
      rim: number
    }
  | {
      category: "wheels"
      diameter: number
      boltPattern: string
      centerBore: number
    }
  | {
      category: "brakes"
      fitment: string[]
    }

const FITMENT_COPY: Record<
  string,
  {
    fits: string
    altSize: string
    doesNotFit: string
    checkTitle: string
    checkHint: string
    shopMatching: string
  }
> = {
  en: {
    fits: "Exact fit for your",
    altSize: "Compatible with another factory size of your",
    doesNotFit: "Different size from your selected",
    checkTitle: "Verify fitment for your vehicle",
    checkHint: "Select your car or tire size to confirm exact compatibility.",
    shopMatching: "View matching sizes",
  },
  de: {
    fits: "Passgenau für Ihr Fahrzeug:",
    altSize: "Kompatibel mit einer anderen Seriengröße Ihres",
    doesNotFit: "Abweichende Größe für Ihr ausgewähltes Fahrzeug:",
    checkTitle: "Kompatibilität für Ihr Fahrzeug prüfen",
    checkHint: "Wählen Sie Ihr Fahrzeug oder Ihre Reifengröße zur sofortigen Prüfung.",
    shopMatching: "Passende Größen ansehen",
  },
  fr: {
    fits: "Compatible avec votre",
    altSize: "Compatible avec une autre monte d'origine de votre",
    doesNotFit: "Dimension différente de votre",
    checkTitle: "Vérifier la compatibilité avec votre véhicule",
    checkHint: "Sélectionnez votre véhicule ou dimension pour confirmer la compatibilité.",
    shopMatching: "Voir les dimensions compatibles",
  },
  es: {
    fits: "Ajuste exacto para tu",
    altSize: "Compatible con otra medida de fábrica de tu",
    doesNotFit: "Medida diferente a la seleccionada para tu",
    checkTitle: "Verificar compatibilidad con tu vehículo",
    checkHint: "Selecciona tu vehículo o medida de neumático para confirmar.",
    shopMatching: "Ver medidas compatibles",
  },
  it: {
    fits: "Compatibilità esatta per",
    altSize: "Compatibile con un'altra misura di serie per",
    doesNotFit: "Misura diversa da quella selezionata per",
    checkTitle: "Verifica compatibilità con il tuo veicolo",
    checkHint: "Seleziona il tuo veicolo o la misura per confermare la compatibilità.",
    shopMatching: "Vedi misure compatibili",
  },
  nl: {
    fits: "Exacte pasvorm voor uw",
    altSize: "Compatibel met een andere fabrieksmaat van uw",
    doesNotFit: "Andere maat dan geselecteerd voor uw",
    checkTitle: "Controleer pasvorm voor uw voertuig",
    checkHint: "Selecteer uw auto of bandenmaat om de compatibiliteit te bevestigen.",
    shopMatching: "Bekijk passende maten",
  },
}

export function ProductFitmentBadge({
  target,
  compact = false,
}: {
  target: FitmentTarget
  compact?: boolean
}) {
  const { active } = useGarage()
  const { store, x } = useI18n()
  const g = x.garage
  const copy = FITMENT_COPY[store.lang] ?? FITMENT_COPY.en

  if (!active) {
    if (compact) return null
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/30 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)]">
            <VehicleIcon className="size-6 w-8 text-primary" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide">{copy.checkTitle}</span>
            <span className="text-xs text-muted-foreground">{copy.checkHint}</span>
          </div>
        </div>
        <FitmentModal
          defaultTab="vehicle"
          trigger={
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="size-3.5 text-primary" aria-hidden="true" />
              {g.addVehicle}
            </Button>
          }
        />
      </div>
    )
  }

  const vehicle = findVehicleById(active.vehicleId)
  const makeIcon = getVehicleMakeIconUrl(active.make ?? vehicle?.make)

  let exactMatch = false
  let altVehicleMatch = false

  if (target.category === "tires") {
    exactMatch =
      target.width === active.width &&
      target.aspect === active.aspect &&
      target.rim === active.rim
    if (!exactMatch && vehicle) {
      altVehicleMatch = vehicle.sizes.some(
        (s) => s.width === target.width && s.aspect === target.aspect && s.rim === target.rim,
      )
    }
  } else if (target.category === "wheels") {
    const bolt = active.boltPattern ?? vehicle?.boltPattern
    const bore = active.centerBore ?? vehicle?.centerBore ?? 0
    const boreOk = !bore || !target.centerBore || target.centerBore + 0.5 >= bore
    exactMatch = Boolean(bolt && target.boltPattern === bolt && target.diameter === active.rim && boreOk)
    if (!exactMatch && vehicle && bolt && target.boltPattern === bolt && boreOk) {
      const rims = vehicle.sizes.map((s) => s.rim)
      const minRim = Math.min(...rims)
      const maxRim = Math.max(...rims) + 1
      altVehicleMatch = target.diameter >= minRim && target.diameter <= maxRim
    }
  } else {
    if (vehicle && target.fitment.length > 0) {
      const makeNeedle = vehicle.make.toLowerCase()
      const modelNeedle = vehicle.model.split("/")[0]!.trim().toLowerCase()
      exactMatch = target.fitment.some((f) => {
        const text = f.toLowerCase()
        return text.includes(makeNeedle) || (modelNeedle.length >= 2 && text.includes(modelNeedle))
      })
    }
  }

  if (compact) {
    if (!exactMatch && !altVehicleMatch) return null
    return (
      <Badge
        variant={exactMatch ? "default" : "secondary"}
        className="h-5 gap-1 rounded-none px-2 font-mono text-[10px] uppercase tracking-wider"
      >
        <CheckCircle2 className="size-3" aria-hidden="true" />
        <span className="truncate">{active.label}</span>
      </Badge>
    )
  }

  const matchingHref =
    target.category === "wheels" && (active.boltPattern ?? vehicle?.boltPattern)
      ? `${storePath(store, "/wheels")}?${new URLSearchParams({
          ...(vehicle ? { vehicle: vehicle.id } : {}),
          diameter: String(active.rim),
          bolt: (active.boltPattern ?? vehicle?.boltPattern)!,
        }).toString()}`
      : `${storePath(store, "/tires")}?${new URLSearchParams({
          ...(vehicle ? { vehicle: vehicle.id } : {}),
          width: String(active.width),
          aspect: String(active.aspect),
          rim: String(active.rim),
        }).toString()}`

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5",
        exactMatch || altVehicleMatch
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/40",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center border shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)]",
            exactMatch || altVehicleMatch
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-muted/60 text-muted-foreground",
          )}
        >
          {makeIcon ? (
            <img
              src={makeIcon}
              alt={active.make ?? ""}
              width={20}
              height={20}
              loading="lazy"
              className="size-5 object-contain dark:invert"
            />
          ) : active.kind === "vehicle" ? (
            <VehicleIcon className="size-6 w-8" />
          ) : (
            <TireSizeIcon className="size-6" />
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
            {exactMatch || altVehicleMatch ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <AlertCircle className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span>
              {exactMatch ? copy.fits : altVehicleMatch ? copy.altSize : copy.doesNotFit}{" "}
              <span className="text-foreground">{active.label}</span>
            </span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {active.width}/{active.aspect} R{active.rim}
            {(active.boltPattern ?? vehicle?.boltPattern)
              ? ` · PCD ${(active.boltPattern ?? vehicle?.boltPattern)!.replace("x", "×")}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!exactMatch && (
          <Link
            href={matchingHref}
            className="border border-primary bg-primary px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase text-primary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-90"
          >
            {copy.shopMatching}
          </Link>
        )}
        <FitmentModal
          defaultTab={active.kind === "size" ? "size" : "vehicle"}
          trigger={
            <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-xs">
              {g.change}
            </Button>
          }
        />
      </div>
    </div>
  )
}
