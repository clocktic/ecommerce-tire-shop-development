import type { Market } from "@/lib/markets"

export function SidewallDecoder({ market }: { market: Market }) {
  const parts = [
    { code: "225", title: "Width", text: "Section width in millimetres, sidewall to sidewall." },
    { code: "45", title: "Profile", text: "Sidewall height as a percentage of the width." },
    { code: "R", title: "Construction", text: "Radial — almost every passenger tire today." },
    { code: "17", title: "Rim", text: "Wheel diameter in inches. Must match your wheel." },
    {
      code: "94",
      title: "Load index",
      text: market === "us" ? "Max load per tire. 94 = 1,477 lb." : "Max load per tyre. 94 = 670 kg.",
    },
    {
      code: "W",
      title: "Speed rating",
      text: market === "us" ? "Max sustained speed. W = 168 mph." : "Max sustained speed. W = 270 km/h.",
    },
  ]

  return (
    <section aria-labelledby="decoder-title" className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-4">
          <p className="label-caps text-primary">Before you order</p>
          <h2 id="decoder-title" className="text-balance font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            Read your sidewall
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            The size code on your current tires is all you need. Match width, profile and rim exactly; load index and speed
            rating should be equal to or higher than the original fitment.
          </p>
        </div>

        <ol className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3 lg:col-span-8 lg:grid-cols-6">
          {parts.map((p) => (
            <li key={p.title} className="flex flex-col gap-3 border-b border-r border-border p-4">
              <span className="font-expanded text-4xl font-black leading-none">{p.code}</span>
              <span className="label-caps text-primary">{p.title}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">{p.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
