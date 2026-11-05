import { ParallaxWheel } from "@/components/layout/parallax-wheel"

export function ParallaxBackdrop() {
  return (
    <div aria-hidden="true" className="parallax-backdrop">
      <div className="parallax-layer parallax-glow" />
      <ParallaxWheel />
      <div className="parallax-layer parallax-tread" />
    </div>
  )
}
