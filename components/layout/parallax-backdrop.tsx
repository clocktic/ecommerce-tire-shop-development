export function ParallaxBackdrop() {
  return (
    <div aria-hidden="true" className="parallax-backdrop">
      <div className="parallax-layer parallax-glow" />
      <div className="parallax-layer parallax-tread" />
      <div className="parallax-tire">
        <div className="parallax-tire-band" />
      </div>
    </div>
  )
}
