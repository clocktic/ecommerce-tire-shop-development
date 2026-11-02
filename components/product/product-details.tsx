"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getProductWarranty, type Product } from "@/lib/catalog"
import { getDictionary, type Dictionary, type Store } from "@/lib/i18n"
import { policyHref } from "@/lib/legal/pages"

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
  const specs = rawSpecs.filter((s) => {
    const key = s.label.trim().toLowerCase()
    if (seenLabels.has(key)) return false
    seenLabels.add(key)
    return true
  })

  return (
    <Accordion defaultValue={["specs"]} className="border-t border-border">
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
            {t.product.fitment}
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <div className="flex flex-col gap-4 text-sm">
              <ul className="flex flex-col gap-1">
                {product.brake.fitment.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">{t.product.fitmentNote}</p>
            </div>
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

const EXCLUDED_SPEC_LABELS = new Set([
  "ean",
  "upc",
  "mpn",
  "gtin",
  "supplier part",
  "manufacturer part",
  "manufacturer part number (mpn)",
  "ean / gtin-13",
  "upc / gtin",
  "manufacturer warranty (us source)",
  "manufacturer warranty",
  "warranty",
  "reference checked",
])

function identifierSpecs(product: Product, t: Dictionary) {
  const label = t.product.spec
  return [
    ...(product.mpn ? [{ label: label.mpn, value: product.mpn }] : []),
    ...(product.gtin ? [{ label: product.gtin.length === 12 ? label.upc : label.ean, value: product.gtin }] : []),
    ...(product.supplierSku ? [{ label: label.supplierPart, value: product.supplierSku }] : []),
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
      { label: label.loadRating, value: `${w.loadRatingKg} kg` },
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
