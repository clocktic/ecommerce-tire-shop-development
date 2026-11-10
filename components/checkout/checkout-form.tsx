"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Icon3D, type Icon3DName } from "@/components/ui/icon-3d"
import { PayButton } from "@/components/checkout/pay-button"
import { PayPalOrderButtons } from "@/components/checkout/paypal-buttons"
import { useCart } from "@/components/cart/cart-provider"
import { SummaryRows } from "@/components/cart/cart-view"
import { useI18n } from "@/components/i18n/i18n-provider"
import { placeOrder } from "@/lib/actions/checkout"
import { useSession } from "@/lib/auth-client"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"
import { MARKETS, formatPrice } from "@/lib/markets"
import { COMPANY, companyAddressLine } from "@/lib/company"
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
  const formRef = useRef<HTMLFormElement | null>(null)
  const createdPayPalOrderRef = useRef<string | null>(null)
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
      ref={formRef}
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
          if (result.forwardUrl) {
            if (window.self !== window.top) {
              window.open(result.forwardUrl, "_blank", "noopener,noreferrer")
              router.push(storePath(store, `/order/${result.orderNumber}`))
            } else {
              window.location.assign(result.forwardUrl)
            }
            return
          }
          router.push(storePath(store, `/order/${result.orderNumber}`))
        })
      }}
    >
      <div className="flex flex-col gap-8 lg:col-span-7">
        <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-lifted sm:p-6">
          <SectionLegend icon="contact">{t.contact}</SectionLegend>
          <p className="text-sm text-muted-foreground">
            {session?.user ? (
              fmt(x.checkout.signedInAs, { email: session.user.email })
            ) : (
              <Link href={storePath(store, "/account?mode=sign-up")} className="underline underline-offset-4">
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

        <fieldset className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border bg-card p-4 shadow-lifted sm:p-6">
          <SectionLegend icon="address">{t.address}</SectionLegend>
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
              className="h-12 border border-border bg-background px-3 text-sm transition-colors hover:border-foreground/40"
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

        <fieldset className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lifted sm:p-6">
          <SectionLegend icon="payment">{t.payment}</SectionLegend>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.accepted}
          </p>
          <PaymentBadges className="pt-1" />
        </fieldset>
      </div>

      <aside className="flex flex-col gap-5 border border-border bg-card p-5 shadow-lifted lg:col-span-5 lg:self-start sm:p-6">
        <h2 className="flex items-center gap-3 label-caps">
          <Icon3D name="order" size="md" />
          {t.yourOrder}
        </h2>
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
        <SummaryRows subtotalCents={subtotalCents} isCheckout />
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
        <PayButton pending={pending} disabled={!accepted}>
          {pending ? x.checkout.placing : t.submit}
        </PayButton>

        <PayPalOrderButtons
          currency={MARKETS[market].currency}
          disabled={!accepted || pending}
          getOrderNumber={async () => {
            if (createdPayPalOrderRef.current) {
              return createdPayPalOrderRef.current
            }
            const formEl = formRef.current
            if (!formEl || !accepted) return null
            if (!formEl.reportValidity()) return null
            const form = new FormData(formEl)
            const get = (name: string) => String(form.get(name) ?? "")
            setFailed(false)
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
              accepted: true,
              paymentProvider: "paypal",
            })
            if (!result.ok) {
              setFailed(true)
              return null
            }
            createdPayPalOrderRef.current = result.orderNumber
            return result.orderNumber
          }}
          onSuccess={(orderNumber) => {
            setPlaced(true)
            clear()
            router.push(storePath(store, `/order/${orderNumber}`))
          }}
        />
        {failed && (
          <p role="alert" className="text-sm text-primary">
            {x.checkout.error}
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href={policyHref(store, "shipping")} className="underline underline-offset-4" target="_blank">
              {dict.product.shipping}
            </Link>
            <Link href={policyHref(store, "returns")} className="underline underline-offset-4" target="_blank">
              {t.returnsLink}
            </Link>
            <Link href={policyHref(store, "payments")} className="underline underline-offset-4" target="_blank">
              {t.payment}
            </Link>
            <Link href={policyHref(store, "privacy")} className="underline underline-offset-4" target="_blank">
              {t.privacyLink}
            </Link>
            <Link href={policyHref(store, "terms")} className="underline underline-offset-4" target="_blank">
              {t.termsLink}
            </Link>
          </div>
          <p className="leading-relaxed">
            {COMPANY.legalName} · {companyAddressLine} · {COMPANY.phoneDisplay} · {COMPANY.email}
          </p>
        </div>
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
      <input
        id={id}
        name={name}
        className="h-12 border border-border bg-background px-3 text-sm transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-ring"
        {...props}
      />
    </div>
  )
}

function SectionLegend({ icon, children }: { icon: Icon3DName; children: React.ReactNode }) {
  return (
    <legend className="label-caps float-left mb-2 flex w-full items-center gap-3 sm:col-span-2">
      <Icon3D name={icon} size="md" />
      {children}
    </legend>
  )
}
