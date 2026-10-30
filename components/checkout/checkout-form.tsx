"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { SummaryRows } from "@/components/cart/cart-view"
import { useI18n } from "@/components/i18n/i18n-provider"
import { placeOrder } from "@/lib/actions/checkout"
import { useSession } from "@/lib/auth-client"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"
import { MARKETS, formatPrice } from "@/lib/markets"
import { policyHref } from "@/lib/legal/pages"
import { PaymentBadges } from "@/components/ui/payment-badges"

export function CheckoutForm() {
  const { lines, subtotalCents, clear } = useCart()
  const { store, t: dict, x, intl } = useI18n()
  const t = dict.checkout
  const { market } = store
  const router = useRouter()
  const { data: session } = useSession()
  const [accepted, setAccepted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [pending, startTransition] = useTransition()
  const isEu = market === "eu"
  const regionNames = new Intl.DisplayNames([intl], { type: "region" })
  const countries = MARKETS[market].shipsTo
    .map((c) => ({ code: c.code, name: regionNames.of(c.code) ?? c.name }))
    .sort((a, b) => a.name.localeCompare(b.name, intl))

  if (placed) {
    return (
      <p role="status" className="py-16 text-sm text-muted-foreground">
        {x.checkout.placing}
      </p>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="font-expanded text-xl font-extrabold uppercase">{t.nothing}</p>
        <Link href={storePath(store, "/tires")} className={buttonVariants({ size: "lg" })}>
          {dict.cart.shopTires}
        </Link>
      </div>
    )
  }

  return (
    <form
      className="grid gap-10 py-8 lg:grid-cols-12"
      onSubmit={(e) => {
        e.preventDefault()
        if (!accepted || pending) return
        const form = new FormData(e.currentTarget)
        const get = (name: string) => String(form.get(name) ?? "")
        setFailed(false)
        startTransition(async () => {
          const result = await placeOrder({
            market: store.market,
            lang: store.lang,
            lines: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
            email: get("email"),
            phone: get("phone"),
            firstName: get("given-name"),
            lastName: get("family-name"),
            address: get("address"),
            postal: get("postal"),
            city: get("city"),
            state: get("state"),
            country: get("country"),
            accepted,
          })
          if (!result.ok) {
            setFailed(true)
            return
          }
          setPlaced(true)
          clear()
          router.push(storePath(store, `/order/${result.orderNumber}`))
        })
      }}
    >
      <div className="flex flex-col gap-8 lg:col-span-7">
        <fieldset className="flex flex-col gap-4">
          <legend className="label-caps mb-4">{t.contact}</legend>
          <p className="text-sm text-muted-foreground">
            {session?.user ? (
              fmt(x.checkout.signedInAs, { email: session.user.email })
            ) : (
              <Link href={storePath(store, "/account")} className="underline underline-offset-4">
                {x.checkout.signInHint}
              </Link>
            )}
          </p>
          <Field
            label={t.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={session?.user?.email ?? undefined}
            key={session?.user?.email ?? "guest"}
          />
          <Field label={t.phone} name="phone" type="tel" autoComplete="tel" required />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="label-caps mb-4">{t.address}</legend>
          <Field label={t.firstName} name="given-name" autoComplete="given-name" required />
          <Field label={t.lastName} name="family-name" autoComplete="family-name" required />
          <div className="sm:col-span-2">
            <Field label={t.street} name="address" autoComplete="street-address" required />
          </div>
          <Field label={t.postal} name="postal" autoComplete="postal-code" required />
          <Field label={t.city} name="city" autoComplete="address-level2" required />
          {t.state && <Field label={t.state} name="state" autoComplete="address-level1" required />}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="label-caps text-muted-foreground">
              {t.country}
            </label>
            <select
              id="country"
              name="country"
              autoComplete="country"
              required
              defaultValue={isEu ? "" : "US"}
              className="h-12 border border-border bg-card px-3 text-sm"
            >
              {isEu && <option value="">{t.selectCountry}</option>}
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            {t.deliverTo}
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="label-caps mb-4">{t.payment}</legend>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.accepted}
          </p>
          <PaymentBadges className="pt-1" />
        </fieldset>
      </div>

      <aside className="flex flex-col gap-5 border border-border bg-card p-5 lg:col-span-5 lg:self-start">
        <h2 className="label-caps">{t.yourOrder}</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-4">
              <span>
                {l.quantity} × {l.name}
              </span>
              <span className="font-mono tabular-nums">{formatPrice(l.priceCents * l.quantity, market, intl)}</span>
            </li>
          ))}
        </ul>
        <SummaryRows subtotalCents={subtotalCents} />
        <p className="text-xs text-muted-foreground">{t.estimated}</p>

        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            required
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span>
            {t.acceptPrefix}{" "}
            <Link href={policyHref(store, "terms")} className="underline underline-offset-4" target="_blank">
              {t.termsLink}
            </Link>{" "}
            {t.and}{" "}
            <Link href={policyHref(store, "privacy")} className="underline underline-offset-4" target="_blank">
              {t.privacyLink}
            </Link>
            {t.returnsPrefix}{" "}
            <Link href={policyHref(store, "returns")} className="underline underline-offset-4" target="_blank">
              {t.returnsLink}
            </Link>
            {t.end}
          </span>
        </label>

        {/* EU Directive 2011/83, Art. 8(2): the order button must state the obligation to pay. */}
        <Button type="submit" size="lg" className="w-full" disabled={!accepted || pending}>
          {pending ? x.checkout.placing : t.submit}
        </Button>
        {failed && (
          <p role="alert" className="text-sm text-primary">
            {x.checkout.error}
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
