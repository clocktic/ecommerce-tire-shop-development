import { SidewallTyre } from "@/components/layout/sidewall-tyre"

type BackdropTyreProps = {
  depth: "near" | "far"
  marking: string
  fineprint: string
  seed: number
}

/**
 * The tyre rotates underneath a static light rig (cast shadow, shading, wet speculars),
 * so reflections stay put while the wheel rolls — which is what sells it as a real object.
 */
function BackdropTyre({ depth, marking, fineprint, seed }: BackdropTyreProps) {
  return (
    <div className={`backdrop-tyre backdrop-tyre--${depth}`}>
      <div className="tyre-shadow" />
      <SidewallTyre id={`tyre-${depth}`} className="backdrop-tyre-spin" marking={marking} fineprint={fineprint} seed={seed} />
      <div className="tyre-light" />
      <div className="tyre-backlight" />
    </div>
  )
}

/**
 * Two wet tyres at different depths that roll and drift with the page scroll.
 * Motion is a CSS scroll-driven animation, so it runs on the compositor without any script.
 */
export function ParallaxBackdrop() {
  return (
    <div aria-hidden="true" className="parallax-backdrop">
      <div className="parallax-layer parallax-glow" />

      <BackdropTyre
        depth="far"
        seed={71}
        marking="TIRESSHOP · 255/35 R19 96Y XL · RUN FLAT · 3PMSF · "
        fineprint="DOT 7KR2 1926 · MAX LOAD 710 KG (1565 LBS) · MAX PRESS 340 KPA (50 PSI) · TREADWEAR 300 · TRACTION AA · "
      />
      <BackdropTyre
        depth="near"
        seed={23}
        marking="TIRESSHOP · 225/45 R17 94W · RADIAL TUBELESS · M+S · "
        fineprint="DOT 4X2R 3426 · MAX LOAD 670 KG (1477 LBS) · MAX PRESS 350 KPA (51 PSI) · TREADWEAR 400 · TRACTION A · "
      />
    </div>
  )
}
