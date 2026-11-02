import type { Dictionary } from "@/lib/i18n"

const CODES = ["225", "45", "R", "17", "94", "W"]

export function SidewallDecoder({ t }: { t: Dictionary }) {
  const d = t.home.decoder
  return (
    <section aria-labelledby="decoder-title" className="mx-auto max-w-7xl px-4 pt-12 sm:pt-24 md:px-6">
      <div className="grid gap-6 sm:gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-2 sm:gap-3 lg:col-span-4">
          <p className="label-caps text-primary">{d.eyebrow}</p>
          <h2 id="decoder-title" className="text-balance font-expanded text-xl font-extrabold uppercase sm:text-2xl md:text-3xl">
            {d.title}
          </h2>
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-base">{d.lead}</p>
          <div
            aria-hidden="true"
            className="mt-1 inline-flex items-baseline gap-1.5 self-start border border-border bg-card px-3 py-1.5 font-mono text-sm font-bold tracking-wider sm:hidden"
          >
            <span className="text-primary">225</span>
            <span className="text-muted-foreground">/</span>
            <span>45</span>
            <span className="text-primary">R</span>
            <span>17</span>
            <span className="ml-1 text-primary">94</span>
            <span>W</span>
          </div>
        </div>

        <ol className="grid min-w-0 grid-cols-2 border-l border-t border-border bg-card/50 shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] sm:grid-cols-3 lg:col-span-8 lg:grid-cols-6">
          {d.parts.map((p, i) => (
            <li key={CODES[i]} className="flex min-w-0 flex-col gap-2 overflow-hidden border-b border-r border-border p-3 transition-transform duration-200 hover:-translate-y-0.5 sm:gap-3 sm:p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-expanded text-2xl font-black leading-none sm:text-4xl">{CODES[i]}</span>
                <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
              </div>
              <span className="label-caps break-words text-[10px] text-primary sm:text-xs">{p.title}</span>
              <span className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{p.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
