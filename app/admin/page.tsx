import Link from "next/link"
import { count, eq, inArray } from "drizzle-orm"
import { isAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { chatConversations, contactMessages, orders, products } from "@/lib/db/schema"

export default async function AdminDashboard() {
  if (!(await isAdmin())) return null
  const [[pending], [toShip], [inTransit], [messages], [chats], [catalog]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ n: count() }).from(orders).where(inArray(orders.status, ["paid", "processing"])),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "shipped")),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ n: count() }).from(chatConversations).where(eq(chatConversations.unreadByAdmin, true)),
    db.select({ n: count() }).from(products).where(eq(products.archived, false)),
  ])

  const tiles = [
    { label: "Ожидают оплаты", value: pending.n, href: "/admin/orders?status=pending" },
    { label: "К отправке", value: toShip.n, href: "/admin/orders?status=paid" },
    { label: "В пути", value: inTransit.n, href: "/admin/shipments" },
    { label: "Новые письма", value: messages.n, href: "/admin/messages" },
    { label: "Непрочитанные чаты", value: chats.n, href: "/admin/chat" },
    { label: "Товаров на витрине", value: catalog.n, href: "/admin/catalog" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-expanded text-2xl font-extrabold uppercase">Сводка</h1>
      <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="flex flex-col gap-2 bg-card p-5 transition-colors hover:bg-muted">
              <span className="label-caps text-muted-foreground">{t.label}</span>
              <span className="font-mono text-3xl font-semibold tabular-nums">{t.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
