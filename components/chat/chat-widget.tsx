"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { MessageCircle, Send, X } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { cn } from "@/lib/utils"

type ChatMessage = { id: string; role: "visitor" | "admin"; body: string; createdAt: string }

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json() as Promise<{ messages: ChatMessage[] }>)

export function ChatWidget() {
  const { store, x, intl } = useI18n()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const { data, mutate } = useSWR(open ? "/api/chat" : null, fetcher, { refreshInterval: open ? 4000 : 0 })
  const messages = data?.messages ?? []
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit" })

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length, open])

  async function send() {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setError(false)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, market: store.market, lang: store.lang }),
      })
      if (!res.ok) throw new Error("send failed")
      const json = (await res.json()) as { messages: ChatMessage[] }
      setDraft("")
      await mutate({ messages: json.messages }, { revalidate: false })
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label={x.chat.title}
          className="flex h-[min(32rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col border border-border bg-card text-card-foreground shadow-[0_4px_12px_rgba(0,0,0,0.25),0_20px_50px_-12px_rgba(0,0,0,0.55)]"
        >
          <header className="flex items-center justify-between gap-3 bg-secondary px-4 py-3 text-secondary-foreground">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold uppercase tracking-wide">{x.chat.title}</h2>
              <p className="text-xs text-secondary-foreground/75">{x.chat.hours}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={x.chat.close} className="p-1">
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <ol ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
            <li className="max-w-[85%] self-start bg-muted px-3 py-2 text-sm leading-relaxed">{x.chat.greeting}</li>
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1 px-3 py-2 text-sm leading-relaxed",
                  m.role === "visitor" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted",
                )}
              >
                {m.role === "admin" && <span className="label-caps text-[10px] text-muted-foreground">{x.chat.team}</span>}
                <span className="whitespace-pre-wrap break-words">{m.body}</span>
                <time dateTime={m.createdAt} className="self-end text-[10px] opacity-70">
                  {time.format(new Date(m.createdAt))}
                </time>
              </li>
            ))}
          </ol>

          <form
            className="flex items-end gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              {x.chat.placeholder}
            </label>
            <textarea
              id="chat-input"
              rows={1}
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={x.chat.placeholder}
              className="max-h-28 min-h-10 flex-1 resize-none border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label={x.chat.send}
              className="flex size-10 shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
          {error && (
            <p role="alert" className="px-3 pb-3 text-xs text-primary">
              {x.chat.error}
            </p>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? x.chat.close : x.chat.open}
        className="flex items-center gap-2 bg-secondary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-secondary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5" aria-hidden="true" />}
        <span className="hidden sm:inline">{open ? x.chat.close : x.chat.open}</span>
      </button>
    </div>
  )
}
