import type { Utqg as UtqgGrades } from "@/lib/catalog"
import type { Dictionary } from "@/lib/i18n"

type Text = NonNullable<Dictionary["product"]["utqg"]>

export function Utqg({ grades, text }: { grades: UtqgGrades; text: Text }) {
  const rows = [
    { label: text.treadwear, value: String(grades.treadwear) },
    { label: text.traction, value: grades.traction },
    { label: text.temperature, value: grades.temperature },
  ]
  return (
    <section
      aria-labelledby="utqg-title"
      className="border border-border bg-card shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h3 id="utqg-title" className="label-caps">
          UTQG
        </h3>
        <span className="font-mono text-xs text-muted-foreground">49 CFR 575.104</span>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 px-4 py-3">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
