import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  CHAT_COOKIE,
  MAX_CHAT_MESSAGE,
  addMessage,
  conversationByVisitor,
  messagesFor,
  startConversation,
  updateConversationContact,
} from "@/lib/chat"
import { parseStore } from "@/lib/i18n/config"
import { notifyTelegramChatMessage } from "@/lib/telegram"
import { syncTelegramChatUpdates } from "@/lib/telegram-chat"

export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// The visitor is identified only by an httpOnly cookie, so one browser cannot read another's thread.
export async function GET() {
  const visitorId = (await cookies()).get(CHAT_COOKIE)?.value
  if (!visitorId) return NextResponse.json({ messages: [], visitor: null })
  await syncTelegramChatUpdates()
  const conversation = await conversationByVisitor(visitorId)
  if (!conversation) return NextResponse.json({ messages: [], visitor: null })
  return NextResponse.json({
    messages: await messagesFor(conversation.id),
    visitor:
      conversation.name && conversation.email
        ? { name: conversation.name, email: conversation.email }
        : null,
  })
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    body?: unknown
    name?: unknown
    email?: unknown
    market?: unknown
    lang?: unknown
  } | null
  const body = typeof payload?.body === "string" ? payload.body.trim().slice(0, MAX_CHAT_MESSAGE) : ""
  const rawName = typeof payload?.name === "string" ? payload.name.trim().slice(0, 120) : ""
  const rawEmail = typeof payload?.email === "string" ? payload.email.trim().toLowerCase().slice(0, 160) : ""
  const store = parseStore(String(payload?.market ?? ""), String(payload?.lang ?? ""))
  if (!store) return NextResponse.json({ ok: false }, { status: 400 })

  const jar = await cookies()
  const existingId = jar.get(CHAT_COOKIE)?.value
  const existing = existingId ? await conversationByVisitor(existingId) : null

  const name = rawName || existing?.name || ""
  const email = rawEmail || existing?.email || ""
  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "contact_required" }, { status: 400 })
  }

  let conversation = existing
  if (!conversation) {
    conversation = await startConversation(randomUUID(), store.market, store.lang, name, email)
  } else if (conversation.name !== name || conversation.email !== email) {
    await updateConversationContact(conversation.id, name, email)
    conversation = { ...conversation, name, email }
  }

  if (body) {
    await addMessage(conversation.id, "visitor", body)
    await notifyTelegramChatMessage({
      conversationId: conversation.id,
      name,
      email,
      market: store.market,
      lang: store.lang,
      body,
    })
  }

  const isHttps = request.url.startsWith("https:")
  const response = NextResponse.json({
    ok: true,
    visitor: { name, email },
    messages: await messagesFor(conversation.id),
  })
  response.cookies.set(CHAT_COOKIE, conversation.visitorId, {
    httpOnly: true,
    secure: isHttps,
    // "none" keeps the cookie inside the cross-site HTTPS preview iframe; "lax" works on http://localhost.
    sameSite: isHttps ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  })
  return response
}
