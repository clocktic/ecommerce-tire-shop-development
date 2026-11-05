"use client"

import { useEffect } from "react"

const DELAY_MS = 110
const DURATION_MS = 900
const WHEEL_SRC = "/images/parallax-wheel.webp"

function findCta(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const el = target.closest<HTMLElement>("a, button")
  if (!el || el.matches(":disabled, [aria-disabled='true']")) return null
  if (el.hasAttribute("data-cta-roll") || el.classList.contains("bg-primary")) return el
  return null
}

function rollWheel(host: HTMLElement) {
  const { width, height } = host.getBoundingClientRect()
  if (!width || !height) return

  if (getComputedStyle(host).position === "static") host.style.position = "relative"
  host.style.isolation = "isolate"

  // Clip layer sits behind the button label (z -1 inside the isolated host) and keeps the host's own overflow untouched.
  const clip = document.createElement("span")
  clip.setAttribute("aria-hidden", "true")
  clip.className = "cta-roll-clip"

  const size = Math.round(height * 1.55)
  const wheel = document.createElement("img")
  wheel.src = WHEEL_SRC
  wheel.alt = ""
  wheel.width = size
  wheel.height = size
  wheel.className = "cta-roll-wheel"
  wheel.style.width = `${size}px`
  wheel.style.height = `${size}px`
  wheel.style.top = `${(height - size) / 2}px`
  clip.appendChild(wheel)
  host.appendChild(clip)

  const distance = width + size * 2
  const turns = (distance / (Math.PI * size)) * 360

  const animation = wheel.animate(
    [
      { transform: `translate3d(${-size}px, 0, 0) rotate(0deg)`, opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { opacity: 1, offset: 0.85 },
      { transform: `translate3d(${width + size}px, 0, 0) rotate(${turns}deg)`, opacity: 0 },
    ],
    { duration: DURATION_MS, delay: DELAY_MS, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "both" },
  )
  const cleanup = () => clip.remove()
  animation.onfinish = cleanup
  animation.oncancel = cleanup
}

export function CtaWheelRoll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const preload = new Image()
    preload.src = WHEEL_SRC

    const onClick = (event: MouseEvent) => {
      const host = findCta(event.target)
      if (host) rollWheel(host)
    }
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
