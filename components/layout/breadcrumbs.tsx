import Link from "next/link"

type Crumb = { href?: string; label: string }

export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: Crumb[]; label?: string }) {
  return (
    <nav aria-label={label} className="py-5">
      <ol className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 max-w-full items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-full truncate text-foreground sm:max-w-[40ch]">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
