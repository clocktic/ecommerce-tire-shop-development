const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
}

const around = (count: number, offset = 0) => Array.from({ length: count }, (_, i) => offset + (360 / count) * i)

/** Directional tread: each block leans forward, like a V-pattern performance tyre seen side-on. */
const TREAD_BLOCKS = around(60).map((a) => `M${polar(488, a)} L${polar(488, a + 3.8)} L${polar(447, a + 2.4)} L${polar(447, a - 1.4)}Z`)
const SIPES = around(60, 3).map((a) => `M${polar(444, a)} L${polar(434, a - 1.2)}`)
const WEAR_MARKS = around(6, 15).map((a) => `M${polar(427, a - 1.4)} L${polar(427, a + 1.4)} L${polar(420, a)}Z`)
const SPOKES = around(5).map((a) => `M${polar(96, a - 8)} L${polar(248, a - 3.4)} L${polar(248, a + 3.4)} L${polar(96, a + 8)}Z`)
const LUG_NUTS = around(5, 36).map((a) => polar(46, a).split(",").map(Number) as [number, number])

const circlePath = (r: number) => `M0,${-r} A${r},${r} 0 1,1 0,${r} A${r},${r} 0 1,1 0,${-r}`

type SidewallTyreProps = {
  id: string
  marking: string
  fineprint: string
  className?: string
}

/** A tyre drawn as hairline technical line-art, with sidewall lettering set on its curve. */
export function SidewallTyre({ id, marking, fineprint, className }: SidewallTyreProps) {
  return (
    <svg viewBox="-500 -500 1000 1000" className={className} fill="none" stroke="currentColor" strokeWidth={1}>
      <defs>
        <path id={`${id}-marking`} d={circlePath(372)} />
        <path id={`${id}-fineprint`} d={circlePath(334)} />
      </defs>

      <g>
        <circle r={490} />
        <circle r={430} />
        <circle r={440} strokeDasharray="2 10" />
        {TREAD_BLOCKS.map((d) => (
          <path key={d} d={d} />
        ))}
        {SIPES.map((d) => (
          <path key={d} d={d} />
        ))}
        {WEAR_MARKS.map((d) => (
          <path key={d} d={d} fill="currentColor" />
        ))}

        <circle r={416} />
        <circle r={398} strokeDasharray="1 7" />
        <circle r={306} />
        <circle r={292} />
        <circle r={268} />
        <circle r={252} />
        {SPOKES.map((d) => (
          <path key={d} d={d} />
        ))}
        <circle r={88} />
        <circle r={62} />
        <circle r={24} />
        {LUG_NUTS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={9} />
        ))}
      </g>

      <text className="sidewall-marking" fill="currentColor" stroke="none">
        <textPath href={`#${id}-marking`} textLength={2290} lengthAdjust="spacing">
          {marking}
        </textPath>
      </text>
      <text className="sidewall-fineprint" fill="currentColor" stroke="none">
        <textPath href={`#${id}-fineprint`} textLength={2060} lengthAdjust="spacing">
          {fineprint}
        </textPath>
      </text>

      {/* Uniformity mark: real tyres carry a coloured dot at their high point. */}
      <circle cx={0} cy={-407} r={8} className="sidewall-dot" stroke="none" />
    </svg>
  )
}
