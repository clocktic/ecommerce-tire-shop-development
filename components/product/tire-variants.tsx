"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { offerFor } from "@/lib/catalog"
import { tireServiceDescription, tireSize, type TireProduct } from "@/lib/catalog/types"
import { storePath, type ContentLang, type Store } from "@/lib/i18n"
import { formatPrice } from "@/lib/markets"
import { cn } from "@/lib/utils"

type Copy = {
  heading: string
  sizesCount: string
  allRims: string
  searchPlaceholder: string
  clearSearch: string
  noMatches: string
  altMpnSingular: string
  altMpnPlural: string
  oeNote: string
}

const COPY: Record<ContentLang, Copy> = {
  en: {
    heading: "Choose size / variant",
    sizesCount: "sizes",
    allRims: "All",
    searchPlaceholder: "Filter by size (e.g. 245/40 R18) or MPN…",
    clearSearch: "Clear filter",
    noMatches: "No sizes match this filter.",
    altMpnSingular: "+1 OE MPN",
    altMpnPlural: "+{n} OE MPNs",
    oeNote: "Same size & load/speed rating — alternate manufacturer OE article numbers:",
  },
  de: {
    heading: "Größe / Ausführung wählen",
    sizesCount: "Größen",
    allRims: "Alle",
    searchPlaceholder: "Nach Größe (z. B. 245/40 R18) oder MPN filtern…",
    clearSearch: "Filter zurücksetzen",
    noMatches: "Keine Größen für diesen Filter gefunden.",
    altMpnSingular: "+1 OE-MPN",
    altMpnPlural: "+{n} OE-MPNs",
    oeNote: "Gleiche Größe & Trag-/Geschwindigkeitsindex — alternative OE-Herstellernummern:",
  },
  fr: {
    heading: "Choisir la dimension / variante",
    sizesCount: "dimensions",
    allRims: "Tous",
    searchPlaceholder: "Filtrer par dimension (ex. 245/40 R18) ou MPN…",
    clearSearch: "Effacer le filtre",
    noMatches: "Aucune dimension ne correspond à ce filtre.",
    altMpnSingular: "+1 MPN OE",
    altMpnPlural: "+{n} MPN OE",
    oeNote: "Même dimension et indice de charge/vitesse — autres références constructeur OE :",
  },
  it: {
    heading: "Scegli misura / variante",
    sizesCount: "misure",
    allRims: "Tutte",
    searchPlaceholder: "Filtra per misura (es. 245/40 R18) o MPN…",
    clearSearch: "Cancella filtro",
    noMatches: "Nessuna misura corrisponde a questo filtro.",
    altMpnSingular: "+1 MPN OE",
    altMpnPlural: "+{n} MPN OE",
    oeNote: "Stessa misura e indice carico/velocità — altri codici articolo OE:",
  },
  es: {
    heading: "Elegir medida / variante",
    sizesCount: "medidas",
    allRims: "Todas",
    searchPlaceholder: "Filtrar por medida (ej. 245/40 R18) o MPN…",
    clearSearch: "Limpiar filtro",
    noMatches: "Ninguna medida coincide con este filtro.",
    altMpnSingular: "+1 MPN OE",
    altMpnPlural: "+{n} MPN OE",
    oeNote: "Misma medida e índice de carga/velocidad — otras referencias OE del fabricante:",
  },
  "es-419": {
    heading: "Elegir medida / variante",
    sizesCount: "medidas",
    allRims: "Todas",
    searchPlaceholder: "Filtrar por medida (ej. 245/40 R18) o MPN…",
    clearSearch: "Limpiar filtro",
    noMatches: "Ninguna medida coincide con este filtro.",
    altMpnSingular: "+1 MPN OE",
    altMpnPlural: "+{n} MPN OE",
    oeNote: "Misma medida e índice de carga/velocidad — otras referencias OE del fabricante:",
  },
  nl: {
    heading: "Kies maat / uitvoering",
    sizesCount: "maten",
    allRims: "Alle",
    searchPlaceholder: "Filter op maat (bijv. 245/40 R18) of MPN…",
    clearSearch: "Filter wissen",
    noMatches: "Geen maten gevonden voor dit filter.",
    altMpnSingular: "+1 OE-MPN",
    altMpnPlural: "+{n} OE-MPN’s",
    oeNote: "Zelfde maat en draag-/snelheidsindex — alternatieve OE-artikelnummers:",
  },
}

type VariantGroup = {
  key: string
  primary: TireProduct
  alternates: TireProduct[]
  rim: number
  priceCents: number | null
  searchText: string
}

function skuLabel(product: TireProduct): string {
  return product.mpn ? `MPN ${product.mpn}` : product.gtin ? `EAN ${product.gtin}` : product.supplierSku ?? product.id
}

export function TireVariants({ products, selected, store }: { products: TireProduct[]; selected: string; store: Store }) {
  const [rimFilter, setRimFilter] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const copy = COPY[store.lang] ?? COPY.en
  const intl = store.market === "us" ? (store.lang === "es" ? "es-US" : "en-US") : `${store.lang}-${store.lang === "en" ? "IE" : store.lang.toUpperCase()}`

  const { groups, rims, selectedRim } = useMemo(() => {
    const map = new Map<string, TireProduct[]>()
    let currentRim: number | null = null
    for (const product of products) {
      if (product.slug === selected) currentRim = product.tire.rim
      const offer = offerFor(product, store.market)
      const priceCents = offer?.priceCents ?? null
      const key = `${product.tire.width}/${product.tire.aspect}R${product.tire.rim}|${product.tire.loadIndex}${product.tire.speedRating}|${product.tire.extraLoad ? "XL" : ""}|${product.tire.runFlat ? "RF" : ""}|${priceCents ?? 0}`
      const existing = map.get(key)
      if (existing) existing.push(product)
      else map.set(key, [product])
    }

    const builtGroups: VariantGroup[] = []
    const rimSet = new Set<number>()
    for (const [key, items] of map.entries()) {
      const selectedIdx = items.findIndex((p) => p.slug === selected)
      const primary = selectedIdx >= 0 ? items[selectedIdx] : items[0]
      const alternates = items.filter((p) => p.slug !== primary.slug)
      const offer = offerFor(primary, store.market)
      rimSet.add(primary.tire.rim)
      const sizeText = tireSize(primary.tire)
      const compactSize = `${primary.tire.width}/${primary.tire.aspect}r${primary.tire.rim}`
      const svc = tireServiceDescription(primary.tire)
      const allCodes = items.map((p) => `${p.mpn ?? ""} ${p.gtin ?? ""} ${p.supplierSku ?? ""}`).join(" ")
      builtGroups.push({
        key,
        primary,
        alternates,
        rim: primary.tire.rim,
        priceCents: offer?.priceCents ?? null,
        searchText: `${sizeText} ${compactSize} ${svc} ${primary.tire.runFlat ? "run-flat runflat" : ""} ${allCodes}`.toLowerCase(),
      })
    }

    return {
      groups: builtGroups,
      rims: [...rimSet].sort((a, b) => a - b),
      selectedRim: currentRim,
    }
  }, [products, selected, store.market])

  if (products.length < 2) return null

  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ")
  const compactQuery = normalizedQuery.replace(/\s+/g, "")

  const filtered = groups.filter((group) => {
    if (rimFilter !== null && group.rim !== rimFilter) return false
    if (!normalizedQuery) return true
    return group.searchText.includes(normalizedQuery) || group.searchText.replace(/\s+/g, "").includes(compactQuery)
  })

  const showControls = groups.length > 8 || rims.length > 2
  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <details className="rounded border border-border bg-card shadow-chip" open={groups.length <= 6 ? undefined : false}>
      <summary className="flex cursor-pointer items-center justify-between gap-2 p-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">
        <span>
          {copy.heading} · {groups.length} {copy.sizesCount}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </summary>

      <div className="border-t border-border">
        {showControls && (
          <div className="flex flex-col gap-2.5 border-b border-border bg-muted/20 p-3">
            {rims.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Rim diameter">
                <button
                  type="button"
                  onClick={() => setRimFilter(null)}
                  aria-pressed={rimFilter === null}
                  className={cn(
                    "rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors",
                    rimFilter === null
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {copy.allRims} ({groups.length})
                </button>
                {rims.map((rim) => {
                  const active = rimFilter === rim
                  const isCurrent = selectedRim === rim
                  return (
                    <button
                      key={rim}
                      type="button"
                      onClick={() => setRimFilter(active ? null : rim)}
                      aria-pressed={active}
                      className={cn(
                        "rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border border-primary/60 bg-card text-foreground hover:bg-muted"
                            : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      R{rim}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchPlaceholder}
                className="h-9 w-full rounded border border-border bg-background pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={copy.clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}

        <nav aria-label={copy.heading} className="flex max-h-72 flex-col overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">{copy.noMatches}</p>
          ) : (
            filtered.map((group) => {
              const { primary, alternates } = group
              const isSelected = primary.slug === selected
              const isExpanded = Boolean(expandedGroups[group.key])
              const altLabel =
                alternates.length === 1
                  ? copy.altMpnSingular
                  : copy.altMpnPlural.replace("{n}", String(alternates.length))

              return (
                <div key={group.key} className="border-b border-border last:border-0">
                  <div
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent/60",
                      isSelected && "bg-accent font-semibold",
                    )}
                  >
                    <Link
                      href={storePath(store, `/product/${primary.slug}`)}
                      prefetch={false}
                      scroll={false}
                      aria-current={isSelected ? "page" : undefined}
                      className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="font-mono font-semibold">{tireSize(primary.tire)}</span>
                      <span className="text-xs text-muted-foreground">{tireServiceDescription(primary.tire)}</span>
                      {primary.tire.runFlat && (
                        <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase">
                          Run-Flat
                        </span>
                      )}
                    </Link>

                    <div className="flex shrink-0 items-center gap-2">
                      {group.priceCents !== null && (
                        <span className="font-mono text-xs font-semibold tabular-nums">
                          {formatPrice(group.priceCents, store.market, intl)}
                        </span>
                      )}
                      <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                        {skuLabel(primary)}
                      </span>
                      {alternates.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.key)}
                          aria-expanded={isExpanded}
                          className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                        >
                          {altLabel}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && alternates.length > 0 && (
                    <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5">
                      <p className="mb-2 text-[11px] text-muted-foreground">{copy.oeNote}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {alternates.map((alt) => (
                          <Link
                            key={alt.slug}
                            href={storePath(store, `/product/${alt.slug}`)}
                            prefetch={false}
                            scroll={false}
                            className="rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                          >
                            {skuLabel(alt)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </nav>
      </div>
    </details>
  )
}
