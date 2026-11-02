import "server-only"

import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { chatConversations, chatMessages, type ChatConversationRow } from "@/lib/db/schema"
import { escapeHtml, getTelegramChatBotCredentials } from "@/lib/telegram"

export type TelegramMessage = {
  message_id: number
  chat: { id: number | string; type?: string }
  from?: { id: number; is_bot?: boolean; first_name?: string; username?: string }
  text?: string
  caption?: string
  reply_to_message?: {
    message_id: number
    text?: string
    caption?: string
  }
}

export type TelegramCallbackQuery = {
  id: string
  from: { id: number; first_name?: string; username?: string }
  message?: TelegramMessage
  data?: string
}

export type TelegramUpdate = {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

const CHAT_ID_REGEX = /#?(chat_[a-zA-Z0-9_-]+)/

export function extractConversationIdFromText(text?: string | null): string | null {
  if (!text) return null
  const match = text.match(CHAT_ID_REGEX)
  return match ? match[1] : null
}

function isAuthorizedAdminChat(chatId: number | string): boolean {
  const { chatIds } = getTelegramChatBotCredentials()
  const normalized = String(chatId).trim()
  return chatIds.includes(normalized)
}

async function sendTelegramReplyToChat(
  chatId: number | string,
  html: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  const { token } = getTelegramChatBotCredentials()
  if (!token) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...extra,
      }),
      cache: "no-store",
    })
  } catch (e) {
    console.error("[telegram-chat] sendMessage error:", e)
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  const { token } = getTelegramChatBotCredentials()
  if (!token) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
      cache: "no-store",
    })
  } catch (e) {
    console.error("[telegram-chat] answerCallbackQuery error:", e)
  }
}

async function findConversationById(id: string): Promise<ChatConversationRow | null> {
  const [row] = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1)
  return row ?? null
}

async function findLatestConversation(): Promise<ChatConversationRow | null> {
  const [row] = await db
    .select()
    .from(chatConversations)
    .orderBy(desc(chatConversations.lastMessageAt))
    .limit(1)
  return row ?? null
}

/**
 * Processes a single Telegram Update (either from POST /api/telegram/webhook or getUpdates polling).
 * Uses a deterministic primary key (`tg_<chatId>_<messageId>`) with ON CONFLICT DO NOTHING
 * so duplicate deliveries can never insert duplicate chat messages.
 */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  // 1. Handle inline button click: "Ответить покупателю" (callback_data = "reply:chat_...")
  if (update.callback_query) {
    const cq = update.callback_query
    const chatId = cq.message?.chat.id
    if (!chatId || !isAuthorizedAdminChat(chatId)) {
      await answerCallbackQuery(cq.id, "Доступ запрещён")
      return
    }

    const data = cq.data ?? ""
    if (data.startsWith("reply:")) {
      const conversationId = data.slice("reply:".length).trim()
      const conv = await findConversationById(conversationId)
      if (!conv) {
        await answerCallbackQuery(cq.id, "Диалог не найден")
        return
      }
      await answerCallbackQuery(cq.id, `Введите ответ для ${conv.name || "покупателя"}`)
      await sendTelegramReplyToChat(
        chatId,
        [
          `<b>Ответ покупателю:</b> ${escapeHtml(conv.name || "Покупатель")} (${escapeHtml(conv.email || "—")})`,
          `<b>Витрина:</b> ${escapeHtml(conv.market.toUpperCase())} / ${escapeHtml(conv.lang.toUpperCase())}`,
          `<b>ID диалога:</b> <code>#${escapeHtml(conv.id)}</code>`,
          ``,
          `Напишите текст ответа сообщением ниже:`,
        ].join("\n"),
        {
          reply_markup: {
            force_reply: true,
            selective: true,
            input_field_placeholder: `Ответ для ${conv.name || "покупателя"}...`,
          },
        },
      )
    }
    return
  }

  // 2. Handle text reply from admin in Telegram
  const msg = update.message
  if (!msg || !msg.chat || msg.from?.is_bot) return
  if (!isAuthorizedAdminChat(msg.chat.id)) return

  const rawText = (msg.text ?? msg.caption ?? "").trim()
  if (!rawText) return

  if (rawText === "/start" || rawText === "/help") {
    await sendTelegramReplyToChat(
      msg.chat.id,
      [
        `<b>Онлайн-чат TiresShop активен</b>`,
        ``,
        `Как отвечать покупателям прямо из Telegram:`,
        `1. Сделайте <b>Reply (Ответить)</b> на сообщение покупателя и отправьте текст.`,
        `2. Или нажмите кнопку <b>«Ответить ...»</b> под сообщением покупателя.`,
        `3. Если написать сообщение без Reply — оно уйдёт последнему активному покупателю в чате.`,
      ].join("\n"),
      { reply_to_message_id: msg.message_id },
    )
    return
  }

  // Determine target conversation:
  // Priority 1: #chat_... inside the replied-to message
  const repliedText = msg.reply_to_message?.text ?? msg.reply_to_message?.caption ?? ""
  let conversationId = extractConversationIdFromText(repliedText)
  let cleanBody = rawText
  let usedFallbackLatest = false

  // Priority 2: #chat_... or /reply chat_... written directly inside the admin's message
  if (!conversationId) {
    const inlineId = extractConversationIdFromText(rawText)
    if (inlineId) {
      conversationId = inlineId
      cleanBody = rawText
        .replace(/^\/reply\s+/i, "")
        .replace(new RegExp(`#?${inlineId}\\s*:?\\s*`), "")
        .trim()
    }
  }

  let conversation: ChatConversationRow | null = null
  if (conversationId) {
    conversation = await findConversationById(conversationId)
  }

  // Priority 3: If admin typed a plain message without Reply, send to the most recent active conversation
  if (!conversation && !conversationId) {
    conversation = await findLatestConversation()
    usedFallbackLatest = true
  }

  if (!conversation) {
    await sendTelegramReplyToChat(
      msg.chat.id,
      `Не найден активный диалог. Сделайте Reply (Ответить) на уведомление с сообщением покупателя.`,
      { reply_to_message_id: msg.message_id },
    )
    return
  }

  if (!cleanBody) return

  const deterministicMsgId = `tg_${msg.chat.id}_${msg.message_id}`
  const now = new Date()

  const inserted = await db
    .insert(chatMessages)
    .values({
      id: deterministicMsgId,
      conversationId: conversation.id,
      role: "admin",
      body: cleanBody.slice(0, 2000),
      createdAt: now,
    })
    .onConflictDoNothing()
    .returning({ id: chatMessages.id })

  // Only update conversation and send confirmation if this Telegram message wasn't already processed
  if (inserted.length > 0) {
    await db
      .update(chatConversations)
      .set({ lastMessageAt: now, unreadByAdmin: false })
      .where(eq(chatConversations.id, conversation.id))

    const buyerLabel = `${escapeHtml(conversation.name || "Покупатель")}${
      conversation.email ? ` (${escapeHtml(conversation.email)})` : ""
    }`

    await sendTelegramReplyToChat(
      msg.chat.id,
      usedFallbackLatest
        ? `✓ Ответ доставлен последнему активному покупателю: <b>${buyerLabel}</b> [<code>#${escapeHtml(conversation.id)}</code>]`
        : `✓ Ответ доставлен в чат на сайте: <b>${buyerLabel}</b>`,
      { reply_to_message_id: msg.message_id },
    )
  }
}

let lastSyncAt = 0
let syncInFlight: Promise<void> | null = null

/**
 * Pulls pending bot updates via Telegram getUpdates when no webhook is active.
 * Once processed, confirms the highest update_id with Telegram so updates are removed from Telegram's queue.
 * If a webhook is active on the bot, Telegram returns 409 Conflict and we skip polling cleanly.
 */
export async function syncTelegramChatUpdates(): Promise<void> {
  const { token } = getTelegramChatBotCredentials()
  if (!token) return

  const now = Date.now()
  if (now - lastSyncAt < 2500) return
  if (syncInFlight) return syncInFlight

  lastSyncAt = now
  syncInFlight = (async () => {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?timeout=0&limit=30&allowed_updates=${encodeURIComponent(
          JSON.stringify(["message", "callback_query"]),
        )}`,
        { cache: "no-store" },
      )
      // 409 means a webhook is registered on the bot; webhook handles updates directly
      if (res.status === 409 || !res.ok) return

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean
        result?: TelegramUpdate[]
      } | null

      if (!data?.ok || !Array.isArray(data.result) || data.result.length === 0) return

      let maxUpdateId = 0
      for (const update of data.result) {
        if (update.update_id > maxUpdateId) maxUpdateId = update.update_id
        await handleTelegramUpdate(update)
      }

      if (maxUpdateId > 0) {
        // Confirm processed updates with Telegram's queue
        await fetch(
          `https://api.telegram.org/bot${token}/getUpdates?offset=${maxUpdateId + 1}&limit=1&timeout=0`,
          { cache: "no-store" },
        ).catch(() => null)
      }
    } catch (e) {
      console.error("[telegram-chat] syncTelegramChatUpdates error:", e)
    } finally {
      syncInFlight = null
    }
  })()

  return syncInFlight
}

export async function registerTelegramWebhook(webhookUrl: string): Promise<{ ok: boolean; error?: string }> {
  const { token } = getTelegramChatBotCredentials()
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN не задан" }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
      cache: "no-store",
    })
    const json = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null
    if (!res.ok || !json?.ok) {
      return { ok: false, error: json?.description ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
