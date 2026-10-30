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
  const labels = tireReferenceCopy(store.lang)
  const size = tireSize(product.tire)
  const sizes = [...new Set(variants.map(p => tireSize(p.tire)))]
  const sameSize = variants.filter(p => tireSize(p.tire) === size)
  const href = storePath(store, `/product/${product.slug}`)

  return (
    <article className="flex min-w-0 flex-col border border-border bg-card transition-colors hover:border-foreground">
      <Link href={href} className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={product.images[0]}
          alt={`${product.brand} ${product.tire.model || product.name}`}
          fill
          sizes="(min-width:1024px) 25vw,(min-width:640px) 50vw,100vw"
          className="object-contain p-4"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <p className="label-caps text-muted-foreground">{product.brand}</p>
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
          <Link href={href}>{product.tire.model || product.name}</Link>
        </h3>
        <p className="font-mono text-xs text-muted-foreground">{t.labels.season[product.tire.season]}</p>
        <label htmlFor={`${id}-size`} className="text-xs text-muted-foreground">
          {labels.size}
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
          className="h-11 w-full min-w-0 border border-border bg-background px-2 text-sm"
        >
          {sizes.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label htmlFor={`${id}-article`} className="text-xs text-muted-foreground">
          {labels.variants}
        </label>
        <select
          id={`${id}-article`}
          value={product.id}
          onChange={e => setSelectedId(e.target.value)}
          className="h-11 w-full min-w-0 border border-border bg-background px-2 text-sm"
        >
          {sameSize.map(p => (
            <option key={p.id} value={p.id}>
              {tireServiceDescription(p.tire)}
              {p.tire.runFlat ? ' · Run-flat' : ''} · {p.mpn || p.id}
              {p.gtin ? ` · ${p.gtin}` : ''}
            </option>
          ))}
        </select>
        <div aria-live="polite" className="flex flex-col gap-3">
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-xs">
            <dt>MPN</dt>
            <dd className="break-all text-right font-mono">{product.mpn || '—'}</dd>
            <dt>EAN / GTIN</dt>
            <dd className="break-all text-right font-mono">{product.gtin || '—'}</dd>
          </dl>
          {store.market === 'eu' && product.tire.euLabel && t.product.euLabel && (
            <EuTyreLabel label={product.tire.euLabel} text={t.product.euLabel} compact />
          )}
          {store.market === 'eu' && <EprelReference id={product.tire.euLabel?.eprelId} lang={store.lang} />}
          <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border pt-3">
            <Price offer={offer} store={store} />
            <span className="text-xs text-muted-foreground">{t.labels.availability[offer.availability]}</span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Link href={href} className="text-sm font-semibold underline underline-offset-4 hover:text-primary">
            {labels.view} →
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
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
            className="gap-1.5 font-mono text-xs font-semibold uppercase"
          >
            <ShoppingBag className="size-3.5 text-primary" aria-hidden="true" />
            <span>+ 4×</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
