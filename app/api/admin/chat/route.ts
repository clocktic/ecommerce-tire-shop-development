import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import { listConversations, messagesFor } from "@/lib/chat"

export const dynamic = "force-dynamic"

// ?id=<conversationId> returns that thread; without it, the conversation list.
export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = new URL(request.url).searchParams.get("id")
  if (id) return NextResponse.json({ messages: await messagesFor(id) })
  const rows = await listConversations()
  return NextResponse.json({
    conversations: rows.map((c) => ({
      id: c.id,
      market: c.market,
      lang: c.lang,
      unread: c.unreadByAdmin,
      lastMessageAt: c.lastMessageAt.toISOString(),
    })),
  })
}
