import { SidewallTyre } from "@/components/layout/sidewall-tyre"

/**
 * Two line-drawn tyres at different depths that roll and drift with the page scroll.
 * Motion is a CSS scroll-driven animation, so it runs on the compositor without any script.
 */
export function ParallaxBackdrop() {
  return (
    <div aria-hidden="true" className="parallax-backdrop">
      <div className="parallax-layer parallax-glow" />

      <div className="backdrop-tyre backdrop-tyre--far">
        <SidewallTyre
          id="tyre-far"
          className="backdrop-tyre-spin"
          marking="TIRESSHOP · 255/35 R19 96Y XL · RUN FLAT · 3PMSF · "
          fineprint="DOT 7KR2 1926 · MAX LOAD 710 KG (1565 LBS) · MAX PRESS 340 KPA (50 PSI) · TREADWEAR 300 · TRACTION AA · "
        />
      </div>

      <div className="backdrop-tyre backdrop-tyre--near">
        <SidewallTyre
          id="tyre-near"
          className="backdrop-tyre-spin"
          marking="TIRESSHOP · 225/45 R17 94W · RADIAL TUBELESS · M+S · "
          fineprint="DOT 4X2R 3426 · MAX LOAD 670 KG (1477 LBS) · MAX PRESS 350 KPA (51 PSI) · TREADWEAR 400 · TRACTION A · "
        />
      </div>
    </div>
  )
}
