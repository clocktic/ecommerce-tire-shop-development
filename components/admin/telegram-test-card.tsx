"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { testTelegramBot, testTelegramChatBot } from "@/lib/actions/admin"

export function TelegramTestCard({
  configured,
  chatBotConfigured,
}: {
  configured: boolean
  chatBotConfigured: boolean
}) {
  const [pendingOrders, startOrdersTransition] = useTransition()
  const [pendingChat, startChatTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function handleTestOrders() {
    setFeedback(null)
    startOrdersTransition(async () => {
      const res = await testTelegramBot()
      if (res.ok) {
        setFeedback({ ok: true, text: res.message ?? "Отправлено" })
      } else {
        setFeedback({ ok: false, text: res.error })
      }
    })
  }

  function handleTestChat() {
    setFeedback(null)
    startChatTransition(async () => {
      const res = await testTelegramChatBot()
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
          <span className="label-caps text-muted-foreground">Telegram-боты</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              configured ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
            }`}
          >
            <span className={`size-1.5 rounded-full ${configured ? "bg-emerald-500" : "bg-amber-500"}`} />
            {configured ? "Заказы: подключён" : "Заказы: нет ключей"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              chatBotConfigured ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
            }`}
          >
            <span className={`size-1.5 rounded-full ${chatBotConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
            {chatBotConfigured ? "Онлайн-чат: подключён" : "Онлайн-чат: нет ключей"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Бот №1 (<code className="font-mono text-foreground">TELEGRAM_BOT_TOKEN</code>) — регистрации, заказы и оплаты. Бот №2 (
          <code className="font-mono text-foreground">TELEGRAM_CHAT_BOT_TOKEN</code>) — двусторонний онлайн-чат с покупателями.
        </p>
        {feedback && (
          <p className={`font-mono text-xs ${feedback.ok ? "text-emerald-500" : "text-destructive"}`}>
            {feedback.text}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!configured || pendingOrders}
          onClick={handleTestOrders}
        >
          {pendingOrders ? "Отправка…" : "Тест бота заказов"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!chatBotConfigured || pendingChat}
          onClick={handleTestChat}
        >
          {pendingChat ? "Отправка…" : "Тест бота чата"}
        </Button>
      </div>
    </section>
  )
}
