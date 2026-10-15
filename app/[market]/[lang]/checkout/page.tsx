import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { CheckoutForm } from "@/components/checkout/checkout-form"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  return { title: getDictionary(store).checkout.title, robots: { index: false } }
}

export default async function CheckoutPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: storePath(store), label: t.common.home },
          { href: storePath(store, "/cart"), label: t.cart.title },
          { label: t.checkout.title },
        ]}
      />
      <h1 className="font-expanded text-4xl font-extrabold uppercase">{t.checkout.title}</h1>
      <CheckoutForm />
    </div>
  )
}
