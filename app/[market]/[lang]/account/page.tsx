import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
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
import { SignOutButton } from "@/components/account/sign-out-button"
import { GarageManager } from "@/components/garage/garage-manager"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  return { title: getExtras(store).account.account, robots: { index: false } }
}

export default async function AccountPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const x = getExtras(store)
  const meta = localeMeta(store)
  const user = await getSessionUser(await headers())

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: x.account.title }]} />
        <div className="mx-auto flex max-w-md flex-col gap-6 pb-20 pt-6">
          <header className="flex flex-col gap-3">
            <h1 className="font-expanded text-4xl font-extrabold uppercase">{x.account.title}</h1>
            <p className="leading-relaxed text-muted-foreground">{x.account.lead}</p>
          </header>
          <SocialSignIn enabled={ENABLED_PROVIDERS} />
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
          <h1 className="font-expanded text-4xl font-extrabold uppercase">{x.account.account}</h1>
          <p className="text-muted-foreground">{fmt(x.account.greeting, { email: user.email })}</p>
        </div>
        <SignOutButton />
      </header>

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
