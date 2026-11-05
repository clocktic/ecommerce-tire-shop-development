import Link from "next/link"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { policyHref } from "@/lib/legal/pages"
import { Icon3D, type Icon3DName } from "@/components/ui/icon-3d"

export function TrustStrip({ store }: { store: Store }) {
  const t = getDictionary(store)
  const x = getExtras(store)
  const p = t.home.promise
  const [memberTitle, memberValue = ""] = x.memberDiscount.badge.split("·").map((s) => s.trim())
  const items: { icon: Icon3DName; title: string; value: string; href: string }[] = [
    { icon: "shipping", title: t.topbar.shipping, value: t.policy.days, href: policyHref(store, "shipping") },
    { icon: "returns", title: p.returnsTitle, value: p.returnsValue, href: policyHref(store, "returns") },
    { icon: "warranty", title: p.warrantyTitle, value: p.warrantyValue, href: policyHref(store, "warranty") },
    { icon: "member", title: memberTitle, value: memberValue, href: storePath(store, "/account?mode=sign-up") },
  ]

  return (
    <section aria-label={p.title} className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 md:px-6">
      <ul className="grid grid-cols-2 overflow-hidden border border-border bg-card shadow-lifted md:grid-cols-4">
        {items.map(({ icon, title, value, href }) => (
          <li key={href} className="min-w-0 border-border odd:border-r max-md:[&:nth-child(-n+2)]:border-b md:border-r md:last:border-r-0">
            <Link
              href={href}
              className="group flex h-full min-w-0 items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/50 sm:px-4 sm:py-4 md:px-5"
            >
              <Icon3D name={icon} size="md" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  {title}
                </span>
                <span className="line-clamp-2 text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
                  {value}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
