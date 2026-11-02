import "server-only"

import { COMPANY } from "@/lib/company"
import { formatPrice, type Market } from "@/lib/markets"

export type TelegramResult = { ok: true } | { ok: false; skipped?: boolean; error?: string }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim())
}

/**
 * Sends an HTML-formatted message to one or more Telegram chats
 * (comma-separated chat IDs in TELEGRAM_CHAT_ID are supported).
 * Never throws so customer-facing flows (registration, checkout, webhooks) cannot fail because of Telegram.
 */
export async function sendTelegramNotification(html: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const rawChatIds = process.env.TELEGRAM_CHAT_ID?.trim()

  if (!token || !rawChatIds) {
    console.info("[telegram] skipped (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured)")
    return { ok: false, skipped: true, error: "TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы" }
  }

  const chatIds = rawChatIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  if (chatIds.length === 0) {
    return { ok: false, skipped: true, error: "TELEGRAM_CHAT_ID пуст" }
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
    `👤 <b>Новая регистрация покупателя · ${escapeHtml(COMPANY.tradingName)}</b>`,
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
  paymentRedirected: boolean
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
    `🛒 <b>Новый заказ ${escapeHtml(input.orderNumber)}</b>`,
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
    `<b>Статус:</b> ${input.paymentRedirected ? "Перенаправлен на оплату (CGPayTech)" : "Ожидает оплаты"}`,
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
  source?: string
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
    `✅ <b>Заказ успешно оплачен: ${escapeHtml(input.orderNumber)}</b>`,
    `<b>Сумма оплаты:</b> <b>${escapeHtml(fmtMoney(input.totalCents))}</b>`,
    `<b>Магазин:</b> ${escapeHtml(input.market.toUpperCase())}`,
    `<b>Покупатель:</b> ${escapeHtml(input.customerName || "—")}`,
    `<b>Email:</b> ${escapeHtml(input.email)}`,
    ...(input.phone ? [`<b>Телефон:</b> ${escapeHtml(input.phone)}`] : []),
    ...(destination ? [`<b>Куда:</b> ${escapeHtml(destination)}`] : []),
    ...(input.source ? [`<b>Источник:</b> ${escapeHtml(input.source)}`] : []),
    ...itemLines,
    ``,
    `<a href="${escapeHtml(COMPANY.url)}/admin/orders?q=${encodeURIComponent(input.orderNumber)}">Открыть заказ в админке →</a>`,
  ]

  return sendTelegramNotification(lines.join("\n"))
}
