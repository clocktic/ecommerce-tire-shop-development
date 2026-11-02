import "server-only"
import fs from "node:fs"

import { COMPANY } from "@/lib/company"
import { formatPrice, type Market } from "@/lib/markets"

export type TelegramResult = { ok: true } | { ok: false; skipped?: boolean; error?: string }

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function readEnvFallback(key: string): string | undefined {
  const fromProc = process.env[key]?.trim()
  if (fromProc) return fromProc
  for (const envPath of ["/vercel/share/.env.project", "/vercel/share/v0-project/.env.development.local"]) {
    try {
      if (!fs.existsSync(envPath)) continue
      const content = fs.readFileSync(envPath, "utf8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (trimmed.startsWith(`${key}=`)) {
          const val = trimmed.slice(key.length + 1).trim().replace(/^["']|["']$/g, "")
          if (val) return val
        }
      }
    } catch {
      // ignore fs read errors in serverless runtime
    }
  }
  return undefined
}

export function getTelegramCredentials(): { token?: string; rawChatIds?: string; chatIds: string[] } {
  const token = readEnvFallback("TELEGRAM_BOT_TOKEN")
  const rawChatIds = readEnvFallback("TELEGRAM_CHAT_ID")
  const chatIds = (rawChatIds ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
  return { token, rawChatIds, chatIds }
}

export function getTelegramChatBotCredentials(): { token?: string; rawChatIds?: string; chatIds: string[] } {
  const token = readEnvFallback("TELEGRAM_CHAT_BOT_TOKEN") ?? readEnvFallback("TELEGRAM_BOT_TOKEN")
  const rawChatIds = readEnvFallback("TELEGRAM_CHAT_BOT_CHAT_ID") ?? readEnvFallback("TELEGRAM_CHAT_ID")
  const chatIds = (rawChatIds ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
  return { token, rawChatIds, chatIds }
}

export function isTelegramConfigured(): boolean {
  const { token, chatIds } = getTelegramCredentials()
  return Boolean(token && chatIds.length > 0)
}

export function isTelegramChatBotConfigured(): boolean {
  const token = readEnvFallback("TELEGRAM_CHAT_BOT_TOKEN")
  const rawChatIds = readEnvFallback("TELEGRAM_CHAT_BOT_CHAT_ID") ?? readEnvFallback("TELEGRAM_CHAT_ID")
  return Boolean(token && rawChatIds)
}

/**
 * Sends an HTML-formatted message to one or more Telegram chats
 * (comma-separated chat IDs in TELEGRAM_CHAT_ID are supported).
 * Never throws so customer-facing flows (registration, checkout, webhooks) cannot fail because of Telegram.
 */
export async function sendTelegramNotification(
  html: string,
  extra?: Record<string, unknown>,
): Promise<TelegramResult> {
  const { token, chatIds } = getTelegramCredentials()

  if (!token || chatIds.length === 0) {
    console.info("[telegram] skipped (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured)")
    return { ok: false, skipped: true, error: "TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы" }
  }

  let lastError: string | undefined
  let anySuccess = false

  for (const chatId of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

      if (!response.ok) {
        const body = await response.text().catch(() => "")
        lastError = `HTTP ${response.status}: ${body.slice(0, 200)}`
        console.error("[telegram] sendMessage failed:", lastError)
      } else {
        anySuccess = true
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
      console.error("[telegram] network error:", lastError)
    }
  }

  return anySuccess ? { ok: true } : { ok: false, error: lastError ?? "Не удалось отправить сообщение" }
}

export async function notifyTelegramNewUser(input: {
  name: string
  email: string
  id?: string
}): Promise<TelegramResult> {
  const lines = [
    `<b>Новая регистрация покупателя · ${escapeHtml(COMPANY.tradingName)}</b>`,
    ``,
    `<b>Имя:</b> ${escapeHtml(input.name || "—")}`,
    `<b>Email:</b> ${escapeHtml(input.email)}`,
    `<b>Статус клуба:</b> Скидка −7% активирована`,
    `<b>Время (UTC):</b> ${new Date().toISOString().replace("T", " ").slice(0, 19)}`,
  ]
  return sendTelegramNotification(lines.join("\n"))
}

export type TelegramOrderItem = {
  productName: string
  brandName?: string | null
  quantity: number
  lineTotalCents: number
}

export async function notifyTelegramNewOrder(input: {
  orderNumber: string
  market: Market
  lang: string
  customerName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  region?: string | null
  country: string
  subtotalCents: number
  discountCents: number
  shippingCents: number
  totalCents: number
  items: TelegramOrderItem[]
  paymentMethod?: string
  paymentStatusLabel?: string
}): Promise<TelegramResult> {
  const fmtMoney = (cents: number) => formatPrice(cents, input.market, input.market === "us" ? "en-US" : "de-DE")
  const locationParts = [
    input.address,
    [input.postalCode, input.city].filter(Boolean).join(" "),
    input.region || null,
    input.country,
  ].filter(Boolean)

  const itemLines = input.items.map((item) => {
    const label = item.brandName ? `${item.brandName} ${item.productName}` : item.productName
    return `• ${item.quantity} × ${escapeHtml(label)} — <b>${escapeHtml(fmtMoney(item.lineTotalCents))}</b>`
  })

  const lines = [
    `<b>Новый заказ ${escapeHtml(input.orderNumber)}</b>`,
    `<b>Магазин:</b> ${escapeHtml(input.market.toUpperCase())} (${escapeHtml(input.lang.toUpperCase())})`,
    ``,
    `<b>Покупатель:</b> ${escapeHtml(input.customerName)}`,
    `<b>Email:</b> ${escapeHtml(input.email)}`,
    `<b>Телефон:</b> ${escapeHtml(input.phone)}`,
    `<b>Адрес доставки:</b> ${escapeHtml(locationParts.join(", "))}`,
    ``,
    `<b>Состав заказа:</b>`,
    ...itemLines,
    ``,
    `<b>Подытог:</b> ${escapeHtml(fmtMoney(input.subtotalCents))}`,
    ...(input.discountCents > 0
      ? [`<b>Скидка клуба (−7%):</b> −${escapeHtml(fmtMoney(input.discountCents))}`]
      : []),
    `<b>Доставка:</b> ${input.shippingCents === 0 ? "Бесплатно" : escapeHtml(fmtMoney(input.shippingCents))}`,
    `<b>Итого к оплате:</b> <b>${escapeHtml(fmtMoney(input.totalCents))}</b>`,
    ...(input.paymentMethod ? [`<b>Способ оплаты:</b> ${escapeHtml(input.paymentMethod)}`] : []),
    `<b>Статус оплаты:</b> ${escapeHtml(input.paymentStatusLabel || "Ожидает оплаты")}`,
    ``,
    `<a href="${escapeHtml(COMPANY.url)}/admin/orders?q=${encodeURIComponent(input.orderNumber)}">Открыть заказ в админке →</a>`,
  ]

  return sendTelegramNotification(lines.join("\n"))
}

export async function notifyTelegramOrderPaid(input: {
  orderNumber: string
  market: Market
  customerName?: string | null
  email: string
  phone?: string | null
  city?: string | null
  country?: string | null
  totalCents: number
  items?: TelegramOrderItem[]
  paymentMethod?: string | null
  transactionId?: string | null
}): Promise<TelegramResult> {
  const fmtMoney = (cents: number) => formatPrice(cents, input.market, input.market === "us" ? "en-US" : "de-DE")
  const itemLines =
    input.items && input.items.length > 0
      ? [
          ``,
          `<b>Товары:</b>`,
          ...input.items.map((item) => {
            const label = item.brandName ? `${item.brandName} ${item.productName}` : item.productName
            return `• ${item.quantity} × ${escapeHtml(label)} (${escapeHtml(fmtMoney(item.lineTotalCents))})`
          }),
        ]
      : []

  const destination = [input.city, input.country].filter(Boolean).join(", ")

  const lines = [
    `<b>Заказ успешно оплачен: ${escapeHtml(input.orderNumber)}</b>`,
    `<b>Сумма оплаты:</b> <b>${escapeHtml(fmtMoney(input.totalCents))}</b>`,
    `<b>Магазин:</b> ${escapeHtml(input.market.toUpperCase())}`,
    ...(input.paymentMethod ? [`<b>Способ оплаты:</b> ${escapeHtml(input.paymentMethod)}`] : []),
    ...(input.transactionId ? [`<b>ID транзакции:</b> <code>${escapeHtml(input.transactionId)}</code>`] : []),
    `<b>Покупатель:</b> ${escapeHtml(input.customerName || "—")}`,
    `<b>Email:</b> ${escapeHtml(input.email)}`,
    ...(input.phone ? [`<b>Телефон:</b> ${escapeHtml(input.phone)}`] : []),
    ...(destination ? [`<b>Куда:</b> ${escapeHtml(destination)}`] : []),
    ...itemLines,
    ``,
    `<a href="${escapeHtml(COMPANY.url)}/admin/orders?q=${encodeURIComponent(input.orderNumber)}">Открыть заказ в админке →</a>`,
  ]

  return sendTelegramNotification(lines.join("\n"))
}

export async function sendTelegramChatBotMessage(
  html: string,
  extra?: Record<string, unknown>,
): Promise<TelegramResult> {
  const { token, chatIds } = getTelegramChatBotCredentials()

  if (!token || chatIds.length === 0) {
    console.info("[telegram-chat-bot] skipped (TELEGRAM_CHAT_BOT_TOKEN / TELEGRAM_CHAT_BOT_CHAT_ID not configured)")
    return { ok: false, skipped: true, error: "TELEGRAM_CHAT_BOT_TOKEN или TELEGRAM_CHAT_BOT_CHAT_ID не заданы" }
  }

  let lastError: string | undefined
  let anySuccess = false

  for (const chatId of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

      if (!response.ok) {
        const body = await response.text().catch(() => "")
        lastError = `HTTP ${response.status}: ${body.slice(0, 200)}`
        console.error("[telegram-chat-bot] sendMessage failed:", lastError)
      } else {
        anySuccess = true
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
      console.error("[telegram-chat-bot] network error:", lastError)
    }
  }

  return anySuccess ? { ok: true } : { ok: false, error: lastError ?? "Не удалось отправить сообщение" }
}

export async function notifyTelegramChatMessage(input: {
  conversationId: string
  name: string
  email: string
  market: string
  lang: string
  body: string
}): Promise<TelegramResult> {
  const lines = [
    `<b>Сообщение в онлайн-чате · ${escapeHtml(COMPANY.tradingName)}</b>`,
    `<b>Покупатель:</b> ${escapeHtml(input.name)} (${escapeHtml(input.email)})`,
    `<b>Витрина и язык:</b> ${escapeHtml(input.market.toUpperCase())} / ${escapeHtml(input.lang.toUpperCase())}`,
    `<b>ID диалога:</b> <code>#${escapeHtml(input.conversationId)}</code>`,
    ``,
    `<blockquote>${escapeHtml(input.body)}</blockquote>`,
    ``,
    `<i>Ответьте (Reply) на это сообщение в Telegram или нажмите кнопку ниже — ваш ответ сразу появится у покупателя на сайте.</i>`,
  ]

  return sendTelegramChatBotMessage(lines.join("\n"), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `Ответить ${input.name.slice(0, 24)}`,
            callback_data: `reply:${input.conversationId}`,
          },
        ],
        [
          {
            text: "Открыть чат в админке →",
            url: `${COMPANY.url}/admin/chat`,
          },
        ],
      ],
    },
  })
}

