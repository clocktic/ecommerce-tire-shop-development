"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { MessageCircle, Send, X } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { cn } from "@/lib/utils"

type ChatMessage = { id: string; role: "visitor" | "admin"; body: string; createdAt: string }
type ChatVisitor = { name: string; email: string }
type ChatState = { messages: ChatMessage[]; visitor: ChatVisitor | null }

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json() as Promise<ChatState>)

export function ChatWidget() {
  const { store, x, intl } = useI18n()
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [confirmedVisitor, setConfirmedVisitor] = useState<ChatVisitor | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const { data, mutate } = useSWR(open ? "/api/chat" : null, fetcher, { refreshInterval: open ? 4000 : 0 })
  const messages = data?.messages ?? []
  const visitor = data?.visitor ?? confirmedVisitor
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit" })

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length, open, visitor])

  async function startChat(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    const email = emailInput.trim()
    if (!name || !email || sending) return
    setSending(true)
    setError(false)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, market: store.market, lang: store.lang }),
      })
      if (!res.ok) throw new Error("start failed")
      const json = (await res.json()) as ChatState
      const nextVisitor = json.visitor ?? { name, email }
      setConfirmedVisitor(nextVisitor)
      await mutate({ messages: json.messages, visitor: nextVisitor }, { revalidate: false })
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  async function send() {
    const body = draft.trim()
    if (!body || !visitor || sending) return
    setSending(true)
    setError(false)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          name: visitor.name,
          email: visitor.email,
          market: store.market,
          lang: store.lang,
        }),
      })
      if (!res.ok) throw new Error("send failed")
      const json = (await res.json()) as ChatState
      setDraft("")
      await mutate({ messages: json.messages, visitor: json.visitor ?? visitor }, { revalidate: false })
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div data-open={open || undefined} className="chat-launcher fixed bottom-[calc(4.15rem+env(safe-area-inset-bottom))] right-3 transition-[bottom,translate,opacity] duration-300 z-40 flex flex-col items-end gap-2.5 md:bottom-4 md:right-4">
      {open && (
        <section
          aria-label={x.chat.title}
          className="flex h-[min(26rem,calc(100dvh-9rem))] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-lifted md:h-[min(32rem,calc(100dvh-7rem))]"
        >
          <header className="flex items-center justify-between gap-3 bg-secondary px-4 py-3 text-secondary-foreground">
            <div className="flex min-w-0 flex-col">
              <h2 className="text-sm font-bold uppercase tracking-wide">{x.chat.title}</h2>
              <p className="truncate text-xs text-secondary-foreground/75">
                {visitor ? `${visitor.name} · ${visitor.email}` : x.chat.hours}
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={x.chat.close} className="p-1">
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          {!visitor ? (
            <form onSubmit={startChat} className="flex flex-1 flex-col justify-between gap-4 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                <p className="bg-muted px-3 py-2.5 text-sm leading-relaxed">{x.chat.greeting}</p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="chat-visitor-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {x.contactForm.name}
                  </label>
                  <input
                    id="chat-visitor-name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={x.contactForm.name}
                    disabled={sending}
                    className="h-10 border border-border bg-background px-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="chat-visitor-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {x.contactForm.email}
                  </label>
                  <input
                    id="chat-visitor-email"
                    type="email"
                    required
                    maxLength={160}
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    disabled={sending}
                    className="h-10 border border-border bg-background px-3 text-sm"
                  />
                </div>
                {error && (
                  <p role="alert" className="text-xs text-primary">
                    {x.chat.error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={sending || !nameInput.trim() || !emailInput.trim()}
                className="flex h-10 w-full items-center justify-center bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {x.chat.open}
              </button>
            </form>
          ) : (
            <>
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
                  className="flex size-10 shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send className="size-4" aria-hidden="true" />
                </button>
              </form>
              {error && (
                <p role="alert" className="px-3 pb-3 text-xs text-primary">
                  {x.chat.error}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? x.chat.close : x.chat.open}
        className="flex size-11 items-center justify-center gap-2 border border-secondary-foreground/15 bg-secondary p-0 text-sm font-semibold uppercase tracking-wide text-secondary-foreground shadow-chip transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground sm:size-auto sm:px-4 sm:py-3"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5" aria-hidden="true" />}
        <span className="hidden sm:inline">{open ? x.chat.close : x.chat.open}</span>
      </button>
    </div>
  )
}
