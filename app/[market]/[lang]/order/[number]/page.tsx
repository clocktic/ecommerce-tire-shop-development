import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { fmt, getDictionary, localeMeta, parseStore, storePath } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { formatPrice, type Market } from "@/lib/markets"
import { getOrderByNumber, maskEmail } from "@/lib/orders"

type Params = Promise<{ market: string; lang: string; number: string }>

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function OrderPage({ params }: { params: Params }) {
  const { market, lang, number } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const order = await getOrderByNumber(decodeURIComponent(number))
  if (!order || order.market !== store.market) notFound()
  const t = getDictionary(store)
  const x = getExtras(store)
  const meta = localeMeta(store)
  const price = (cents: number) => formatPrice(cents, order.market as Market, meta.intlLocale)

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: x.order.title }]} />
      <div className="grid gap-10 pb-20 pt-4 lg:grid-cols-12">
        <section className="flex flex-col gap-6 lg:col-span-7">
          <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
          <h1 className="font-expanded text-4xl font-extrabold uppercase text-balance">{x.order.title}</h1>
          <p className="max-w-xl leading-relaxed">
            {fmt(x.order.lead, { number: order.orderNumber, email: maskEmail(order.email) })}
          </p>
          <p className="max-w-xl border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">{x.order.payment}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={storePath(store, `/track/${order.orderNumber}`)} className={buttonVariants({ size: "lg" })}>
              {x.order.track}
            </Link>
            {order.userId && (
              <Link href={storePath(store, "/account")} className={buttonVariants({ size: "lg", variant: "outline" })}>
                {x.order.viewAccount}
              </Link>
            )}
            <Link href={storePath(store)} className={buttonVariants({ size: "lg", variant: "ghost" })}>
              {x.order.continue}
            </Link>
          </div>
        </section>

        <aside className="flex flex-col gap-4 border border-border bg-card p-5 lg:col-span-5 lg:self-start">
          <div className="flex justify-between gap-4">
            <span className="label-caps text-muted-foreground">{x.order.number}</span>
            <span className="font-mono font-semibold">{order.orderNumber}</span>
          </div>
          <h2 className="label-caps">{x.order.items}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.quantity} × {item.productName}
                </span>
                <span className="font-mono tabular-nums">{price(item.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
              <dd className="font-mono tabular-nums">{price(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.shipping}</dt>
              <dd className="font-mono tabular-nums">{order.shippingCents === 0 ? t.common.free : price(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>{t.cart.total}</dt>
              <dd className="font-mono tabular-nums">{price(order.totalCents)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
