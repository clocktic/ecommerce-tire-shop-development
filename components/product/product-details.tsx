import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { Product } from "@/lib/catalog"
import { formatPrice, type Market } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import { policyHref } from "@/lib/legal/pages"

export function ProductDetails({ product, market }: { product: Product; market: Market }) {
  const policy = POLICIES[market]
  const specs = [...product.specs, ...categorySpecs(product, market)]

  return (
    <div className="border-t border-border">
      <Section title="Description & specifications" open>
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
        <Section title="Fitment">
          <ul className="flex flex-col gap-1">
            {product.brake.fitment.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Check the part number against your vehicle before ordering. Brake work should be carried out by a qualified
            technician.
          </p>
        </Section>
      )}

      <Section title="Shipping">
        <p className="leading-relaxed">
          {policy.shipping.freeShipping ? "Free" : formatPrice(policy.shipping.rateCents, market)} delivery to{" "}
          {policy.shipping.area} in {deliveryLabel(market)} with {policy.shipping.carriers.join(", ")}.{" "}
          {policy.shipping.duties}
        </p>
        <Link href={policyHref(market, "shipping")} className="text-sm underline underline-offset-4">
          Full shipping policy
        </Link>
      </Section>

      <Section title="Returns">
        <p className="leading-relaxed">
          {market === "eu"
            ? `You can withdraw from the purchase within ${policy.returns.windowDays} days of delivery without giving a reason. Tires and wheels that have been mounted or driven on may lose value, which can reduce the refund.`
            : `Return unused, unmounted items within ${policy.returns.windowDays} days of delivery for a full refund of the item price. No restocking fee.`}
        </p>
        <Link href={policyHref(market, "returns")} className="text-sm underline underline-offset-4">
          Full return policy
        </Link>
      </Section>
    </div>
  )
}

function categorySpecs(product: Product, market: Market) {
  if (product.category === "wheels") {
    const w = product.wheel
    return [
      { label: "Finish", value: w.finish },
      { label: "Construction", value: w.construction },
      { label: "Load rating", value: `${w.loadRatingKg} kg` },
      ...(w.approvals[market] ? [{ label: "Approval", value: w.approvals[market]! }] : []),
    ]
  }
  if (product.category === "brakes") {
    const b = product.brake
    return [
      ...(b.pistons ? [{ label: "Caliper pistons", value: String(b.pistons) }] : []),
      ...(b.approvals[market] ? [{ label: "Approval", value: b.approvals[market]! }] : []),
    ]
  }
  const t = product.tire
  return [
    { label: "Season", value: t.season === "all-season" ? "All-season" : t.season === "winter" ? "Winter" : "Summer" },
    { label: "Run-flat", value: t.runFlat ? "Yes" : "No" },
  ]
}

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-border">
      <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-semibold uppercase tracking-wide">
        {title}
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-4 pb-5 text-sm">{children}</div>
    </details>
  )
}
