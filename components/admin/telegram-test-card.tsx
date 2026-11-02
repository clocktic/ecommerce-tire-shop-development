"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { testTelegramBot } from "@/lib/actions/admin"

export function TelegramTestCard({ configured }: { configured: boolean }) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function handleTest() {
    setFeedback(null)
    startTransition(async () => {
      const res = await testTelegramBot()
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
        <div className="flex items-center gap-2.5">
          <span className="label-caps text-muted-foreground">Telegram-уведомления</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              configured ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
            }`}
          >
            <span className={`size-1.5 rounded-full ${configured ? "bg-emerald-500" : "bg-amber-500"}`} />
            {configured ? "Подключён" : "Ожидает ключи в Vars"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          События: регистрация нового покупателя, создание нового заказа, успешная оплата заказа (переменные{" "}
          <code className="font-mono text-foreground">TELEGRAM_BOT_TOKEN</code> и{" "}
          <code className="font-mono text-foreground">TELEGRAM_CHAT_ID</code>).
        </p>
        {feedback && (
          <p className={`font-mono text-xs ${feedback.ok ? "text-emerald-500" : "text-destructive"}`}>
            {feedback.text}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!configured || pending}
        onClick={handleTest}
        className="shrink-0"
      >
        {pending ? "Отправка…" : "Проверить бота"}
      </Button>
    </section>
  )
}
