import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Truck, RotateCcw, ShieldCheck } from "lucide-react"
import { localizeProduct, offerFor } from "@/lib/catalog"
import { getProductBySlug, getProductsByCategory } from "@/lib/catalog/queries"
import { counterpart, fmt, getDictionary, parseStore, storePath, type Store } from "@/lib/i18n"
import { markets } from "@/lib/markets"
import { storeAlternates } from "@/lib/seo"
import { productJsonLd } from "@/lib/structured-data"
import { policyHref } from "@/lib/legal/pages"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { AddToCart } from "@/components/product/add-to-cart"
import { EuTyreLabel } from "@/components/product/eu-tyre-label"
import { Price } from "@/components/product/price"
import { ProductCard, productCode } from "@/components/product/product-card"
import { ProductDetails } from "@/components/product/product-details"
import { Utqg } from "@/components/product/utqg"

type Params = Promise<{ market: string; lang: string; slug: string }>

// Products come from the database and change from the admin, so pages render on request.
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang, slug } = await params
  const store = parseStore(market, lang)
  const base = await getProductBySlug(slug)
  if (!base || !store) return {}
  const product = localizeProduct(base, store)
  const availableIn = markets.filter((m) => product.offers[m])
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: storeAlternates(store, `/product/${slug}`, availableIn),
    robots: product.sample || !product.offers[store.market] ? { index: false, follow: true } : undefined,
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { market, lang, slug } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const base = await getProductBySlug(slug)
  if (!base) notFound()

  const t = getDictionary(store)
  const product = localizeProduct(base, store)
  const offer = offerFor(product, store.market)

  if (!offer) return <NotInMarket store={store} name={product.name} slug={slug} />

  const { code, meta } = productCode(product, t)
  const categoryName = t.categories[product.category].name
  const jsonLd = productJsonLd(product, store)
  const related = (await getProductsByCategory(store.market, product.category))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4)
    .map((p) => localizeProduct(p, store))
  const defaultQuantity = product.category === "brakes" ? 1 : 4

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: storePath(store), label: t.common.home },
          { href: storePath(store, `/${product.category}`), label: categoryName },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 pb-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="relative aspect-square overflow-hidden bg-photo">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            {product.sample && (
              <span className="absolute left-4 top-4 bg-background px-2 py-1 font-mono text-xs uppercase tracking-[0.18em]">
                {t.product.demoProduct}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-col gap-3">
            <p className="label-caps text-muted-foreground">{product.brand}</p>
            <h1 className="text-balance font-expanded text-2xl font-extrabold uppercase leading-tight md:text-3xl">
              {product.name}
            </h1>
            <p className="font-mono text-sm">
              <span className="font-semibold">{code}</span>
              <span className="text-muted-foreground"> · {meta}</span>
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 border-y border-border py-4">
            <Price offer={offer} store={store} size="lg" showNote />
            <span className="text-right font-mono text-xs uppercase tracking-[0.12em]">
              {t.labels.availability[offer.availability]}
            </span>
          </div>

          {product.category === "tires" && t.product.euLabel && product.tire.euLabel && (
            <EuTyreLabel label={product.tire.euLabel} text={t.product.euLabel} />
          )}
          {product.category === "tires" && t.product.utqg && product.tire.utqg && (
            <Utqg grades={product.tire.utqg} text={t.product.utqg} />
          )}

          <AddToCart
            slug={product.slug}
            name={product.name}
            image={product.images[0]}
            priceCents={offer.priceCents}
            defaultQuantity={defaultQuantity}
            disabled={offer.availability === "out_of_stock"}
          />
          {product.sample && <p className="text-sm text-muted-foreground">{t.product.demoNote}</p>}

          <ul className="flex flex-col divide-y divide-border border border-border bg-card text-sm">
            <li className="flex items-start gap-3 p-4">
              <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{t.product.deliveryTitle}</span>
                <span className="block text-muted-foreground">{t.product.deliveryText}</span>
              </span>
            </li>
            <li className="flex items-start gap-3 p-4">
              <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{t.product.returnsTitle}</span>
                <span className="block text-muted-foreground">
                  {t.product.returnsText}{" "}
                  <Link href={policyHref(store, "returns")} className="underline underline-offset-4">
                    {t.product.returnsLink}
                  </Link>
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{t.product.warrantyTitle}</span>
                <span className="block text-muted-foreground">{t.policy.warranty}</span>
              </span>
            </li>
          </ul>

          <ProductDetails product={product} store={store} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-border pt-12">
          <h2 id="related-title" className="mb-6 font-expanded text-xl font-extrabold uppercase">
            {fmt(t.product.related, { category: categoryName.toLowerCase() })}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} store={store} />
            ))}
          </div>
        </section>
      )}

      {jsonLd && !product.sample && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  )
}

function NotInMarket({ store, name, slug }: { store: Store; name: string; slug: string }) {
  const t = getDictionary(store)
  const other = counterpart(store)
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-24 md:px-6">
      <p className="label-caps text-primary">{t.product.notSold.eyebrow}</p>
      <h1 className="text-balance font-expanded text-2xl font-extrabold uppercase">{name}</h1>
      <p className="leading-relaxed text-muted-foreground">{t.product.notSold.text}</p>
      <div className="flex flex-wrap gap-4">
        <Link href={storePath(store)} className="underline underline-offset-4">
          {t.product.notSold.back}
        </Link>
        <Link href={storePath(other, `/product/${slug}`)} className="underline underline-offset-4">
          {t.product.notSold.view}
        </Link>
      </div>
    </div>
  )
}
