"use client"

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  children: ReactNode
  labelledBy: string
  prevLabel: string
  nextLabel: string
}

export function ProductCarousel({ children, labelledBy, prevLabel, nextLabel }: Props) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateEdges()
    const observer = new ResizeObserver(updateEdges)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateEdges])

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduceMotion ? "auto" : "smooth" })
  }

  const buttonClass =
    // Track has pb-6 for card shadows, so center on the cards rather than the whole track.
    "absolute top-[calc(50%-0.75rem)] z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-border bg-card/95 text-foreground shadow-lg backdrop-blur transition-[color,background-color,border-color,opacity] hover:border-foreground hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

  return (
    <div role="region" aria-roledescription="carousel" aria-labelledby={labelledBy} className="relative">
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-6 pt-1 [scrollbar-width:none] sm:gap-4 md:-mx-6 md:scroll-px-6 md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="flex shrink-0 basis-[calc((100%-0.75rem)/2.15)] snap-start sm:basis-[calc((100%-2rem)/2.6)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)] [&>*]:w-full">
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={edges.start}
        aria-label={prevLabel}
        className={`${buttonClass} left-0 md:-left-5`}
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={edges.end}
        aria-label={nextLabel}
        className={`${buttonClass} right-0 md:-right-5`}
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </div>
  )
}
