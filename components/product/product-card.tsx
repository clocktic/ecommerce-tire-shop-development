import Image from "next/image"
import Link from "next/link"
import { offerFor, tireServiceDescription, tireSize, SEASON_LABEL, BRAKE_KIND_LABEL, type Product } from "@/lib/catalog"
import type { Market } from "@/lib/markets"
import { Price, AVAILABILITY_LABEL } from "@/components/product/price"
import { EuTyreLabel } from "@/components/product/eu-tyre-label"

export function productCode(product: Product): { code: string; meta: string } {
  if (product.category === "tires") {
    return { code: tireSize(product.tire), meta: `${tireServiceDescription(product.tire)} · ${SEASON_LABEL[product.tire.season]}` }
  }
  if (product.category === "wheels") {
    const w = product.wheel
    return { code: `${w.diameter}×${w.width} ${w.boltPattern.replace("x", "×")}`, meta: `ET${w.offset} · ${w.construction}` }
  }
  const b = product.brake
  return {
    code: b.discDiameterMm ? `Ø${b.discDiameterMm} mm` : BRAKE_KIND_LABEL[b.kind],
    meta: `${BRAKE_KIND_LABEL[b.kind]} · ${b.axle === "front" ? "Front axle" : "Rear axle"}`,
  }
}

export function ProductCard({ product, market }: { product: Product; market: Market }) {
  const offer = offerFor(product, market)
  if (!offer) return null
  const { code, meta } = productCode(product)

  return (
    <article className="group relative flex flex-col border border-border bg-card transition-colors hover:border-foreground">
      <div className="relative aspect-square overflow-hidden bg-photo">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.sample && (
          <span className="absolute left-3 top-3 bg-background px-2 py-1 font-mono text-xs uppercase tracking-[0.18em]">
            Demo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <p className="label-caps text-muted-foreground">{product.brand}</p>
          <h3 className="text-pretty font-semibold leading-snug">
            <Link href={`/${market}/product/${product.slug}`} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="font-mono text-sm font-semibold">{code}</p>
          <p className="font-mono text-xs text-muted-foreground">{meta}</p>
        </div>
        {market === "eu" && product.category === "tires" && product.tire.euLabel && (
          <EuTyreLabel label={product.tire.euLabel} compact />
        )}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3">
          <Price offer={offer} market={market} />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {AVAILABILITY_LABEL[offer.availability]}
          </span>
        </div>
      </div>
    </article>
  )
}
