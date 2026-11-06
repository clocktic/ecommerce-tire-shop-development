const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
}

const point = (r: number, deg: number) => polar(r, deg).split(",").map(Number) as [number, number]

const around = (count: number, offset = 0) => Array.from({ length: count }, (_, i) => offset + (360 / count) * i)

/** Directional tread: each block leans forward, like a V-pattern performance tyre seen side-on. */
const TREAD_BLOCKS = around(60).map((a) => `M${polar(489, a)} L${polar(489, a + 3.8)} L${polar(447, a + 2.4)} L${polar(447, a - 1.4)}Z`)
const SIPES = around(60, 3).map((a) => `M${polar(444, a)} L${polar(434, a - 1.2)}`)
const WEAR_MARKS = around(6, 15).map((a) => `M${polar(427, a - 1.4)} L${polar(427, a + 1.4)} L${polar(420, a)}Z`)

/** Five split spokes: two arms per spoke fan out from the hub into a Y. */
const SPOKE_ARMS = around(5).flatMap((a) =>
  [-7, 7].map(
    (off) =>
      `M${polar(92, a + off * 0.3 - 6)} Q${polar(170, a + off * 0.75 - 5.4)} ${polar(256, a + off - 4.4)} L${polar(256, a + off + 4.4)} Q${polar(170, a + off * 0.75 + 5.4)} ${polar(92, a + off * 0.3 + 6)}Z`,
  ),
)
const LUG_NUTS = around(5, 36).map((a) => point(46, a))
const DISC_HOLES = around(36).flatMap((a) => [point(176, a), point(198, a + 5)])

/** Seeded PRNG so droplets land in the same places on server and client. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Droplet = { cx: number; cy: number; rx: number; ry: number }

function scatterDroplets(seed: number, count: number, rMin: number, rMax: number, sizeMin: number, sizeMax: number): Droplet[] {
  const rand = seeded(seed)
  return Array.from({ length: count }, () => {
    const [cx, cy] = point(rMin + rand() * (rMax - rMin), rand() * 360)
    const rx = sizeMin + rand() ** 2 * (sizeMax - sizeMin)
    return { cx, cy, rx, ry: rx * (0.78 + rand() * 0.2) }
  })
}

const circlePath = (r: number) => `M0,${-r} A${r},${r} 0 1,1 0,${r} A${r},${r} 0 1,1 0,${-r}`

const stop = (offset: number, color: string, opacity = 1) => (
  <stop offset={offset} style={{ stopColor: `var(${color})`, stopOpacity: opacity }} />
)

type SidewallTyreProps = {
  id: string
  marking: string
  fineprint: string
  seed: number
  className?: string
}

/**
 * A wet tyre rendered in SVG. All shading here is radial, so it stays correct while the
 * tyre rotates; the directional light and specular reflections live in a static overlay.
 */
export function SidewallTyre({ id, marking, fineprint, seed, className }: SidewallTyreProps) {
  const droplets = [
    ...scatterDroplets(seed, 44, 312, 418, 2.2, 7.5),
    ...scatterDroplets(seed + 1, 14, 258, 300, 1.8, 5),
    ...scatterDroplets(seed + 2, 10, 100, 240, 1.6, 4.2),
  ]

  return (
    <svg viewBox="-500 -500 1000 1000" className={className}>
      <defs>
        <path id={`${id}-marking`} d={circlePath(372)} />
        <path id={`${id}-fineprint`} d={circlePath(334)} />

        <radialGradient id={`${id}-rubber`} cx={0} cy={0} r={492} gradientUnits="userSpaceOnUse">
          {stop(0.6, "--rubber-0")}
          {stop(0.645, "--rubber-1")}
          {stop(0.76, "--rubber-2")}
          {stop(0.83, "--rubber-1")}
          {stop(0.865, "--rubber-0")}
          {stop(1, "--rubber-0")}
        </radialGradient>

        <radialGradient id={`${id}-rim`} cx={0} cy={0} r={308} gradientUnits="userSpaceOnUse">
          {stop(0.8, "--metal-0")}
          {stop(0.86, "--metal-1")}
          {stop(0.93, "--metal-3")}
          {stop(0.97, "--metal-1")}
          {stop(1, "--metal-0")}
        </radialGradient>

        <radialGradient id={`${id}-spoke`} cx={0} cy={0} r={256} gradientUnits="userSpaceOnUse">
          {stop(0.35, "--metal-2")}
          {stop(0.7, "--metal-1")}
          {stop(1, "--metal-2")}
        </radialGradient>

        <radialGradient id={`${id}-disc`} cx={0} cy={0} r={216} gradientUnits="userSpaceOnUse">
          {stop(0.5, "--metal-0")}
          {stop(0.56, "--metal-1")}
          {stop(0.8, "--metal-2", 0.8)}
          {stop(0.98, "--metal-1")}
          {stop(1, "--metal-0")}
        </radialGradient>

        {/* A water bead lenses light: dark where it faces the key light, a bright caustic opposite. */}
        <radialGradient id={`${id}-drop`} cx={0.62} cy={0.66} r={0.62} fx={0.7} fy={0.74}>
          <stop offset={0} stopColor="#fff" stopOpacity={0.42} />
          <stop offset={0.45} stopColor="#a9b4c2" stopOpacity={0.16} />
          <stop offset={0.8} stopColor="#000" stopOpacity={0.35} />
          <stop offset={1} stopColor="#000" stopOpacity={0.6} />
        </radialGradient>

        <radialGradient id={`${id}-hub`} cx={0} cy={0} r={96} gradientUnits="userSpaceOnUse">
          {stop(0, "--metal-1")}
          {stop(0.6, "--metal-2")}
          {stop(0.9, "--metal-3")}
          {stop(1, "--metal-1")}
        </radialGradient>
      </defs>

      <circle r={492} fill={`url(#${id}-rubber)`} />

      <g>
        <circle r={461} fill="none" style={{ stroke: "var(--rubber-0)" }} strokeWidth={58} />
        {TREAD_BLOCKS.map((d) => (
          <path key={d} d={d} style={{ fill: "var(--rubber-1)", stroke: "var(--rubber-edge)" }} strokeWidth={1.6} strokeLinejoin="round" />
        ))}
        {SIPES.map((d) => (
          <path key={d} d={d} style={{ stroke: "var(--rubber-0)" }} strokeWidth={2.4} />
        ))}
        <circle r={440} fill="none" style={{ stroke: "var(--rubber-0)" }} strokeWidth={5} />
        {WEAR_MARKS.map((d) => (
          <path key={d} d={d} style={{ fill: "var(--rubber-3)" }} />
        ))}
        <circle r={417} fill="none" style={{ stroke: "var(--rubber-edge)" }} strokeWidth={2.5} />
        <circle r={398} fill="none" style={{ stroke: "var(--rubber-edge)" }} strokeWidth={1.4} strokeDasharray="1.5 7" />
      </g>

      <text className="sidewall-marking">
        <textPath href={`#${id}-marking`} textLength={2290} lengthAdjust="spacing">
          {marking}
        </textPath>
      </text>
      <text className="sidewall-fineprint">
        <textPath href={`#${id}-fineprint`} textLength={2060} lengthAdjust="spacing">
          {fineprint}
        </textPath>
      </text>

      {/* Uniformity mark: real tyres carry a coloured dot at their high point. */}
      <circle cx={0} cy={-407} r={8} className="sidewall-dot" />

      <circle r={308} fill={`url(#${id}-rim)`} />
      <circle r={300} fill="none" style={{ stroke: "var(--metal-3)" }} strokeWidth={2} opacity={0.7} />
      <circle r={256} style={{ fill: "var(--wheel-well)" }} />

      <circle r={216} fill={`url(#${id}-disc)`} />
      {DISC_HOLES.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4.2} style={{ fill: "var(--wheel-well)" }} />
      ))}
      <circle r={112} style={{ fill: "var(--metal-0)" }} />

      {SPOKE_ARMS.map((d) => (
        <path key={d} d={d} fill={`url(#${id}-spoke)`} style={{ stroke: "var(--metal-3)" }} strokeWidth={1.2} strokeOpacity={0.5} strokeLinejoin="round" />
      ))}

      <circle r={96} fill={`url(#${id}-hub)`} />
      <circle r={64} fill="none" style={{ stroke: "var(--metal-0)" }} strokeWidth={2} />
      {LUG_NUTS.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={11} style={{ fill: "var(--metal-3)", stroke: "var(--metal-0)" }} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={4.5} style={{ fill: "var(--metal-1)" }} />
        </g>
      ))}
      <circle r={26} style={{ fill: "var(--metal-0)", stroke: "var(--metal-2)" }} strokeWidth={1.5} />

      {/* Beaded rain water: a dark lensing body with a bright specular point. */}
      {droplets.map(({ cx, cy, rx, ry }) => (
        <g key={`${cx}-${cy}`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-drop)`} className="tyre-drop" />
          <ellipse cx={cx - rx * 0.36} cy={cy - ry * 0.38} rx={Math.max(rx * 0.26, 0.8)} ry={Math.max(ry * 0.18, 0.6)} className="tyre-drop-glint" />
        </g>
      ))}
    </svg>
  )
}
