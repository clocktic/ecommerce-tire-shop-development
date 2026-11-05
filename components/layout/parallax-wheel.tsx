"use client"

import { useEffect, useRef } from "react"

const IDLE_DEG_PER_SEC = 2.2
const SCROLL_DEG_PER_PX = 0.035
const DRIFT_PX_PER_PX = 0.04
const MAX_DRIFT_PX = 90
const EASE = 0.045

export function ParallaxWheel() {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let idle = 0
    let scrollRot = window.scrollY * SCROLL_DEG_PER_PX
    let drift = Math.min(window.scrollY * DRIFT_PX_PER_PX, MAX_DRIFT_PX)
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000
      last = now
      const y = window.scrollY
      idle += IDLE_DEG_PER_SEC * dt
      // Frame-rate independent easing so the wheel glides to the scroll target instead of snapping.
      const k = 1 - Math.pow(1 - EASE, dt * 60)
      scrollRot += (y * SCROLL_DEG_PER_PX - scrollRot) * k
      drift += (Math.min(y * DRIFT_PX_PER_PX, MAX_DRIFT_PX) - drift) * k
      img.style.transform = `translate3d(0, ${-drift}px, 0) rotate(${idle + scrollRot}deg)`
      frame = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <div className="parallax-wheel">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative fixed backdrop, pre-optimized webp */}
      <img
        ref={imgRef}
        src="/images/parallax-wheel.webp"
        alt=""
        width={1400}
        height={1400}
        decoding="async"
        draggable={false}
        className="parallax-wheel-img"
      />
    </div>
  )
}
