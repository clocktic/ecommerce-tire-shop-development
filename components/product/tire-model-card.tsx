'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { ProductFitmentBadge } from '@/components/garage/product-fitment-badge'
import { useGarage } from '@/components/garage/garage-provider'
import { tireSize, tireServiceDescription, type TireProduct } from '@/lib/catalog/types'
import { getDictionary, storePath, type Store } from '@/lib/i18n'
import { tireReferenceCopy } from '@/lib/i18n/tire-reference'
import { Price } from './price'
import { EuTyreLabel } from './eu-tyre-label'
import { EprelReference } from './eprel-reference'
import { BrandMark } from './brand-mark'

export type TireCardVariant = Pick<TireProduct, 'id' | 'slug' | 'brand' | 'name' | 'mpn' | 'gtin' | 'images' | 'offers' | 'tire'>

export function TireModelCard({ variants, store }: { variants: TireCardVariant[]; store: Store }) {
  const id = useId()
  const { active } = useGarage()
  const { add } = useCart()
  const garageMatch = active
    ? variants.find(
        p => p.tire.width === active.width && p.tire.aspect === active.aspect && p.tire.rim === active.rim,
      )
    : undefined
  const defaultProduct =
    garageMatch ||
    (store.market === 'eu' && (variants.find(p => p.tire.euLabel?.eprelId) || variants.find(p => p.tire.euLabel))) ||
    variants[0]
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const product = variants.find(p => p.id === selectedId) || defaultProduct
  const offer = product.offers[store.market]!
  const t = getDictionary(store)
  const labels = tireReferenceCopy(store.lang, store.market)
  const size = tireSize(product.tire)
  const sizes = [...new Set(variants.map(p => tireSize(p.tire)))]
  const sameSize = variants.filter(p => tireSize(p.tire) === size)
  const href = storePath(store, `/product/${product.slug}`)

  return (
    <article className="flex min-w-0 flex-col border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground">
      <Link href={href} className="group relative h-36 overflow-hidden bg-white sm:h-48">
        <Image
          src={product.images[0]}
          alt={`${product.brand} ${product.tire.model || product.name}`}
          fill
          quality={95}
          sizes="(min-width:1024px) 260px,(min-width:768px) 300px,(min-width:640px) 45vw,90vw"
          className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03] sm:p-6"
        />
        <span className="absolute right-2.5 top-2.5 border border-border/80 bg-background/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-xs">
          {t.labels.season[product.tire.season]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <BrandMark brand={product.brand} size="xs" />
          <ProductFitmentBadge
            compact
            target={{
              category: 'tires',
              width: product.tire.width,
              aspect: product.tire.aspect,
              rim: product.tire.rim,
            }}
          />
        </div>
        <h3 className="font-semibold leading-snug">
          <Link href={href} className="hover:text-primary">{product.tire.model || product.name}</Link>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={`${id}-size`} className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {labels.size} ({sizes.length})
            </label>
            <select
              id={`${id}-size`}
              value={size}
              onChange={e => {
                const choices = variants.filter(p => tireSize(p.tire) === e.target.value)
                setSelectedId(
                  ((store.market === 'eu' && (choices.find(p => p.tire.euLabel?.eprelId) || choices.find(p => p.tire.euLabel))) ||
                    choices[0]).id,
                )
              }}
              className="h-10 w-full min-w-0 border border-border bg-background px-2 font-mono text-xs font-semibold"
            >
              {sizes.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={`${id}-article`} className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {labels.variants}
            </label>
            <select
              id={`${id}-article`}
              value={product.id}
              onChange={e => setSelectedId(e.target.value)}
              className="h-10 w-full min-w-0 border border-border bg-background px-2 font-mono text-xs"
            >
              {sameSize.map(p => (
                <option key={p.id} value={p.id}>
                  {tireServiceDescription(p.tire)}
                  {p.tire.runFlat ? ' · RFT' : ''} · {p.mpn || p.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
            <span className="truncate">MPN: <strong className="font-normal text-foreground">{product.mpn || '—'}</strong></span>
            {product.gtin && <span className="truncate">EAN: {product.gtin}</span>}
          </div>
          {store.market === 'eu' && product.tire.euLabel && t.product.euLabel && (
            <EuTyreLabel label={product.tire.euLabel} text={t.product.euLabel} compact />
          )}
          {store.market === 'eu' && <EprelReference id={product.tire.euLabel?.eprelId} lang={store.lang} />}
          <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border pt-2.5">
            <Price offer={offer} store={store} />
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.labels.availability[offer.availability]}
            </span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <Link href={href} className="text-xs font-semibold uppercase tracking-wider underline underline-offset-4 hover:text-primary sm:text-sm sm:normal-case sm:tracking-normal">
            {labels.view} →
          </Link>
          <Button
            type="button"
            size="sm"
            disabled={offer.availability === 'out_of_stock'}
            onClick={() =>
              add({
                slug: product.slug,
                name: product.name,
                image: product.images[0] || '/placeholder.svg',
                priceCents: offer.priceCents,
                quantity: 4,
              })
            }
            className="h-10 gap-1.5 px-4 font-mono text-xs font-bold uppercase"
          >
            <ShoppingBag className="size-3.5" aria-hidden="true" />
            <span>+ 4×</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
