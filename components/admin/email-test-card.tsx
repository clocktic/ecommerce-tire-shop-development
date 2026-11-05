"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { testStoreEmail } from "@/lib/actions/admin"

export function EmailTestCard({
  email,
  host,
  configured,
}: {
  email: string
  host: string
  configured: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function handleTest() {
    setFeedback(null)
    startTransition(async () => {
      const res = await testStoreEmail()
      if (res.ok) {
        setFeedback({ ok: true, text: res.message ?? "Отправлено" })
      } else {
        setFeedback({ ok: false, text: res.error })
      }
    })
  }

  return (
    <section className="flex flex-col justify-between gap-4 border border-border bg-card p-5 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="label-caps text-muted-foreground">Почта магазина (Zoho Mail)</span>
          <span className="font-mono text-xs font-semibold text-foreground">{email}</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              configured ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
            }`}
          >
            <span className={`size-1.5 rounded-full ${configured ? "bg-emerald-500" : "bg-amber-500"}`} />
            {configured ? `SMTP/IMAP (${host}): подключён` : "Ожидает пароль SMTP_PASS"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Все входящие обращения с сайта, заказы, оплаты, трек-номера и ответы покупателям отправляются и принимаются через{" "}
          <code className="font-mono text-foreground">{email}</code> (пароль приложения Zoho задаётся в{" "}
          <code className="font-mono text-foreground">SMTP_PASS</code>).
        </p>
        {feedback && (
          <p className={`font-mono text-xs ${feedback.ok ? "text-emerald-500" : "text-destructive"}`}>
            {feedback.text}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleTest}>
          {pending ? "Отправка…" : `Тест ${email}`}
        </Button>
      </div>
    </section>
  )
}
