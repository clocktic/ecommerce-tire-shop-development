import { ParallaxTreads } from "@/components/layout/parallax-treads"

export function ParallaxBackdrop() {
  return (
    <div aria-hidden="true" className="parallax-backdrop">
      <div className="parallax-layer parallax-glow" />
      <ParallaxTreads />
    </div>
  )
}
