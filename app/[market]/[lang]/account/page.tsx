import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { CheckCircle2, Tag } from "lucide-react"
import { ENABLED_PROVIDERS, getSessionUser } from "@/lib/auth"
import { fmt, getDictionary, localeMeta, parseStore, storePath } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { policyHref } from "@/lib/legal/pages"
import { formatPrice, type Market } from "@/lib/markets"
import { getOrdersForUser } from "@/lib/orders"
import { getShipmentEventsForOrders } from "@/lib/shipping/events"
import { statusLabel, type OrderStatus } from "@/lib/shipping/tracking"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { SocialSignIn } from "@/components/account/social-sign-in"
import { EmailAuthForm } from "@/components/account/email-auth-form"
import { SignOutButton } from "@/components/account/sign-out-button"
import { GarageManager } from "@/components/garage/garage-manager"

type Params = Promise<{ market: string; lang: string }>
type SearchParams = Promise<{ mode?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  return { title: getExtras(store).account.account, robots: { index: false } }
}

export default async function AccountPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { market, lang } = await params
  const { mode } = await searchParams
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const x = getExtras(store)
  const meta = localeMeta(store)
  const user = await getSessionUser(await headers())
  const initialMode = mode === "sign-up" ? "sign-up" : "sign-in"

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: x.account.title }]} />
        <div className="mx-auto flex max-w-md flex-col gap-6 pb-20 pt-6">
          <header className="flex flex-col gap-3">
            <h1 className="font-expanded text-4xl font-extrabold uppercase">{x.account.title}</h1>
            <p className="leading-relaxed text-muted-foreground">{x.account.lead}</p>
          </header>

          <div className="relative overflow-hidden border border-primary/45 bg-secondary p-4 text-secondary-foreground shadow-lifted">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <span className="inline-flex w-fit items-center gap-1.5 bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                  <Tag className="size-3" aria-hidden="true" />
                  {x.memberDiscount.badge}
                </span>
                <p className="pt-1 font-expanded text-base font-extrabold uppercase leading-snug">
                  {x.memberDiscount.accountBannerTitle}
                </p>
                <p className="text-xs leading-relaxed text-secondary-foreground/80">
                  {x.memberDiscount.accountBannerLead}
                </p>
              </div>
              <span className="shrink-0 font-expanded text-3xl font-black leading-none text-primary">
                −7%
              </span>
            </div>
          </div>

          <SocialSignIn enabled={ENABLED_PROVIDERS} />
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {x.account.orEmail}
            <span className="h-px flex-1 bg-border" />
          </div>
          <EmailAuthForm initialMode={initialMode} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {x.account.consent}{" "}
            <Link href={policyHref(store, "terms")} className="underline underline-offset-4">
              {t.checkout.termsLink}
            </Link>
            {" · "}
            <Link href={policyHref(store, "privacy")} className="underline underline-offset-4">
              {t.checkout.privacyLink}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const orders = await getOrdersForUser(user.id, store.market)
  const events = await getShipmentEventsForOrders(orders.map((o) => o.id))
  const date = new Intl.DateTimeFormat(meta.intlLocale, { dateStyle: "medium" })

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: x.account.account }]} />
      <header className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-expanded text-4xl font-extrabold uppercase">{x.account.account}</h1>
            <span className="inline-flex items-center gap-1.5 bg-primary px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {x.memberDiscount.activeBadge}
            </span>
          </div>
          <p className="text-muted-foreground">{fmt(x.account.greeting, { email: user.email })}</p>
        </div>
        <SignOutButton />
      </header>

      <div className="mt-6 flex items-center justify-between gap-4 border border-primary/40 bg-primary/10 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="font-expanded font-bold uppercase">{x.memberDiscount.accountActiveTitle}</span>
            <span className="text-muted-foreground">{x.memberDiscount.accountActiveLead}</span>
          </div>
        </div>
        <span className="shrink-0 font-expanded text-2xl font-black text-primary">−7%</span>
      </div>

      <GarageManager />

      <section aria-labelledby="orders-title" className="flex flex-col gap-4 py-10">
        <h2 id="orders-title" className="label-caps">
          {x.account.orders}
        </h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">{x.account.noOrders}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => {
              const latest = events[order.id]?.[0]
              return (
                <li key={order.id}>
                  <details className="group border border-border bg-card">
                    <summary className="grid cursor-pointer gap-2 p-4 sm:grid-cols-4 sm:items-center">
                      <span className="font-mono font-semibold">{order.orderNumber}</span>
                      <span className="text-sm text-muted-foreground">
                        {x.account.placed}: {date.format(order.createdAt)}
                      </span>
                      <span className="text-sm">
                        {latest
                          ? statusLabel(latest.status, meta.content, latest.carrier)
                          : x.orderStatus[order.status as OrderStatus] ?? order.status}
                      </span>
                      <span className="font-mono tabular-nums sm:text-right">
                        {formatPrice(order.totalCents, order.market as Market, meta.intlLocale)}
                      </span>
                    </summary>
                    <div className="flex flex-col gap-3 border-t border-border p-4 text-sm">
                      <ul className="flex flex-col gap-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-4">
                            <span>
                              {item.quantity} × {item.productName}
                            </span>
                            <span className="font-mono tabular-nums">
                              {formatPrice(item.lineTotalCents, order.market as Market, meta.intlLocale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={storePath(store, `/track/${order.trackingNumber ?? order.orderNumber}`)}
                        className="self-start font-semibold text-primary underline underline-offset-4"
                      >
                        {x.order.track}
                      </Link>
                    </div>
                  </details>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
