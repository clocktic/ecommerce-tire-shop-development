import type { Dictionary } from "@/lib/i18n"

const CODES = ["225", "45", "R", "17", "94", "W"]

export function SidewallDecoder({ t }: { t: Dictionary }) {
  const d = t.home.decoder
  return (
    <section aria-labelledby="decoder-title" className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-4">
          <p className="label-caps text-primary">{d.eyebrow}</p>
          <h2 id="decoder-title" className="text-balance font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            {d.title}
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">{d.lead}</p>
        </div>

        <ol className="grid min-w-0 grid-cols-2 border-l border-t border-border shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] sm:grid-cols-3 lg:col-span-8 lg:grid-cols-6">
          {d.parts.map((p, i) => (
            <li key={CODES[i]} className="flex min-w-0 flex-col gap-3 overflow-hidden border-b border-r border-border p-3 transition-transform duration-200 hover:-translate-y-0.5 sm:p-4">
              <span className="font-expanded text-3xl font-black leading-none sm:text-4xl">{CODES[i]}</span>
              <span className="label-caps break-words text-primary">{p.title}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">{p.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
