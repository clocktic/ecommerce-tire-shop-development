"use client"

import { useState } from "react"
import Image from "next/image"

export function ProductGallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const photos = images.length ? images : ["/placeholder.svg"]
  const [active, setActive] = useState(0)
  const src = photos[Math.min(active, photos.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-52 overflow-hidden bg-photo shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] sm:h-72 lg:aspect-square lg:h-auto">
        <Image
          src={src}
          alt={photos.length > 1 ? `${alt}, ${active + 1} / ${photos.length}` : alt}
          fill
          priority={active === 0}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-contain"
        />
        {badge && (
          <span className="absolute left-4 top-4 bg-background px-2 py-1 font-mono text-xs uppercase tracking-[0.18em] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5">
            {badge}
          </span>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-pressed={index === active}
              aria-label={`${alt} ${index + 1}`}
              onClick={() => setActive(index)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden bg-photo ring-1 ring-inset ${index === active ? "ring-foreground" : "ring-border"}`}
            >
              <Image src={image} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
