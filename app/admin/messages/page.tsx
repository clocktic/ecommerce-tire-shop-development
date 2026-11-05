import { desc } from "drizzle-orm"
import { AdminEmailReplyForm } from "@/components/admin/admin-email-reply-form"
import { EmailTestCard } from "@/components/admin/email-test-card"
import { MessageStatusButtons } from "@/components/admin/message-status-buttons"
import { isAdmin } from "@/lib/admin-auth"
import { COMPANY } from "@/lib/company"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { fetchZohoInboxMessages, getSmtpConfig } from "@/lib/email"
import { cn } from "@/lib/utils"

const date = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" })
const STATUS_RU: Record<string, string> = { new: "Новое", answered: "Отвечено", archived: "Архив" }

export default async function AdminMessagesPage() {
  if (!(await isAdmin())) return null
  const smtp = getSmtpConfig()
  const [rows, imapInbox] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200),
    fetchZohoInboxMessages(15),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-expanded text-2xl font-extrabold uppercase">Почта · {COMPANY.email}</h1>
      </div>

      <EmailTestCard email={COMPANY.email} host={smtp.host} configured={smtp.configured} />

      <section className="flex flex-col gap-3 border border-border bg-card p-5">
        <h2 className="font-expanded text-sm font-extrabold uppercase">Написать исходящее письмо с {COMPANY.email}</h2>
        <AdminEmailReplyForm defaultSubject={`TiresShop — Order & Fitment Support`} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-expanded text-lg font-extrabold uppercase">Обращения через форму на сайте ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="border border-border bg-card p-6 text-muted-foreground">Сообщений с формы сайта пока нет.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((m) => (
              <li
                key={m.id}
                className={cn("flex flex-col gap-3 border border-border bg-card p-4", m.status === "archived" && "opacity-60")}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold",
                        m.status === "new" ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {STATUS_RU[m.status] ?? m.status}
                    </span>
                    <span className="font-semibold">{m.name}</span>
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "TiresShop"}`)}`}
                      className="text-primary underline underline-offset-4"
                    >
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
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <MessageStatusButtons id={m.id} status={m.status} />
                  </div>
                  <AdminEmailReplyForm
                    compact
                    messageId={m.id}
                    defaultTo={m.email}
                    defaultSubject={`Re: ${m.subject ?? (m.orderNumber ? `Order ${m.orderNumber}` : "TiresShop")}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-expanded text-lg font-extrabold uppercase">
            Входящие ящика {COMPANY.email} (IMAP Zoho)
          </h2>
          <span className="font-mono text-xs text-muted-foreground">imap.zoho.com:993</span>
        </div>
        {!imapInbox.configured ? (
          <p className="border border-border bg-card p-5 text-sm text-muted-foreground">
            Чтобы просматривать входящие письма ящика <code className="font-mono text-foreground">{COMPANY.email}</code> прямо в админке и отправлять письма с сайта, укажите пароль почты (или пароль приложения Zoho) в переменной окружения{" "}
            <code className="font-mono text-foreground">SMTP_PASS</code>.
          </p>
        ) : imapInbox.error ? (
          <p className="border border-border bg-card p-5 font-mono text-xs text-destructive">
            IMAP: {imapInbox.error}
          </p>
        ) : imapInbox.messages.length === 0 ? (
          <p className="border border-border bg-card p-5 text-sm text-muted-foreground">
            В папке «Входящие» ({COMPANY.email}) пока нет писем.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {imapInbox.messages.map((item) => {
              const emailMatch = item.from.match(/<([^>]+)>/)
              const replyAddress = emailMatch ? emailMatch[1] : item.from
              return (
                <li key={item.uid} className="flex flex-col gap-2.5 border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-foreground">{item.from}</span>
                    <span className="font-mono text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-sm font-medium">{item.subject}</p>
                  <AdminEmailReplyForm
                    compact
                    defaultTo={replyAddress}
                    defaultSubject={item.subject.startsWith("Re:") ? item.subject : `Re: ${item.subject}`}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
