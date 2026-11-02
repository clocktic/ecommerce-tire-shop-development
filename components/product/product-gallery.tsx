"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"

const GALLERY_NAV_LABELS: Record<string, { prev: string; next: string }> = {
  en: { prev: "Previous image", next: "Next image" },
  de: { prev: "Vorheriges Bild", next: "Nächstes Bild" },
  fr: { prev: "Image précédente", next: "Image suivante" },
  it: { prev: "Immagine precedente", next: "Immagine successiva" },
  es: { prev: "Imagen anterior", next: "Imagen siguiente" },
  nl: { prev: "Vorige afbeelding", next: "Volgende afbeelding" },
}

export function ProductGallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const { store } = useI18n()
  const navLabels = GALLERY_NAV_LABELS[store.lang] ?? GALLERY_NAV_LABELS.en
  const photos = images.length ? images : ["/placeholder.svg"]
  const [active, setActive] = useState(0)
  const currentIndex = Math.min(active, photos.length - 1)
  const src = photos[currentIndex]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-64 overflow-hidden border border-border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] sm:h-72 md:h-[340px] lg:h-[380px]">
        <Image
          src={src}
          alt={photos.length > 1 ? `${alt}, ${currentIndex + 1} / ${photos.length}` : alt}
          fill
          priority={currentIndex === 0}
          quality={95}
          sizes="(min-width: 1024px) 420px, (min-width: 768px) 360px, 100vw"
          className="object-contain p-6 sm:p-9 lg:p-11"
        />
        {badge && (
          <span className="absolute left-3 top-3 bg-background px-2 py-1 font-mono text-xs uppercase tracking-[0.18em] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] sm:left-4 sm:top-4">
            {badge}
          </span>
        )}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((i) => (i - 1 + photos.length) % photos.length)}
              aria-label={navLabels.prev}
              className="absolute left-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground shadow-md transition-colors hover:border-primary hover:text-primary md:hidden"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % photos.length)}
              aria-label={navLabels.next}
              className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground shadow-md transition-colors hover:border-primary hover:text-primary md:hidden"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <span className="absolute bottom-2.5 right-2.5 border border-border bg-background/90 px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-foreground">
              {currentIndex + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-pressed={index === currentIndex}
              aria-label={`${alt} ${index + 1}`}
              onClick={() => setActive(index)}
              className={`relative size-16 shrink-0 overflow-hidden bg-white ring-1 ring-inset transition-opacity ${index === currentIndex ? "ring-2 ring-primary" : "ring-border opacity-75 hover:opacity-100"}`}
            >
              <Image src={image} alt="" fill quality={90} sizes="96px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
