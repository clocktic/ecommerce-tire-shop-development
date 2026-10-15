import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { CHAT_COOKIE, MAX_CHAT_MESSAGE, addMessage, conversationByVisitor, messagesFor, startConversation } from "@/lib/chat"
import { parseStore } from "@/lib/i18n/config"

export const dynamic = "force-dynamic"

// The visitor is identified only by an httpOnly cookie, so one browser cannot read another's thread.
export async function GET() {
  const visitorId = (await cookies()).get(CHAT_COOKIE)?.value
  if (!visitorId) return NextResponse.json({ messages: [] })
  const conversation = await conversationByVisitor(visitorId)
  return NextResponse.json({ messages: conversation ? await messagesFor(conversation.id) : [] })
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { body?: unknown; market?: unknown; lang?: unknown } | null
  const body = typeof payload?.body === "string" ? payload.body.trim().slice(0, MAX_CHAT_MESSAGE) : ""
  const store = parseStore(String(payload?.market ?? ""), String(payload?.lang ?? ""))
  if (!body || !store) return NextResponse.json({ ok: false }, { status: 400 })

  const jar = await cookies()
  const existingId = jar.get(CHAT_COOKIE)?.value
  const existing = existingId ? await conversationByVisitor(existingId) : null
  const conversation = existing ?? (await startConversation(randomUUID(), store.market, store.lang))
  await addMessage(conversation.id, "visitor", body)

  const response = NextResponse.json({ ok: true, messages: await messagesFor(conversation.id) })
  response.cookies.set(CHAT_COOKIE, conversation.visitorId, {
    httpOnly: true,
    secure: true,
    // "none" keeps the cookie inside the cross-site preview iframe; still httpOnly + secure.
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  })
  return response
}
