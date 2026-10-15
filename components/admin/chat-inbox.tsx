"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { Send } from "lucide-react"
import { markChatRead, replyToChat } from "@/lib/actions/admin"
import { cn } from "@/lib/utils"

type Conversation = { id: string; market: string; lang: string; unread: boolean; lastMessageAt: string }
type Message = { id: string; role: "visitor" | "admin"; body: string; createdAt: string }

const fetcher = <T,>(url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json() as Promise<T>)
const time = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" })

export function ChatInbox() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { data: list, mutate: refreshList } = useSWR<{ conversations: Conversation[] }>("/api/admin/chat", fetcher, {
    refreshInterval: 5000,
  })
  const conversations = list?.conversations ?? []
  const active = conversations.find((c) => c.id === activeId) ?? null

  return (
    <div className="grid min-h-[60dvh] gap-px border border-border bg-border lg:grid-cols-[18rem_1fr]">
      <ul className={cn("flex flex-col bg-card", activeId && "hidden lg:flex")}>
        {conversations.length === 0 && <li className="p-4 text-sm text-muted-foreground">Чатов пока нет.</li>}
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={async () => {
                setActiveId(c.id)
                if (c.unread) {
                  await markChatRead(c.id)
                  refreshList()
                }
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-border p-3 text-left text-sm",
                c.id === activeId ? "bg-muted" : "hover:bg-muted",
              )}
            >
              <span className="flex flex-col">
                <span className="font-mono text-xs font-semibold">{c.id.slice(-8)}</span>
                <span className="text-xs text-muted-foreground">
                  {c.market.toUpperCase()}/{c.lang} · {time.format(new Date(c.lastMessageAt))}
                </span>
              </span>
              {c.unread && <span className="size-2.5 rounded-full bg-primary" aria-label="Не прочитан" />}
            </button>
          </li>
        ))}
      </ul>

      <div className={cn("flex flex-col bg-card", !activeId && "hidden lg:flex")}>
        {active ? (
          <Thread conversation={active} onBack={() => setActiveId(null)} />
        ) : (
          <p className="m-auto p-6 text-sm text-muted-foreground">Выберите чат слева.</p>
        )}
      </div>
    </div>
  )
}

function Thread({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { data, mutate } = useSWR<{ messages: Message[] }>(`/api/admin/chat?id=${conversation.id}`, fetcher, { refreshInterval: 4000 })
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const messages = data?.messages ?? []

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  async function send() {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    const r = await replyToChat(conversation.id, body)
    setSending(false)
    if (r.ok) {
      setDraft("")
      mutate()
    }
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border p-3 text-sm">
        <button type="button" onClick={onBack} className="text-muted-foreground underline lg:hidden">
          Назад
        </button>
        <span className="font-mono font-semibold">{conversation.id.slice(-8)}</span>
        <span className="text-muted-foreground">
          Витрина {conversation.market.toUpperCase()}, язык {conversation.lang} — отвечайте на языке покупателя
        </span>
      </header>
      <ol ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" style={{ maxHeight: "55dvh" }}>
        {messages.map((m) => (
          <li
            key={m.id}
            className={cn(
              "flex max-w-[80%] flex-col gap-1 px-3 py-2 text-sm leading-relaxed",
              m.role === "admin" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted",
            )}
          >
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
        <label htmlFor="admin-chat-input" className="sr-only">
          Ответ
        </label>
        <textarea
          id="admin-chat-input"
          rows={2}
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
          placeholder="Ответ покупателю"
          className="flex-1 resize-none border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Отправить"
          className="flex size-11 items-center justify-center bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
    </>
  )
}
