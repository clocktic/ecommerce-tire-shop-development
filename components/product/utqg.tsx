import type { Utqg as UtqgGrades } from "@/lib/catalog"

export function Utqg({ grades }: { grades: UtqgGrades }) {
  const rows = [
    { label: "Treadwear", value: String(grades.treadwear) },
    { label: "Traction", value: grades.traction },
    { label: "Temperature", value: grades.temperature },
  ]
  return (
    <section aria-labelledby="utqg-title" className="border border-border bg-card">
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
