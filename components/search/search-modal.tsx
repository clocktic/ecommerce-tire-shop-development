"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowRight, Check, Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { POPULAR_TIRE_SIZES } from "@/lib/catalog/vehicles"
import { storePath } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/markets"

type SearchItem = {
  slug: string
  brand: string
  name: string
  category: "tires" | "wheels" | "brakes"
  image: string
  specCode: string
  specMeta: string
  priceCents: number
  availability: "in_stock" | "preorder" | "out_of_stock"
  mpn?: string
  tire?: { width: number; aspect: number; rim: number }
  wheel?: { diameter: number; boltPattern: string }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SEARCH_LABELS: Record<
  string,
  {
    trigger: string
    placeholder: string
    popularSizes: string
    quickCategories: string
    noResults: string
    fitsActive: string
  }
> = {
  en: {
    trigger: "Search",
    placeholder: "Search tire size (225/45R17), brand, model or MPN...",
    popularSizes: "Popular sizes",
    quickCategories: "Browse catalog",
    noResults: "No matching products found. Try a tire size like 225/45R17 or a brand name.",
    fitsActive: "Fits your vehicle",
  },
  de: {
    trigger: "Suche",
    placeholder: "Reifengröße (225/45R17), Marke, Modell oder MPN suchen...",
    popularSizes: "Beliebte Größen",
    quickCategories: "Katalog durchsuchen",
    noResults: "Keine passenden Produkte gefunden. Versuchen Sie z. B. 225/45R17 oder eine Marke.",
    fitsActive: "Passt zu Ihrem Fahrzeug",
  },
  fr: {
    trigger: "Rechercher",
    placeholder: "Dimension (225/45R17), marque, modèle ou MPN...",
    popularSizes: "Dimensions populaires",
    quickCategories: "Parcourir le catalogue",
    noResults: "Aucun produit correspondant. Essayez une dimension comme 225/45R17.",
    fitsActive: "Compatible avec votre véhicule",
  },
  es: {
    trigger: "Buscar",
    placeholder: "Buscar medida (225/45R17), marca, modelo o MPN...",
    popularSizes: "Medidas populares",
    quickCategories: "Explorar catálogo",
    noResults: "No se encontraron productos. Prueba con una medida como 225/45R17.",
    fitsActive: "Compatible con tu vehículo",
  },
  it: {
    trigger: "Cerca",
    placeholder: "Cerca misura (225/45R17), marca, modello o MPN...",
    popularSizes: "Misure popolari",
    quickCategories: "Sfoglia catalogo",
    noResults: "Nessun prodotto trovato. Prova una misura come 225/45R17.",
    fitsActive: "Compatibile con il tuo veicolo",
  },
  nl: {
    trigger: "Zoeken",
    placeholder: "Zoek bandenmaat (225/45R17), merk, model of MPN...",
    popularSizes: "Populaire maten",
    quickCategories: "Catalogus bekijken",
    noResults: "Geen producten gevonden. Probeer een maat zoals 225/45R17.",
    fitsActive: "Past op uw voertuig",
  },
}

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { store, t, intl } = useI18n()
  const { active } = useGarage()
  const router = useRouter()
  const copy = SEARCH_LABELS[store.lang] ?? SEARCH_LABELS.en

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const swrKey = open
    ? `/api/search?market=${store.market}&lang=${store.lang}&q=${encodeURIComponent(query)}`
    : null
  const { data, isLoading } = useSWR<{ results: SearchItem[] }>(swrKey, fetcher, {
    keepPreviousData: true,
  })

  const results = data?.results ?? []
  const popular = POPULAR_TIRE_SIZES[store.market].slice(0, 6)

  const checkFitsActive = (item: SearchItem) => {
    if (!active) return false
    if (item.category === "tires" && item.tire) {
      return (
        item.tire.width === active.width &&
        item.tire.aspect === active.aspect &&
        item.tire.rim === active.rim
      )
    }
    if (item.category === "wheels" && item.wheel && active.boltPattern) {
      return item.wheel.diameter === active.rim && item.wheel.boltPattern === active.boltPattern
    }
    return false
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-2 px-2.5 text-sm font-medium hover:text-primary"
            aria-label={copy.trigger}
          />
        }
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden font-mono text-xs uppercase tracking-[0.14em] sm:inline">{copy.trigger}</span>
        <kbd className="hidden border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
          /K
        </kbd>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-none! border border-foreground/30 bg-card p-0 shadow-2xl sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{copy.trigger}</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
          <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "Enter" && results[0]) {
                setOpen(false)
                router.push(storePath(store, `/product/${results[0].slug}`))
              }
            }}
            placeholder={copy.placeholder}
            className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {copy.popularSizes}:
          </span>
          {popular.map((s) => {
            const label = `${s.width}/${s.aspect} R${s.rim}`
            return (
              <button
                key={label}
                type="button"
                onClick={() => setQuery(`${s.width}/${s.aspect} R${s.rim}`)}
                className="border border-border bg-background px-2 py-0.5 font-mono text-[11px] transition-colors hover:border-primary hover:text-primary"
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {copy.trigger}...
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <p className="max-w-md text-sm text-muted-foreground">{copy.noResults}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href={storePath(store, "/tires")}
                  onClick={() => setOpen(false)}
                  className="border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold uppercase hover:border-primary"
                >
                  {t.categories.tires.name}
                </Link>
                <Link
                  href={storePath(store, "/wheels")}
                  onClick={() => setOpen(false)}
                  className="border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold uppercase hover:border-primary"
                >
                  {t.categories.wheels.name}
                </Link>
                <Link
                  href={storePath(store, "/brakes")}
                  onClick={() => setOpen(false)}
                  className="border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold uppercase hover:border-primary"
                >
                  {t.categories.brakes.name}
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((item) => {
                const fits = checkFitsActive(item)
                return (
                  <li key={item.slug}>
                    <Link
                      href={storePath(store, `/product/${item.slug}`)}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden border border-border bg-photo">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.brand}
                          </span>
                          <Badge variant="outline" className="h-4 rounded-none px-1.5 font-mono text-[10px]">
                            {item.specCode}
                          </Badge>
                          {fits && (
                            <Badge className="h-4 gap-0.5 rounded-none px-1.5 font-mono text-[10px]">
                              <Check className="size-2.5" aria-hidden="true" />
                              {copy.fitsActive}
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-sm font-semibold group-hover:text-primary">{item.name}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {item.specMeta}
                          {item.mpn ? ` · MPN ${item.mpn}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          {formatPrice(item.priceCents, store.market, intl)}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          {t.labels.availability[item.availability]}
                        </span>
                      </div>
                      <ArrowRight
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
