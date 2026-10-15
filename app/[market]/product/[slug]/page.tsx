import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Truck, RotateCcw, ShieldCheck } from "lucide-react"
import { getAllProductSlugs, getCategory, getProductBySlug, getProductsByCategory, offerFor } from "@/lib/catalog"
import { MARKETS, isMarket, markets, otherMarket, type Market } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import { marketAlternates } from "@/lib/seo"
import { productJsonLd } from "@/lib/structured-data"
import { policyHref } from "@/lib/legal/pages"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { AddToCart } from "@/components/product/add-to-cart"
import { EuTyreLabel } from "@/components/product/eu-tyre-label"
import { Price, AVAILABILITY_LABEL } from "@/components/product/price"
import { ProductCard, productCode } from "@/components/product/product-card"
import { ProductDetails } from "@/components/product/product-details"
import { Utqg } from "@/components/product/utqg"

type Params = Promise<{ market: string; slug: string }>

export function generateStaticParams() {
  return markets.flatMap((market) => getAllProductSlugs().map((slug) => ({ market, slug })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, slug } = await params
  const product = getProductBySlug(slug)
  if (!product || !isMarket(market)) return {}
  const availableIn = markets.filter((m) => product.offers[m])
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: marketAlternates(market, `/product/${slug}`, availableIn),
    robots: product.sample || !product.offers[market] ? { index: false, follow: true } : undefined,
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { market, slug } = await params
  if (!isMarket(market)) notFound()
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const category = getCategory(product.category)
  const offer = offerFor(product, market)

  if (!offer) return <NotInMarket market={market} name={product.name} slug={slug} />

  const { code, meta } = productCode(product)
  const policy = POLICIES[market]
  const jsonLd = productJsonLd(product, market)
  const related = getProductsByCategory(market, product.category).filter((p) => p.slug !== product.slug).slice(0, 4)
  const defaultQuantity = product.category === "brakes" ? 1 : 4

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs
        items={[
          { href: `/${market}`, label: "Home" },
          { href: `/${market}/${category.slug}`, label: category.name },
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
                Demo product
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
            <Price offer={offer} market={market} size="lg" showNote />
            <span className="font-mono text-xs uppercase tracking-[0.12em]">{AVAILABILITY_LABEL[offer.availability]}</span>
          </div>

          {product.category === "tires" && market === "eu" && product.tire.euLabel && (
            <EuTyreLabel label={product.tire.euLabel} />
          )}
          {product.category === "tires" && market === "us" && product.tire.utqg && <Utqg grades={product.tire.utqg} />}

          <AddToCart
            slug={product.slug}
            name={product.name}
            image={product.images[0]}
            priceCents={offer.priceCents}
            defaultQuantity={defaultQuantity}
            disabled={offer.availability === "out_of_stock"}
          />
          {product.sample && (
            <p className="text-sm text-muted-foreground">
              Demo listing to preview the layout and cart. It is hidden from search and feeds, and is replaced by real
              products after the catalog import.
            </p>
          )}

          <ul className="flex flex-col divide-y divide-border border border-border bg-card text-sm">
            <li className="flex items-start gap-3 p-4">
              <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">
                  {policy.shipping.freeShipping ? "Free delivery" : "Delivery"} in {deliveryLabel(market)}
                </span>
                <span className="block text-muted-foreground">
                  To {policy.shipping.area}. Orders before {policy.shipping.cutoff} leave within{" "}
                  {policy.shipping.handlingDays[0]}–{policy.shipping.handlingDays[1]} business days.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3 p-4">
              <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">
                  {policy.returns.windowDays}-day {market === "eu" ? "right of withdrawal" : "returns"}
                </span>
                <span className="block text-muted-foreground">
                  Unmounted and unused.{" "}
                  <Link href={policyHref(market, "returns")} className="underline underline-offset-4">
                    Return policy
                  </Link>
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{market === "eu" ? "2-year legal guarantee" : "Manufacturer warranty"}</span>
                <span className="block text-muted-foreground">{policy.warranty.summary}</span>
              </span>
            </li>
          </ul>

          <ProductDetails product={product} market={market} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-border pt-12">
          <h2 id="related-title" className="mb-6 font-expanded text-xl font-extrabold uppercase">
            More {category.name.toLowerCase()}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} market={market} />
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

function NotInMarket({ market, name, slug }: { market: Market; name: string; slug: string }) {
  const other = otherMarket(market)
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-24 md:px-6">
      <p className="label-caps text-primary">Not sold in the {MARKETS[market].short} store</p>
      <h1 className="text-balance font-expanded text-2xl font-extrabold uppercase">{name}</h1>
      <p className="leading-relaxed text-muted-foreground">
        This item is approved and stocked for the {MARKETS[other].name} only. Tires, wheels and brake parts must carry the
        markings required where they are fitted, so each store lists only what it can legally sell.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href={`/${market}`} className="underline underline-offset-4">
          Back to the {MARKETS[market].short} store
        </Link>
        <Link href={`/${other}/product/${slug}`} className="underline underline-offset-4">
          View in the {MARKETS[other].short} store
        </Link>
      </div>
    </div>
  )
}
