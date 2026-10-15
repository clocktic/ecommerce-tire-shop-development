import "server-only"

import { asc, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { chatConversations, chatMessages, type ChatConversationRow } from "@/lib/db/schema"
import { newId } from "@/lib/ids"

export const CHAT_COOKIE = "cp_chat"
export const MAX_CHAT_MESSAGE = 2000

export type ChatMessageDto = { id: string; role: "visitor" | "admin"; body: string; createdAt: string }

export async function conversationByVisitor(visitorId: string) {
  const [row] = await db.select().from(chatConversations).where(eq(chatConversations.visitorId, visitorId)).limit(1)
  return row ?? null
}

export async function messagesFor(conversationId: string): Promise<ChatMessageDto[]> {
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt))
  return rows.map((r) => ({ id: r.id, role: r.role === "admin" ? "admin" : "visitor", body: r.body, createdAt: r.createdAt.toISOString() }))
}

export async function addMessage(conversationId: string, role: "visitor" | "admin", body: string) {
  const now = new Date()
  await db.insert(chatMessages).values({ id: newId("msg"), conversationId, role, body, createdAt: now })
  await db
    .update(chatConversations)
    .set({ lastMessageAt: now, unreadByAdmin: role === "visitor" })
    .where(eq(chatConversations.id, conversationId))
}

export async function startConversation(visitorId: string, market: string, lang: string): Promise<ChatConversationRow> {
  const now = new Date()
  const row: ChatConversationRow = {
    id: newId("chat"),
    visitorId,
    market,
    lang,
    name: null,
    email: null,
    unreadByAdmin: false,
    lastMessageAt: now,
    createdAt: now,
  }
  await db.insert(chatConversations).values(row)
  return row
}

export async function listConversations() {
  return db.select().from(chatConversations).orderBy(desc(chatConversations.lastMessageAt)).limit(200)
}
