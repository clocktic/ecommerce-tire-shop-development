"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { replyToContactMessage } from "@/lib/actions/admin"

export function AdminEmailReplyForm({
  messageId,
  defaultTo,
  defaultSubject,
  compact = false,
}: {
  messageId?: string
  defaultTo?: string
  defaultSubject?: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(!compact)
  const [to, setTo] = useState(defaultTo ?? "")
  const [subject, setSubject] = useState(defaultSubject ?? "")
  const [body, setBody] = useState("")
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)
    const form = new FormData()
    if (messageId) form.set("id", messageId)
    form.set("to", to)
    form.set("subject", subject)
    form.set("body", body)

    startTransition(async () => {
      const res = await replyToContactMessage(form)
      if (res.ok) {
        setFeedback({ ok: true, text: res.message ?? "Письмо отправлено" })
        setBody("")
      } else {
        setFeedback({ ok: false, text: res.error })
      }
    })
  }

  if (compact && !open) {
    return (
      <Button type="button" variant="default" size="sm" onClick={() => setOpen(true)}>
        Ответить с info@tiresshop.net
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-border bg-muted/30 p-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-mono uppercase text-muted-foreground">Кому (Email)</span>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="customer@example.com"
            className="h-9 border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-mono uppercase text-muted-foreground">Тема письма</span>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Re: Ваш заказ в TiresShop"
            className="h-9 border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-mono uppercase text-muted-foreground">Текст письма (отправитель: info@tiresshop.net)</span>
        <textarea
          required
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Напишите сообщение покупателю…"
          className="border border-border bg-background p-3 text-sm text-foreground"
        />
      </label>
      {feedback && (
        <p className={`font-mono text-xs ${feedback.ok ? "text-emerald-500" : "text-destructive"}`}>
          {feedback.text}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Отправка…" : "Отправить с info@tiresshop.net"}
        </Button>
        {compact && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Скрыть
          </Button>
        )}
      </div>
    </form>
  )
}
