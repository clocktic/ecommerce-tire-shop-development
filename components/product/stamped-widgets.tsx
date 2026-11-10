"use client"

import { useEffect } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"
import {
  STAMPED_PUBLIC_API_KEY,
  STAMPED_STORE_HASH,
  STAMPED_STORE_URL,
  stampedProductId,
} from "@/lib/stamped"

declare global {
  interface Window {
    StampedFn?: {
      init: (options: { apiKey: string; sId: string; storeUrl?: string }) => void
      reloadUGC?: () => void
      loadBadges?: () => void
    }
    jQueryStamped?: (selector: string) => { attr: (name: string) => string | undefined }
    __stampedRichSnippetListenerBound?: boolean
  }
}

function initStampedWidget() {
  if (typeof window === "undefined") return
  if (window.StampedFn?.init) {
    window.StampedFn.init({
      apiKey: STAMPED_PUBLIC_API_KEY,
      sId: STAMPED_STORE_HASH,
      storeUrl: STAMPED_STORE_URL,
    })
  }

  if (!window.__stampedRichSnippetListenerBound) {
    window.__stampedRichSnippetListenerBound = true
    document.addEventListener("stamped:reviews:loaded", () => {
      if (typeof window.jQueryStamped === "undefined") return
      const ratingCountRaw = window.jQueryStamped('meta[itemprop="reviewCount"]').attr("content")
      const ratingValueRaw = window.jQueryStamped('meta[itemprop="ratingValue"]').attr("content")
      const ratingCount = Number.parseInt(ratingCountRaw ?? "", 10)
      const ratingValue = Number.parseFloat(ratingValueRaw ?? "")

      const existing = document.querySelector('script[data-stamped-rich-snippet="true"]')
      if (existing) existing.remove()

      if (!(ratingValue > 0) || !(ratingCount > 0)) return

      const richSnippet = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${window.location.href.split("#")[0]}#product`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue,
          reviewCount: ratingCount,
        },
      }

      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.setAttribute("data-stamped-rich-snippet", "true")
      script.innerHTML = JSON.stringify(richSnippet)
      document.head.appendChild(script)
    })
  }
}

export function StampedScript() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    const timer = window.setTimeout(() => {
      if (window.StampedFn?.reloadUGC) {
        window.StampedFn.reloadUGC()
      } else if (window.StampedFn?.init) {
        initStampedWidget()
      }
    }, 150)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <Script
      id="stamped-widget-script"
      src="https://cdn1.stamped.io/files/widget.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        initStampedWidget()
      }}
    />
  )
}

export function StampedStarBadge({
  productSlug,
  productTitle,
  productType,
  productBrand,
}: {
  productSlug: string
  productTitle: string
  productType?: string
  productBrand?: string
}) {
  const numericId = stampedProductId(productSlug)
  return (
    <span
      className="stamped-product-reviews-badge stamped-main-badge inline-flex items-center text-xs"
      data-id={numericId}
      data-product-sku={productSlug}
      data-product-title={productTitle}
      data-product-type={productType}
      data-product-brand={productBrand}
    />
  )
}

export function StampedMainWidget({
  productSlug,
  name,
  url,
  imageUrl,
  description,
  productType,
  productBrand,
  lang,
}: {
  productSlug: string
  name: string
  url: string
  imageUrl: string
  description: string
  productType?: string
  productBrand?: string
  lang?: string
}) {
  const numericId = stampedProductId(productSlug)

  useEffect(() => {
    if (typeof window === "undefined") return
    const timer = window.setTimeout(() => {
      if (window.StampedFn?.reloadUGC) {
        window.StampedFn.reloadUGC()
      }
    }, 100)
    return () => window.clearTimeout(timer)
  }, [numericId, lang])

  return (
    <section className="border-t border-border pt-10 sm:pt-12">
      <div
        id="stamped-main-widget"
        data-product-id={numericId}
        data-name={name}
        data-url={url}
        data-image-url={imageUrl}
        data-description={description}
        data-product-sku={productSlug}
        data-product-type={productType}
        data-product-brand={productBrand}
        data-widget-language={lang}
      />
    </section>
  )
}
