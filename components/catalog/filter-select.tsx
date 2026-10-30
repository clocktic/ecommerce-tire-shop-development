import { ChevronDown } from "lucide-react"

export function FilterSelect({
  name,
  label,
  any,
  value,
  options,
  labels,
}: {
  name: string
  label: string
  any: string
  value?: string
  options: string[]
  labels?: Record<string, string>
}) {
  const id = `filter-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-caps text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={value ?? ""}
          className="h-12 w-full appearance-none border border-border bg-card pl-3 pr-9 font-mono text-sm shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <option value="">{any}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {labels?.[o] ?? o}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
