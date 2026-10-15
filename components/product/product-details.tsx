import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { Product } from "@/lib/catalog"
import { getDictionary, type Dictionary, type Store } from "@/lib/i18n"
import { policyHref } from "@/lib/legal/pages"

export function ProductDetails({ product, store }: { product: Product; store: Store }) {
  const t = getDictionary(store)
  const specs = [...product.specs, ...categorySpecs(product, store, t)]

  return (
    <div className="border-t border-border">
      <Section title={t.product.descSpecs} open>
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
      </Section>

      {product.category === "brakes" && (
        <Section title={t.product.fitment}>
          <ul className="flex flex-col gap-1">
            {product.brake.fitment.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">{t.product.fitmentNote}</p>
        </Section>
      )}

      <Section title={t.product.shipping}>
        <p className="leading-relaxed">{t.product.shippingText}</p>
        <Link href={policyHref(store, "shipping")} className="text-sm underline underline-offset-4">
          {t.product.fullShipping}
        </Link>
      </Section>

      <Section title={t.product.returns}>
        <p className="leading-relaxed">{t.product.returnsDetail}</p>
        <Link href={policyHref(store, "returns")} className="text-sm underline underline-offset-4">
          {t.product.fullReturns}
        </Link>
      </Section>
    </div>
  )
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
  ]
}

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-border">
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-sm font-semibold uppercase tracking-wide">
        {title}
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-4 pb-5 text-sm">{children}</div>
    </details>
  )
}
