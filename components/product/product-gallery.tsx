"use client"

import { useState } from "react"
import Image from "next/image"

export function ProductGallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const photos = images.length ? images : ["/placeholder.svg"]
  const [active, setActive] = useState(0)
  const src = photos[Math.min(active, photos.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-60 overflow-hidden border border-border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] sm:h-72 md:h-[340px] lg:h-[380px]">
        <Image
          src={src}
          alt={photos.length > 1 ? `${alt}, ${active + 1} / ${photos.length}` : alt}
          fill
          priority={active === 0}
          quality={95}
          sizes="(min-width: 1024px) 420px, (min-width: 768px) 360px, 100vw"
          className="object-contain p-7 sm:p-9 lg:p-11"
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
              className={`relative h-16 w-16 shrink-0 overflow-hidden bg-white ring-1 ring-inset ${index === active ? "ring-2 ring-foreground" : "ring-border opacity-80 hover:opacity-100"}`}
            >
              <Image src={image} alt="" fill quality={90} sizes="96px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
