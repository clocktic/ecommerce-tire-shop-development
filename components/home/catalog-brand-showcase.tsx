"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { FEATURED_CATALOG_BRANDS, getBrandIconUrl } from "@/lib/brand-icons"
import { storePath } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type BrandCategory = "tires" | "wheels" | "brakes"

const SHOWCASE_COPY: Record<
  string,
  {
    eyebrow: string
    title: string
    lead: string
    tabs: Record<BrandCategory, string>
    viewAll: Record<BrandCategory, string>
  }
> = {
  en: {
    eyebrow: "Official Manufacturer Directory",
    title: "Shop by Performance Brand",
    lead: "Select any tire, forged wheel, or brake manufacturer to filter our live inventory by brand.",
    tabs: {
      tires: "Tire Brands (14)",
      wheels: "Wheel Brands (41)",
      brakes: "Brake Brands (8)",
    },
    viewAll: {
      tires: "All tire brands",
      wheels: "All 41 wheel brands",
      brakes: "All brake brands",
    },
  },
  de: {
    eyebrow: "Offizielles Herstellerverzeichnis",
    title: "Nach Herstellermarke wählen",
    lead: "Wählen Sie einen Reifen-, Felgen- oder Bremsenhersteller, um das Sortiment direkt nach Marke zu filtern.",
    tabs: {
      tires: "Reifenmarken (14)",
      wheels: "Felgenmarken (41)",
      brakes: "Bremsenmarken (8)",
    },
    viewAll: {
      tires: "Alle Reifenmarken",
      wheels: "Alle 41 Felgenmarken",
      brakes: "Alle Bremsenmarken",
    },
  },
  fr: {
    eyebrow: "Répertoire officiel des manufacturiers",
    title: "Choisir par marque d'équipementier",
    lead: "Sélectionnez un fabricant de pneus, jantes ou freins pour filtrer le catalogue par marque.",
    tabs: {
      tires: "Pneus (14)",
      wheels: "Jantes (41)",
      brakes: "Freins (8)",
    },
    viewAll: {
      tires: "Toutes les marques de pneus",
      wheels: "Les 41 marques de jantes",
      brakes: "Toutes les marques de freins",
    },
  },
  es: {
    eyebrow: "Directorio oficial de fabricantes",
    title: "Comprar por marca de fabricante",
    lead: "Selecciona un fabricante de neumáticos, llantas o frenos para filtrar el catálogo por marca.",
    tabs: {
      tires: "Neumáticos (14)",
      wheels: "Llantas (41)",
      brakes: "Frenos (8)",
    },
    viewAll: {
      tires: "Todas las marcas de neumáticos",
      wheels: "Las 41 marcas de llantas",
      brakes: "Todas las marcas de frenos",
    },
  },
  it: {
    eyebrow: "Catalogo ufficiale produttori",
    title: "Acquista per marchio produttore",
    lead: "Seleziona un produttore di pneumatici, cerchi in lega o impianti frenanti per filtrare il catalogo.",
    tabs: {
      tires: "Pneumatici (14)",
      wheels: "Cerchi (41)",
      brakes: "Freni (8)",
    },
    viewAll: {
      tires: "Tutti i marchi pneumatici",
      wheels: "Tutti i 41 marchi cerchi",
      brakes: "Tutti i marchi freni",
    },
  },
  nl: {
    eyebrow: "Officiële fabrikantenindex",
    title: "Winkelen op fabrikantmerk",
    lead: "Kies een banden-, velgen- of remmenfabrikant om de voorraad direct op merk te filteren.",
    tabs: {
      tires: "Bandenmerken (14)",
      wheels: "Velgenmerken (41)",
      brakes: "Remmerken (8)",
    },
    viewAll: {
      tires: "Alle bandenmerken",
      wheels: "Alle 41 velgenmerken",
      brakes: "Alle remmerken",
    },
  },
}

export function CatalogBrandShowcase() {
  const { store } = useI18n()
  const [category, setCategory] = useState<BrandCategory>("tires")
  const copy = SHOWCASE_COPY[store.lang] ?? SHOWCASE_COPY.en
  const items = FEATURED_CATALOG_BRANDS[category]

  return (
    <section aria-labelledby="catalog-brands-title" className="mx-auto max-w-7xl px-4 pt-12 sm:pt-20 md:px-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-8 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <p className="label-caps text-primary">{copy.eyebrow}</p>
          <h2 id="catalog-brands-title" className="font-expanded text-xl font-extrabold uppercase sm:text-2xl md:text-3xl">
            {copy.title}
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{copy.lead}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["tires", "wheels", "brakes"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={cn(
                "h-9 border px-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_18px_-4px_rgba(0,0,0,0.5)]"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {copy.tabs[cat]}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => {
          const iconUrl = getBrandIconUrl(item.brand)
          return (
            <li key={item.brand}>
              <Link
                href={storePath(store, `/${category}?brand=${encodeURIComponent(item.brand)}`)}
                className="group flex h-full w-full flex-col justify-between gap-2 border border-border bg-card p-2.5 text-left shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground sm:gap-3 sm:p-4"
              >
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="flex size-8 items-center justify-center border border-border bg-muted/50 p-1.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50 sm:size-10 sm:p-2">
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt={item.brand}
                        width={22}
                        height={22}
                        loading="lazy"
                        className="size-4.5 object-contain opacity-90 group-hover:opacity-100 dark:invert sm:size-5.5"
                      />
                    )}
                  </span>
                  <ArrowUpRight
                    className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:size-4"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="truncate font-expanded text-xs font-extrabold uppercase tracking-wide group-hover:text-primary sm:text-sm">
                    {item.brand}
                  </span>
                  <span className="truncate font-mono text-[9px] text-muted-foreground sm:text-[10px]">
                    {item.tagline}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex justify-end">
        <Link
          href={storePath(store, `/${category}`)}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] underline underline-offset-4 hover:text-primary"
        >
          <span>{copy.viewAll[category]}</span>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
