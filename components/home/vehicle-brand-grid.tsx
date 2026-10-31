"use client"

import { ArrowUpRight } from "lucide-react"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { useGarage } from "@/components/garage/garage-provider"
import { useI18n } from "@/components/i18n/i18n-provider"
import { FEATURED_VEHICLE_BRANDS, getVehicleMakeIconUrl } from "@/lib/brand-icons"
import { cn } from "@/lib/utils"

const BRAND_GRID_COPY: Record<
  string,
  {
    eyebrow: string
    title: string
    lead: string
    cta: string
  }
> = {
  en: {
    eyebrow: "OEM Fitment Garage",
    title: "Shop by Vehicle Brand",
    lead: "Select your marque to filter tires, alloy wheels, and brake kits by factory size, bolt pattern (PCD), and center bore.",
    cta: "All 40+ vehicle makes",
  },
  de: {
    eyebrow: "OEM-Fahrzeuggarage",
    title: "Nach Fahrzeugmarke wählen",
    lead: "Wählen Sie Ihre Marke, um Reifen, Alufelgen und Bremsanlagen nach Seriengröße, Lochkreis (PCD) und Mittenloch zu filtern.",
    cta: "Alle 40+ Fahrzeugmarken",
  },
  fr: {
    eyebrow: "Garage de compatibilité OEM",
    title: "Choisir par marque de véhicule",
    lead: "Sélectionnez votre constructeur pour filtrer pneus, jantes et freins selon les dimensions d'origine et l'entraxe (PCD).",
    cta: "Toutes les 40+ marques",
  },
  es: {
    eyebrow: "Garaje de compatibilidad OEM",
    title: "Comprar por marca de vehículo",
    lead: "Selecciona tu marca para filtrar neumáticos, llantas y frenos según medida de fábrica y anclaje (PCD).",
    cta: "Las más de 40 marcas",
  },
  it: {
    eyebrow: "Garage compatibilità OEM",
    title: "Acquista per marca auto",
    lead: "Seleziona il costruttore per filtrare pneumatici, cerchi e freni in base alle misure di serie e interasse (PCD).",
    cta: "Tutti i 40+ marchi",
  },
  nl: {
    eyebrow: "OEM Fitment Garage",
    title: "Winkelen op automerk",
    lead: "Kies uw automerk om banden, velgen en remmen te filteren op fabrieksmaat, steekmaat (PCD) en naafdiameter.",
    cta: "Alle 40+ automerken",
  },
}

export function VehicleBrandGrid() {
  const { store } = useI18n()
  const { active } = useGarage()
  const copy = BRAND_GRID_COPY[store.lang] ?? BRAND_GRID_COPY.en

  return (
    <section aria-labelledby="vehicle-brands-title" className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <p className="label-caps text-primary">{copy.eyebrow}</p>
          <h2 id="vehicle-brands-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            {copy.title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.lead}</p>
        </div>

        <FitmentModal
          defaultTab="vehicle"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 self-start font-mono text-xs font-semibold uppercase tracking-[0.16em] underline underline-offset-4 hover:text-primary sm:self-auto"
            >
              <span>{copy.cta}</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
          }
        />
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {FEATURED_VEHICLE_BRANDS.map((brand) => {
          const isSelectedMake = active?.make === brand.make
          return (
            <li key={brand.make}>
              <FitmentModal
                defaultTab="vehicle"
                initialMake={brand.make}
                trigger={
                  <button
                    type="button"
                    className={cn(
                      "group flex h-full w-full flex-col justify-between gap-3 border bg-card p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground",
                      isSelectedMake ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex size-10 items-center justify-center border border-border bg-muted/50 p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50">
                        <img
                          src={getVehicleMakeIconUrl(brand.make) ?? ""}
                          alt={brand.make}
                          width={22}
                          height={22}
                          loading="lazy"
                          className="size-5.5 object-contain opacity-90 group-hover:opacity-100 dark:invert"
                        />
                      </span>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-expanded text-sm font-extrabold uppercase tracking-wide group-hover:text-primary">
                        {brand.make}
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {brand.modelsHint}
                      </span>
                    </div>
                  </button>
                }
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
