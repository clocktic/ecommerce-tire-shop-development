"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, ChevronDown, ArrowUpRight } from "lucide-react"
import { useGarage } from "@/components/garage/garage-provider"
import { getVehicleMakeIconUrl } from "@/lib/brand-icons"
import { findVehicleById, groupBrakeFitment, matchesBrakeFitmentEntry } from "@/lib/catalog/vehicles"
import { storePath, type ContentLang, type Store } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Copy = {
  title: string
  makes: string
  models: string
  matchesYourCar: string
  browseBrakes: string
  expand: string
  collapse: string
}

const COPY: Record<ContentLang, Copy> = {
  en: {
    title: "Compatible Vehicles",
    makes: "makes",
    models: "models",
    matchesYourCar: "Fits your vehicle",
    browseBrakes: "All brakes for this model",
    expand: "Show all",
    collapse: "Hide",
  },
  de: {
    title: "Passende Fahrzeuge",
    makes: "Marken",
    models: "Modelle",
    matchesYourCar: "Passt zu Ihrem Fahrzeug",
    browseBrakes: "Alle Bremsen für dieses Modell",
    expand: "Alle anzeigen",
    collapse: "Ausblenden",
  },
  fr: {
    title: "Véhicules compatibles",
    makes: "marques",
    models: "modèles",
    matchesYourCar: "Compatible avec votre véhicule",
    browseBrakes: "Tous les freins pour ce modèle",
    expand: "Tout afficher",
    collapse: "Masquer",
  },
  it: {
    title: "Veicoli compatibili",
    makes: "marche",
    models: "modelli",
    matchesYourCar: "Compatibile con il tuo veicolo",
    browseBrakes: "Tutti i freni per questo modello",
    expand: "Mostra tutto",
    collapse: "Nascondi",
  },
  es: {
    title: "Vehículos compatibles",
    makes: "marcas",
    models: "modelos",
    matchesYourCar: "Compatible con tu vehículo",
    browseBrakes: "Todos los frenos para este modelo",
    expand: "Mostrar todo",
    collapse: "Ocultar",
  },
  "es-419": {
    title: "Vehículos compatibles",
    makes: "marcas",
    models: "modelos",
    matchesYourCar: "Compatible con tu vehículo",
    browseBrakes: "Todos los frenos para este modelo",
    expand: "Mostrar todo",
    collapse: "Ocultar",
  },
  nl: {
    title: "Compatibele voertuigen",
    makes: "merken",
    models: "modellen",
    matchesYourCar: "Past op uw voertuig",
    browseBrakes: "Alle remmen voor dit model",
    expand: "Alles tonen",
    collapse: "Verbergen",
  },
}

export function BrakeFitmentList({ fitment, store }: { fitment: string[]; store: Store }) {
  const [open, setOpen] = useState(false)
  const { active } = useGarage()
  const activeVehicle = findVehicleById(active?.vehicleId)

  if (!fitment || fitment.length === 0) return null

  const groups = groupBrakeFitment(fitment, store.market)
  const copy = COPY[store.lang] ?? COPY.en
  const matchesActive = Boolean(activeVehicle && fitment.some((entry) => matchesBrakeFitmentEntry(entry, activeVehicle)))

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-chip">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
              {copy.title}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {groups.length} {copy.makes} · {fitment.length} {copy.models}
            </span>
            {matchesActive && (
              <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                {copy.matchesYourCar}
              </span>
            )}
          </div>
          {!open && (
            <div className="flex flex-wrap gap-1.5">
              {groups.map((group) => (
                <span
                  key={group.make}
                  className="rounded border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {group.make} ({group.entries.length})
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <span className="hidden sm:inline">{open ? copy.collapse : copy.expand}</span>
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div className="divide-y divide-border border-t border-border bg-muted/15">
          {groups.map((group) => {
            const iconUrl = getVehicleMakeIconUrl(group.make.split("/")[0].trim())
            return (
              <div key={group.make} className="px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  {iconUrl && (
                    <img
                      src={iconUrl}
                      alt=""
                      width={16}
                      height={16}
                      loading="lazy"
                      className="size-4 object-contain dark:invert"
                    />
                  )}
                  <span className="text-xs font-semibold text-foreground">{group.make}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">({group.entries.length})</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {group.entries.map((entry) => {
                    const isMatch = Boolean(activeVehicle && matchesBrakeFitmentEntry(entry.raw, activeVehicle))
                    const href = entry.vehicleId
                      ? `${storePath(store, "/brakes")}?vehicle=${encodeURIComponent(entry.vehicleId)}`
                      : null

                    return (
                      <li
                        key={entry.raw}
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                          isMatch
                            ? "border-primary/60 bg-primary/10 text-foreground"
                            : "border-border bg-card text-foreground",
                        )}
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                          {isMatch && <CheckCircle2 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />}
                          <span className="font-medium">{entry.model}</span>
                          {entry.years && (
                            <span className="font-mono text-[11px] text-muted-foreground">{entry.years}</span>
                          )}
                        </div>
                        {href && (
                          <Link
                            href={href}
                            className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
                            title={copy.browseBrakes}
                          >
                            {copy.browseBrakes}
                            <ArrowUpRight className="size-3" aria-hidden="true" />
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
