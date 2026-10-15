"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { Boxes, LayoutDashboard, Mail, MessageCircle, Package, Truck } from "lucide-react"
import { getUnreadChatCount } from "@/lib/actions/admin"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/admin", label: "Сводка", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Заказы", icon: Package },
  { href: "/admin/shipments", label: "Доставка", icon: Truck },
  { href: "/admin/catalog", label: "Каталог", icon: Boxes },
  { href: "/admin/messages", label: "Письма", icon: Mail },
  { href: "/admin/chat", label: "Чат", icon: MessageCircle },
]

export function AdminNav({ placement }: { placement: "desktop" | "mobile" }) {
  const pathname = usePathname()
  const { data: unread = 0 } = useSWR("admin-unread-chats", () => getUnreadChatCount(), { refreshInterval: 5000 })

  const items = LINKS.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href)
    const badge = href === "/admin/chat" && unread > 0 ? unread : null
    return { href, label, Icon, active, badge }
  })

  if (placement === "mobile") {
    return (
      <nav aria-label="Разделы" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-6">
          {items.map(({ href, label, Icon, active, badge }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
                {badge && (
                  <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav aria-label="Разделы">
      <ul className="flex gap-1">
        {items.map(({ href, label, Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
              {badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                  {badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
