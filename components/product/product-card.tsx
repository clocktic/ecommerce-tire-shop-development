import Image from "next/image"
import Link from "next/link"
import { offerFor, tireServiceDescription, tireSize, type Product } from "@/lib/catalog"
import { getDictionary, storePath, type Dictionary, type Store } from "@/lib/i18n"
import { Price } from "@/components/product/price"
import { EuTyreLabel } from "@/components/product/eu-tyre-label"
import { BrandMark } from "@/components/product/brand-mark"
import { StampedStarBadge } from "@/components/product/stamped-widgets"

export function productCode(product: Product, t: Dictionary): { code: string; meta: string } {
  const { season, brakeKind, axle } = t.labels
  if (product.category === "tires") {
    return { code: tireSize(product.tire), meta: `${tireServiceDescription(product.tire)} · ${season[product.tire.season]}` }
  }
  if (product.category === "wheels") {
    const w = product.wheel
    const constr = t.catalog.constructionLabels[w.construction] ?? w.construction
    return { code: `${w.diameter}×${w.width} ${w.boltPattern.replace("x", "×")}`, meta: `ET${w.offset} · ${constr}` }
  }
  const b = product.brake
  return {
    code: b.discDiameterMm ? `Ø${b.discDiameterMm} mm` : brakeKind[b.kind],
    meta: `${brakeKind[b.kind]} · ${axle[b.axle]}`,
  }
}

export function ProductCard({ product, store }: { product: Product; store: Store }) {
  const offer = offerFor(product, store.market)
  if (!offer) return null
  const t = getDictionary(store)
  const { code, meta } = productCode(product, t)

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden border border-border bg-card shadow-lifted lift-hover hover:border-foreground/60">
      <div className="relative m-1.5 mb-0 h-36 overflow-hidden rounded-[var(--radius-lg)] bg-white sm:h-48">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          quality={95}
          sizes="(min-width: 1024px) 260px, (min-width: 768px) 300px, (min-width: 640px) 45vw, 50vw"
          className="object-contain p-4 transition-transform duration-700 ease-out group-hover:-rotate-6 group-hover:scale-[1.05] motion-reduce:transition-none sm:p-6"
        />
        {product.sample && (
          <span className="rounded-md absolute left-2 top-2 bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] shadow-chip sm:left-3 sm:top-3 sm:px-2 sm:py-1 sm:text-xs">
            {t.product.demo}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <BrandMark brand={product.brand} size="xs" />
          <h3 className="line-clamp-2 text-pretty text-xs font-semibold leading-snug sm:text-base">
            <Link href={storePath(store, `/product/${product.slug}`)} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          <StampedStarBadge
            productSlug={product.slug}
            productTitle={product.name}
            productType={product.category}
            productBrand={product.brand}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="truncate font-mono text-xs font-semibold sm:text-sm">{code}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground sm:text-xs">{meta}</p>
          {(product.mpn || product.gtin) && (
            <p className="mt-0.5 hidden truncate font-mono text-[11px] text-muted-foreground/85 sm:block">
              {product.mpn ? `MPN: ${product.mpn}` : ""}
              {product.mpn && product.gtin ? " · " : ""}
              {product.gtin ? `EAN: ${product.gtin}` : ""}
            </p>
          )}
        </div>
        {t.product.euLabel && product.category === "tires" && product.tire.euLabel && (
          <EuTyreLabel label={product.tire.euLabel} text={t.product.euLabel} compact />
        )}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-1.5 border-t border-border pt-2.5 transition-colors duration-300 group-hover:border-primary/50 sm:gap-2 sm:pt-3">
          <Price offer={offer} store={store} />
          <span className="text-right font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:text-xs">
            {t.labels.availability[offer.availability]}
          </span>
        </div>
      </div>
    </article>
  )
}
