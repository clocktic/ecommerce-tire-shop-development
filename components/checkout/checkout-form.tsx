"use client"

import Link from "next/link"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { SummaryRows } from "@/components/cart/cart-view"
import { MARKETS, formatPrice } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import { policyHref } from "@/lib/legal/pages"

export function CheckoutForm() {
  const { market, lines, subtotalCents } = useCart()
  const [accepted, setAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const policy = POLICIES[market]
  const isEu = market === "eu"

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="font-expanded text-xl font-extrabold uppercase">Nothing to check out</p>
        <Link href={`/${market}/tires`} className={buttonVariants({ size: "lg" })}>
          Shop tires
        </Link>
      </div>
    )
  }

  return (
    <form
      className="grid gap-10 py-8 lg:grid-cols-12"
      onSubmit={(e) => {
        e.preventDefault()
        if (accepted) setSubmitted(true)
      }}
    >
      <div className="flex flex-col gap-8 lg:col-span-7">
        <fieldset className="flex flex-col gap-4">
          <legend className="label-caps mb-4">Contact</legend>
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Phone" name="phone" type="tel" autoComplete="tel" required />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="label-caps mb-4">Delivery address</legend>
          <Field label="First name" name="given-name" autoComplete="given-name" required />
          <Field label="Last name" name="family-name" autoComplete="family-name" required />
          <div className="sm:col-span-2">
            <Field label="Street address" name="address" autoComplete="street-address" required />
          </div>
          <Field label={isEu ? "Postcode" : "ZIP code"} name="postal" autoComplete="postal-code" required />
          <Field label="City" name="city" autoComplete="address-level2" required />
          {!isEu && <Field label="State" name="state" autoComplete="address-level1" required />}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="label-caps text-muted-foreground">
              Country
            </label>
            <select
              id="country"
              name="country"
              autoComplete="country"
              required
              defaultValue={isEu ? "" : "US"}
              className="h-12 border border-border bg-card px-3 text-sm"
            >
              {isEu && <option value="">Select country</option>}
              {MARKETS[market].shipsTo.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            We deliver to {policy.shipping.area}. Not available: {policy.shipping.exclusions}.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="label-caps mb-4">Payment</legend>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Accepted: {policy.paymentMethods.join(", ")}. The payment provider is not connected yet in this preview.
          </p>
        </fieldset>
      </div>

      <aside className="flex flex-col gap-5 border border-border bg-card p-5 lg:col-span-5 lg:self-start">
        <h2 className="label-caps">Your order</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-4">
              <span>
                {l.quantity} × {l.name}
              </span>
              <span className="font-mono tabular-nums">{formatPrice(l.priceCents * l.quantity, market)}</span>
            </li>
          ))}
        </ul>
        <SummaryRows subtotalCents={subtotalCents} />
        <p className="text-xs text-muted-foreground">Estimated delivery: {deliveryLabel(market)}.</p>

        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            required
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span>
            I have read and accept the{" "}
            <Link href={policyHref(market, "terms")} className="underline underline-offset-4" target="_blank">
              {isEu ? "Terms & Conditions" : "Terms of Service"}
            </Link>{" "}
            and the{" "}
            <Link href={policyHref(market, "privacy")} className="underline underline-offset-4" target="_blank">
              Privacy Policy
            </Link>
            {isEu ? (
              <>
                , and I have been informed of my{" "}
                <Link href={policyHref(market, "returns")} className="underline underline-offset-4" target="_blank">
                  {policy.returns.windowDays}-day right of withdrawal
                </Link>
                .
              </>
            ) : (
              <>
                , including the{" "}
                <Link href={policyHref(market, "returns")} className="underline underline-offset-4" target="_blank">
                  Return Policy
                </Link>
                .
              </>
            )}
          </span>
        </label>

        {/* EU Directive 2011/83, Art. 8(2): the order button must state the obligation to pay. */}
        <Button type="submit" size="lg" className="w-full" disabled={!accepted}>
          {isEu ? "Order with obligation to pay" : "Place order"}
        </Button>
        {submitted && (
          <p role="status" className="text-sm text-primary">
            Payments are not connected yet — no order was created.
          </p>
        )}
      </aside>
    </form>
  )
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `field-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-caps text-muted-foreground">
        {label}
      </label>
      <input id={id} name={name} className="h-12 border border-border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" {...props} />
    </div>
  )
}
