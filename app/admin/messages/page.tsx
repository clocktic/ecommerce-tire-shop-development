import { desc } from "drizzle-orm"
import { isAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { MessageStatusButtons } from "@/components/admin/message-status-buttons"
import { cn } from "@/lib/utils"

const date = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" })
const STATUS_RU: Record<string, string> = { new: "Новое", answered: "Отвечено", archived: "Архив" }

export default async function AdminMessagesPage() {
  if (!(await isAdmin())) return null
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-expanded text-2xl font-extrabold uppercase">Письма с сайта</h1>
      {rows.length === 0 ? (
        <p className="border border-border bg-card p-6 text-muted-foreground">Сообщений пока нет.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((m) => (
            <li key={m.id} className={cn("flex flex-col gap-3 border border-border bg-card p-4", m.status === "archived" && "opacity-60")}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={cn("px-2 py-0.5 text-xs font-semibold", m.status === "new" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {STATUS_RU[m.status] ?? m.status}
                  </span>
                  <span className="font-semibold">{m.name}</span>
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Contact Patch"}`)}`} className="text-primary underline underline-offset-4">
                    {m.email}
                  </a>
                  {m.orderNumber && <span className="font-mono text-xs">{m.orderNumber}</span>}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {date.format(m.createdAt)} · {m.market.toUpperCase()}/{m.lang}
                </span>
              </div>
              {m.subject && <p className="font-semibold">{m.subject}</p>}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
              <MessageStatusButtons id={m.id} status={m.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
