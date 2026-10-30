"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Product } from "@/lib/catalog"
import { getDictionary, type Dictionary, type Store } from "@/lib/i18n"
import { policyHref } from "@/lib/legal/pages"

export function ProductDetails({ product, store }: { product: Product; store: Store }) {
  const t = getDictionary(store)
  const rawSpecs = [
    ...product.specs.filter((s) => !IDENTIFIER_LABELS.has(s.label)),
    ...identifierSpecs(product, t),
    ...categorySpecs(product, store, t),
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
                <div key={s.label} className="flex justify-between gap-4 py-2 text-sm">
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="text-right font-mono">{s.value}</dd>
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

const IDENTIFIER_LABELS = new Set(["EAN", "UPC", "MPN", "GTIN", "Supplier part", "Manufacturer part"])

function identifierSpecs(product: Product, t: Dictionary) {
  const label = t.product.spec
  return [
    ...(product.mpn ? [{ label: label.mpn, value: product.mpn }] : []),
    ...(product.gtin ? [{ label: product.gtin.length === 12 ? label.upc : label.ean, value: product.gtin }] : []),
    ...(product.supplierSku ? [{ label: label.supplierPart, value: product.supplierSku }] : []),
  ]
}

function categorySpecs(product: Product, { market }: Store, t: Dictionary) {
  const label = t.product.spec
  if (product.category === "wheels") {
    const w = product.wheel
    return [
      { label: label.finish, value: w.finish },
      { label: label.construction, value: w.construction },
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
  return [
    { label: label.season, value: t.labels.season[tire.season] },
    { label: label.runFlat, value: tire.runFlat ? t.common.yes : t.common.no },
    ...(market === "eu" && tire.eprelExempt
      ? [
          {
            label: "EU 2020/740",
            value:
              tire.eprelExempt.reason === "studded"
                ? "Exempt — Art. 2(2)(b) (Studded tyre)"
                : "Exempt — Art. 2(2)(a) (POR Off-Road)",
          },
        ]
      : []),
  ]
}
