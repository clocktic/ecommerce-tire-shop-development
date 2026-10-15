import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { CartView } from "@/components/cart/cart-view"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  return { title: getDictionary(store).cart.title, robots: { index: false } }
}

export default async function CartPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: t.cart.title }]} />
      <h1 className="font-expanded text-4xl font-extrabold uppercase">{t.cart.title}</h1>
      <CartView />
    </div>
  )
}
