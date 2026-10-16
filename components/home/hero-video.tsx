"use client"

import { useEffect, useRef } from "react"

export function HeroVideo({ label }: { label: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const holdLastFrame = () => {
      if (Number.isFinite(video.duration)) video.currentTime = Math.max(0, video.duration - 0.05)
    }
    const apply = () => {
      if (motion.matches) {
        video.pause()
        if (video.readyState >= 1) holdLastFrame()
        else video.addEventListener("loadedmetadata", holdLastFrame, { once: true })
        return
      }
      void video.play().catch(() => {})
    }

    apply()
    motion.addEventListener("change", apply)
    return () => motion.removeEventListener("change", apply)
  }, [])

  return (
    <video
      ref={ref}
      className="absolute inset-0 size-full object-cover object-center lg:inset-auto lg:top-0 lg:left-[34%] lg:h-full lg:w-auto lg:max-w-none lg:-translate-x-1/2 lg:[mask-image:linear-gradient(to_right,#000_74%,transparent)]"
      autoPlay
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-label={label}
    >
      <source src="/videos/hero-wheel.mp4" type="video/mp4" />
    </video>
  )
}
