import Link from "next/link"
import { RotateCcw, ShieldCheck, Tag, Truck, type LucideIcon } from "lucide-react"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { policyHref } from "@/lib/legal/pages"

export function TrustStrip({ store }: { store: Store }) {
  const t = getDictionary(store)
  const x = getExtras(store)
  const p = t.home.promise
  const [memberTitle, memberValue = ""] = x.memberDiscount.badge.split("·").map((s) => s.trim())
  const items: { icon: LucideIcon; title: string; value: string; href: string }[] = [
    { icon: Truck, title: t.topbar.shipping, value: t.policy.days, href: policyHref(store, "shipping") },
    { icon: RotateCcw, title: p.returnsTitle, value: p.returnsValue, href: policyHref(store, "returns") },
    { icon: ShieldCheck, title: p.warrantyTitle, value: p.warrantyValue, href: policyHref(store, "warranty") },
    { icon: Tag, title: memberTitle, value: memberValue, href: storePath(store, "/account?mode=sign-up") },
  ]

  return (
    <section aria-label={p.title} className="border-y border-border bg-card">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 md:px-6">
        {items.map(({ icon: Icon, title, value, href }) => (
          <li key={href} className="min-w-0 border-border odd:border-r max-md:[&:nth-child(-n+2)]:border-b md:border-r md:last:border-r-0">
            <Link
              href={href}
              className="group flex h-full min-w-0 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:py-4 md:px-5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary transition-transform duration-200 group-hover:-translate-y-0.5">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  {title}
                </span>
                <span className="line-clamp-2 text-sm font-bold leading-tight text-foreground group-hover:text-primary sm:text-base">{value}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
