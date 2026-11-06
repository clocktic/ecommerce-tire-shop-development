"use client"

import { useEffect, useRef } from "react"

const TREADS = [
  { side: "left", speed: 0.3 },
  { side: "right", speed: 0.48 },
] as const

/** Height / width of one tile of /images/tread-mask.svg; the pattern repeats with this period. */
const TILE_ASPECT = 72 / 180
const EASE = 0.09

export function ParallaxTreads() {
  const movers = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let y = window.scrollY
    let periods: number[] = []
    let frame = 0
    let last = performance.now()

    // Shifting by the scroll offset modulo one tile keeps the tread endless with a short element.
    const apply = () => {
      movers.current.forEach((el, i) => {
        if (!el || !periods[i]) return
        el.style.transform = `translate3d(0, ${-((y * TREADS[i].speed) % periods[i])}px, 0)`
      })
    }

    const measure = () => {
      periods = movers.current.map((el) => (el?.offsetWidth ?? 0) * TILE_ASPECT)
      apply()
    }

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000
      last = now
      const target = window.scrollY
      const k = 1 - Math.pow(1 - EASE, dt * 60)
      y += (target - y) * k
      if (Math.abs(target - y) < 0.1) {
        y = target
        frame = 0
      } else {
        frame = requestAnimationFrame(tick)
      }
      apply()
    }

    const onScroll = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", measure)
    }
  }, [])

  return (
    <>
      {TREADS.map((tread, i) => (
        <div key={tread.side} className={`parallax-tread-track parallax-tread-track--${tread.side}`}>
          <div
            ref={(el) => {
              movers.current[i] = el
            }}
            className="parallax-tread-mover"
          >
            <div className="parallax-tread-rubber" />
          </div>
        </div>
      ))}
    </>
  )
}
