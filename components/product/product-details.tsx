"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getProductWarranty, type Product } from "@/lib/catalog"
import { getDictionary, type Dictionary, type Store } from "@/lib/i18n"
import { policyHref } from "@/lib/legal/pages"

function formatDisplaySpecValue(label: string, value: string, market: Store["market"]): string {
  const val = value.trim()
  const key = label.trim().toLowerCase()
  if (
    (key === "section width" ||
      key === "reifenbreite (mm)" ||
      key === "largeur de section (mm)" ||
      key === "larghezza sezione (mm)" ||
      key === "ancho de sección (mm)" ||
      key === "bandbreedte (mm)") &&
    /^\d+(\.\d+)?$/.test(val)
  ) {
    return `${val} mm`
  }
  if (
    (key === "aspect ratio" ||
      key === "querschnittsverhältnis (%)" ||
      key === "rapport d’aspect (%)" ||
      key === "rapporto d’aspetto (%)" ||
      key === "perfil (%)" ||
      key === "hoogte-breedteverhouding (%)") &&
    /^\d+(\.\d+)?$/.test(val)
  ) {
    return `${val}%`
  }
  if (
    (key === "rim diameter" ||
      key === "overall diameter" ||
      key === "approved rim width" ||
      key === "felgendurchmesser (zoll)" ||
      key === "außendurchmesser (zoll)" ||
      key === "zulässige maulweite (zoll)") &&
    /^[\d.-]+$/.test(val)
  ) {
    return market === "eu" ? `${val}″` : `${val} in`
  }
  if (
    (key === "tread depth" ||
      key === "profiltiefe" ||
      key === "profondeur de sculpture" ||
      key === "profondità battistrada" ||
      key === "profundidad de dibujo" ||
      key === "profieldiepte") &&
    /^\d+\/\d+$/.test(val)
  ) {
    const [num, den] = val.split("/").map(Number)
    if (market === "eu" && num && den) {
      const mm = ((num / den) * 25.4).toFixed(1)
      return `${mm} mm (${val}")`
    }
    return `${val} in`
  }
  return val
}

function canonicalSpecKey(label: string): string {
  const key = label.trim().toLowerCase()
  if (key.includes("runflat") || key.includes("run-flat") || key.includes("run flat")) return "runflat"
  if (key === "season" || key === "saison" || key === "stagione" || key === "temporada" || key === "seizoen") return "season"
  if (key === "load rating" || key === "traglast" || key === "charge admissible" || key === "carico ammesso" || key === "carga admitida" || key === "draagvermogen" || key === "capacidad de carga") {
    return "loadrating"
  }
  return key.replace(/[\s_-]+/g, "")
}

export function ProductDetails({ product, store }: { product: Product; store: Store }) {
  const t = getDictionary(store)
  const warranty = getProductWarranty(product, store)
  const rawSpecs = [
    ...product.specs.filter((s) => !EXCLUDED_SPEC_LABELS.has(s.label.trim().toLowerCase())),
    ...identifierSpecs(product, t),
    ...categorySpecs(product, store, t),
    { label: warranty.specLabel, value: warranty.specValue },
  ]
  const seenLabels = new Set<string>()
  const specs = rawSpecs
    .filter((s) => s.value && !/^(undefined|null|nan)(\s|$)/i.test(s.value.trim()))
    .filter((s) => {
      const key = canonicalSpecKey(s.label)
      if (seenLabels.has(key)) return false
      seenLabels.add(key)
      return true
    })
    .map((s) => ({ label: s.label, value: formatDisplaySpecValue(s.label, s.value, store.market) }))

  return (
    <Accordion
      defaultValue={product.category === "brakes" ? ["specs", "fitment"] : ["specs"]}
      className="border-t border-border"
    >
      <AccordionItem value="specs" className="border-b border-border">
        <AccordionTrigger className="rounded-none py-4 text-sm font-semibold uppercase tracking-wide hover:no-underline">
          {t.product.descSpecs}
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="flex flex-col gap-4 text-sm">
            <p className="leading-relaxed">{product.description}</p>
            <ul className="flex flex-col gap-1.5">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-primary" />
                  {h}
                </li>
              ))}
            </ul>
            <dl className="divide-y divide-border border-y border-border">
              {specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[minmax(6.5rem,38%)_1fr] items-baseline gap-3 py-2.5 text-xs sm:text-sm">
                  <dt className="break-words text-muted-foreground">{s.label}</dt>
                  <dd className="min-w-0 break-words text-right font-mono text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </AccordionContent>
      </AccordionItem>

      {product.category === "brakes" && (
        <AccordionItem value="fitment" className="border-b border-border">
          <AccordionTrigger className="rounded-none py-4 text-sm font-semibold uppercase tracking-wide hover:no-underline">
            <span className="flex items-center gap-2">
              <span>{t.product.fitment}</span>
              <span className="font-mono text-xs font-normal text-muted-foreground">
                ({product.brake.fitment.length})
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <BrakeFitmentList fitment={product.brake.fitment} note={t.product.fitmentNote} />
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="warranty" className="border-b border-border">
        <AccordionTrigger className="rounded-none py-4 text-sm font-semibold uppercase tracking-wide hover:no-underline">
          {warranty.accordionTitle}
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="flex flex-col gap-4 text-sm">
            <p className="leading-relaxed">{warranty.detailParagraph}</p>
            <Link href={policyHref(store, "warranty")} className="text-sm underline underline-offset-4">
              {warranty.policyLinkLabel}
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shipping" className="border-b border-border">
        <AccordionTrigger className="rounded-none py-4 text-sm font-semibold uppercase tracking-wide hover:no-underline">
          {t.product.shipping}
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="flex flex-col gap-4 text-sm">
            <p className="leading-relaxed">{t.product.shippingText}</p>
            <Link href={policyHref(store, "shipping")} className="text-sm underline underline-offset-4">
              {t.product.fullShipping}
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="returns" className="border-b border-border">
        <AccordionTrigger className="rounded-none py-4 text-sm font-semibold uppercase tracking-wide hover:no-underline">
          {t.product.returns}
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <div className="flex flex-col gap-4 text-sm">
            <p className="leading-relaxed">{t.product.returnsDetail}</p>
            <Link href={policyHref(store, "returns")} className="text-sm underline underline-offset-4">
              {t.product.fullReturns}
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const INITIAL_VISIBLE_FITMENTS = 12

function BrakeFitmentList({ fitment, note }: { fitment: string[]; note: string }) {
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState(false)

  const trimmed = query.trim().toLowerCase()
  const filtered = trimmed
    ? fitment.filter((item) => item.toLowerCase().includes(trimmed))
    : fitment

  const showAll = expanded || Boolean(trimmed) || filtered.length <= INITIAL_VISIBLE_FITMENTS
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE_FITMENTS)
  const hiddenCount = filtered.length - visible.length

  return (
    <div className="flex flex-col gap-3 text-sm">
      {fitment.length > 8 && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by make, model, chassis, or year..."
            aria-label="Filter compatible vehicles"
            className="h-9 w-full rounded-sm border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none sm:text-sm"
          />
        </div>
      )}

      {visible.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {visible.map((f) => (
            <li key={f} className="leading-snug text-foreground">
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          No matching vehicle found for &ldquo;{query.trim()}&rdquo;. Check your VIN or rotor dimensions below.
        </p>
      )}

      {!trimmed && fitment.length > INITIAL_VISIBLE_FITMENTS && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="self-start text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-muted-foreground"
        >
          {expanded ? "Show fewer vehicles" : `Show all ${fitment.length} compatible vehicles (+${hiddenCount} more)`}
        </button>
      )}

      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

const EXCLUDED_SPEC_LABELS = new Set([
  "ean",
  "upc",
  "mpn",
  "gtin",
  "supplier part",
  "lieferantennummer",
  "manufacturer part",
  "manufacturer part number (mpn)",
  "ean / gtin-13",
  "upc / gtin",
  "manufacturer warranty (us source)",
  "manufacturer warranty",
  "warranty",
  "reference checked",
  "compatible applications",
  "passende fahrzeuge",
  "véhicules compatibles",
  "veicoli compatibili",
  "vehículos compatibles",
  "geschikte voertuigen",
])

function identifierSpecs(product: Product, t: Dictionary) {
  const label = t.product.spec
  return [
    ...(product.mpn ? [{ label: label.mpn, value: product.mpn }] : []),
    ...(product.gtin ? [{ label: product.gtin.length === 12 ? label.upc : label.ean, value: product.gtin }] : []),
    ...(!product.mpn && !product.gtin && product.supplierSku
      ? [{ label: label.supplierPart, value: product.supplierSku }]
      : []),
  ]
}

function categorySpecs(product: Product, { market, lang }: Store, t: Dictionary) {
  const label = t.product.spec
  if (product.category === "wheels") {
    const w = product.wheel
    const constr = t.catalog.constructionLabels[w.construction] ?? w.construction
    return [
      { label: label.finish, value: w.finish },
      { label: label.construction, value: constr },
      ...(w.loadRatingKg ? [{ label: label.loadRating, value: `${w.loadRatingKg} kg` }] : []),
      ...(w.approvals[market] ? [{ label: label.approval, value: w.approvals[market]! }] : []),
    ]
  }
  if (product.category === "brakes") {
    const b = product.brake
    return [
      ...(b.pistons ? [{ label: label.pistons, value: String(b.pistons) }] : []),
      ...(b.approvals[market] ? [{ label: label.approval, value: b.approvals[market]! }] : []),
    ]
  }
  const tire = product.tire
  const exemptCopy: Record<string, { studded: string; por: string }> = {
    en: {
      studded: "Exempt — Art. 2(2)(b) (Studded tyre)",
      por: "Exempt — Art. 2(2)(a) (POR Off-Road)",
    },
    de: {
      studded: "Ausgenommen — Art. 2 Abs. 2 Buchst. b (Spikereifen)",
      por: "Ausgenommen — Art. 2 Abs. 2 Buchst. a (POR Geländereifen)",
    },
    fr: {
      studded: "Exempté — art. 2, § 2, b) (pneu à crampons)",
      por: "Exempté — art. 2, § 2, a) (pneu tout-terrain professionnel POR)",
    },
    it: {
      studded: "Esente — art. 2, par. 2, lett. b) (pneumatico chiodato)",
      por: "Esente — art. 2, par. 2, lett. a) (fuoristrada professionale POR)",
    },
    es: {
      studded: "Exento — art. 2.2.b (neumático con clavos)",
      por: "Exento — art. 2.2.a (todoterreno profesional POR)",
    },
    nl: {
      studded: "Vrijgesteld — art. 2, lid 2, sub b (spijkerband)",
      por: "Vrijgesteld — art. 2, lid 2, sub a (professionele terreinband POR)",
    },
  }
  const ex = exemptCopy[lang] ?? exemptCopy.en
  return [
    { label: label.season, value: t.labels.season[tire.season] },
    { label: label.runFlat, value: tire.runFlat ? t.common.yes : t.common.no },
    ...(market === "eu" && tire.eprelExempt
      ? [
          {
            label: "EU 2020/740",
            value: tire.eprelExempt.reason === "studded" ? ex.studded : ex.por,
          },
        ]
      : []),
  ]
}
