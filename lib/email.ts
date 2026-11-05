import "server-only"

import tls from "tls"
import nodemailer from "nodemailer"
import { headers } from "next/headers"
import { COMPANY } from "@/lib/company"
import { formatPrice, type Market } from "@/lib/markets"
import { emailAssetAttachments, emailCopy, emailStore, renderEmail, type EmailDetails, type ServiceEmailTemplateId } from "@/lib/email-templates"
import { localeMeta, type Store } from "@/lib/i18n/config"

const DEFAULT_SMTP_HOST = "smtppro.zoho.com"
const DEFAULT_SMTP_PORT = 465
const DEFAULT_IMAP_HOST = "imappro.zoho.com"
const DEFAULT_IMAP_PORT = 993

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST
  const port = Number(process.env.SMTP_PORT?.trim() || DEFAULT_SMTP_PORT)
  const user = process.env.SMTP_USER?.trim() || COMPANY.email
  const pass = process.env.SMTP_PASS?.trim() || process.env.ZOHO_SMTP_PASSWORD?.trim() || ""
  const from = process.env.MAIL_FROM?.trim() || `${COMPANY.tradingName} <${COMPANY.email}>`
  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
    configured: Boolean(pass),
  }
}

export function isEmailConfigured(): boolean {
  return getSmtpConfig().configured
}

function transport() {
  const cfg = getSmtpConfig()
  if (!cfg.configured) return null
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
}

export async function sendMail(input: {
  to: string
  subject: string
  paragraphs: string[]
  cta?: { label: string; href: string }
  signoff: string
  replyTo?: string
  copyStoreInbox?: boolean
  template?: ServiceEmailTemplateId
  store?: Store
  details?: EmailDetails
}): Promise<boolean> {
  const mailer = transport()
  const cfg = getSmtpConfig()
  if (!mailer) {
    console.log("[email] SMTP_PASS not configured for info@tiresshop.net, skipped:", input.subject)
    return false
  }

  const recipientLower = input.to.trim().toLowerCase()
  const shouldBccStore = Boolean(input.copyStoreInbox && recipientLower !== COMPANY.email.toLowerCase())

  try {
    if (input.template && ["season", "loyalty"].includes(input.template)) {
      throw new Error("Marketing delivery requires a separate consent and unsubscribe workflow")
    }
    const { html, text, assetIds } = renderEmail(input)
    await mailer.sendMail({
      from: cfg.from,
      to: input.to,
      replyTo: input.replyTo ?? COMPANY.email,
      ...(shouldBccStore ? { bcc: COMPANY.email } : {}),
      subject: input.subject,
      text,
      html,
      attachments: emailAssetAttachments(assetIds),
      disableFileAccess: true,
      disableUrlAccess: true,
    })
    return true
  } catch (error) {
    console.error("[email] send failed:", error)
    return false
  }
}

/**
 * Sends an incoming notification email directly into the store inbox (info@tiresshop.net)
 * with Reply-To set to the customer's email so the operator can reply directly from Zoho Mail.
 */
export async function sendStoreInboxMail(input: {
  subject: string
  paragraphs: string[]
  customerEmail?: string
  customerName?: string
  cta?: { label: string; href: string }
}): Promise<boolean> {
  const replyTo =
    input.customerEmail && input.customerName
      ? `${input.customerName.replace(/["<>]/g, "")} <${input.customerEmail}>`
      : input.customerEmail || COMPANY.email

  return sendMail({
    to: COMPANY.email,
    replyTo,
    subject: input.subject,
    paragraphs: input.paragraphs,
    cta: input.cta,
    signoff: `${COMPANY.tradingName} · Уведомление магазина`,
  })
}

export async function sendContactFormEmails(input: {
  name: string
  email: string
  orderNumber?: string | null
  subject?: string | null
  message: string
  market: string
  lang: string
}): Promise<void> {
  const store = emailStore(input.market, input.lang)
  const c = emailCopy(store)
  const topic = input.subject?.trim() || c.copy[15][0]
  const orderTag = input.orderNumber ? ` (Заказ ${input.orderNumber})` : ""

  await Promise.all([
    sendStoreInboxMail({
      customerName: input.name,
      customerEmail: input.email,
      subject: `[Сайт · Контакты] ${topic}${orderTag} — от ${input.name}`,
      paragraphs: [
        `Новое входящее сообщение с сайта ${COMPANY.domain} (${input.market.toUpperCase()}/${input.lang.toUpperCase()}):`,
        `Отправитель: ${input.name} <${input.email}>`,
        ...(input.orderNumber ? [`Номер заказа: ${input.orderNumber}`] : []),
        ...(input.subject ? [`Тема: ${input.subject}`] : []),
        `Сообщение:\n${input.message}`,
        `Чтобы ответить покупателю, просто нажмите «Ответить» (Reply) в почте или ответьте из админки.`,
      ],
      cta: { label: "Открыть письма в админке", href: `${COMPANY.url}/admin/messages` },
    }),
    sendMail({
      to: input.email,
      replyTo: COMPANY.email,
      template: "contact",
      store,
      details: { orderNumber: input.orderNumber || undefined },
      subject: `${c.copy[15][0]} · ${topic} · ${COMPANY.tradingName}`,
      paragraphs: [c.copy[15][2], `${c.message}:\n${input.message}`],
      signoff: c.footer,
    }),
  ])
}

export async function notifyEmailNewUser(input: {
  name: string
  email: string
  market?: string
  lang?: string
}): Promise<void> {
  let store = emailStore(input.market, input.lang)
  if (!input.market && !input.lang) {
    try {
      const requestHeaders = await headers()
      const pathname = new URL(requestHeaders.get("referer") || COMPANY.url).pathname
      const match = pathname.match(/^\/(us|eu)\/([a-z]{2})(?:\/|$)/)
      if (match) store = emailStore(match[1], match[2])
    } catch {
      // Programmatic account creation may have no Next.js request context or storefront locale.
    }
  }
  const c = emailCopy(store)
  await Promise.all([
    sendMail({
      to: input.email,
      replyTo: COMPANY.email,
      template: "welcome",
      store,
      subject: `${c.copy[4][0]} · ${COMPANY.tradingName}`,
      paragraphs: [],
      signoff: c.footer,
    }),
    sendStoreInboxMail({
      customerName: input.name,
      customerEmail: input.email,
      subject: `[Регистрация] Новый покупатель: ${input.name || input.email}`,
      paragraphs: [
        `На сайте ${COMPANY.domain} зарегистрировался новый покупатель.`,
        `Имя: ${input.name || "—"}`,
        `Email: ${input.email}`,
        `Статус клуба: Скидка −7% активирована`,
      ],
    }),
  ])
}

export async function notifyEmailOrderPaid(input: {
  orderNumber: string
  market: Market
  lang?: string
  customerName?: string | null
  email: string
  phone?: string | null
  city?: string | null
  country?: string | null
  totalCents: number
  items?: { productName: string; brandName?: string | null; quantity: number; lineTotalCents: number }[]
  paymentMethod?: string | null
  transactionId?: string | null
}): Promise<void> {
  const store = emailStore(input.market, input.lang)
  const c = emailCopy(store)
  const fmtMoney = (cents: number) => formatPrice(cents, input.market, localeMeta(store).intlLocale)
  const itemLines = (input.items ?? []).map((item) => {
    const label = item.brandName ? `${item.brandName} ${item.productName}` : item.productName
    return `${item.quantity} × ${label} — ${fmtMoney(item.lineTotalCents)}`
  })

  await Promise.all([
    sendMail({
      to: input.email,
      replyTo: COMPANY.email,
      template: "paid",
      store,
      details: { orderNumber: input.orderNumber, totalCents: input.totalCents, items: input.items },
      subject: `${c.copy[5][0]} · ${input.orderNumber} · ${COMPANY.tradingName}`,
      paragraphs: [],
      signoff: c.footer,
    }),
    sendStoreInboxMail({
      customerName: input.customerName ?? undefined,
      customerEmail: input.email,
      subject: `[Оплачен заказ] ${input.orderNumber} — ${fmtMoney(input.totalCents)}`,
      paragraphs: [
        `Заказ ${input.orderNumber} успешно оплачен.`,
        `Сумма: ${fmtMoney(input.totalCents)} (${input.market.toUpperCase()})`,
        `Покупатель: ${input.customerName || "—"} <${input.email}>`,
        ...(input.phone ? [`Телефон: ${input.phone}`] : []),
        ...(input.city || input.country ? [`Город / Страна: ${[input.city, input.country].filter(Boolean).join(", ")}`] : []),
        ...(input.paymentMethod ? [`Способ оплаты: ${input.paymentMethod}`] : []),
        ...(input.transactionId ? [`ID транзакции: ${input.transactionId}`] : []),
        ...(itemLines.length > 0 ? [`Товары:\n${itemLines.join("\n")}`] : []),
      ],
      cta: {
        label: "Открыть заказ в админке",
        href: `${COMPANY.url}/admin/orders?q=${encodeURIComponent(input.orderNumber)}`,
      },
    }),
  ])
}

export async function notifyEmailChatMessage(input: {
  conversationId: string
  name: string
  email: string
  market: string
  lang: string
  body: string
}): Promise<boolean> {
  return sendStoreInboxMail({
    customerName: input.name,
    customerEmail: input.email,
    subject: `[Онлайн-чат] Сообщение от ${input.name} (${input.email})`,
    paragraphs: [
      `Новое сообщение в онлайн-чате на сайте (${input.market.toUpperCase()}/${input.lang.toUpperCase()}):`,
      `Покупатель: ${input.name} <${input.email}>`,
      `Сообщение:\n${input.body}`,
    ],
    cta: { label: "Ответить в чате админки", href: `${COMPANY.url}/admin/chat` },
  })
}

export async function sendTestStoreEmail(): Promise<{ ok: boolean; error?: string }> {
  const mailer = transport()
  const cfg = getSmtpConfig()
  if (!mailer) {
    return {
      ok: false,
      error: "Не задан пароль почты SMTP_PASS в переменных окружения (Vars)",
    }
  }
  try {
    const { html, text, subject, assetIds } = renderEmail({
      subject: `Тестовое письмо · ${COMPANY.tradingName} (${COMPANY.email})`,
      paragraphs: [
        `Это проверка оформления и отправки писем магазина ${COMPANY.domain}.`,
        `Сервер исходящей почты (SMTP): ${cfg.host}:${cfg.port}`,
        `Сервер входящей почты (IMAP): ${DEFAULT_IMAP_HOST}:${DEFAULT_IMAP_PORT}`,
        `Тест не создаёт заказов и не отправляет уведомлений покупателям.`,
      ],
    })
    await mailer.sendMail({
      from: cfg.from,
      to: COMPANY.email,
      replyTo: COMPANY.email,
      subject,
      text,
      html,
      attachments: emailAssetAttachments(assetIds),
      disableFileAccess: true,
      disableUrlAccess: true,
    })
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  }
}

export type ImapInboxItem = {
  uid: number
  subject: string
  from: string
  date: string
}

function decodeMimeWords(str: string): string {
  return str.replace(/=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g, (_m, charset, encoding, text) => {
    try {
      const enc = String(encoding).toUpperCase()
      if (enc === "B") {
        return Buffer.from(text, "base64").toString("utf8")
      }
      if (enc === "Q") {
        const qp = String(text)
          .replace(/_/g, " ")
          .replace(/=([0-9A-Fa-f]{2})/g, (_x, hex) => String.fromCharCode(parseInt(hex, 16)))
        return Buffer.from(qp, "binary").toString("utf8")
      }
      void charset
    } catch {
      // ignore decode errors
    }
    return text
  })
}

/**
 * Reads the latest incoming message headers from Zoho Mail IMAP (imap.zoho.com:993)
 * using the same credentials (SMTP_USER / info@tiresshop.net + SMTP_PASS).
 */
export async function fetchZohoInboxMessages(limit = 15): Promise<{
  configured: boolean
  messages: ImapInboxItem[]
  error?: string
}> {
  const cfg = getSmtpConfig()
  if (!cfg.configured) {
    return { configured: false, messages: [] }
  }
  const host = process.env.IMAP_HOST?.trim() || DEFAULT_IMAP_HOST
  const port = Number(process.env.IMAP_PORT?.trim() || DEFAULT_IMAP_PORT)

  return new Promise((resolve) => {
    const socket = tls.connect({ host, port, servername: host, timeout: 7000 })
    let buffer = ""
    let step = 0
    let done = false

    const finish = (res: { configured: boolean; messages: ImapInboxItem[]; error?: string }) => {
      if (done) return
      done = true
      try {
        socket.destroy()
      } catch {
        // ignore
      }
      resolve(res)
    }

    const quote = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`

    socket.on("timeout", () => finish({ configured: true, messages: [], error: "Таймаут подключения к IMAP" }))
    socket.on("error", (err) => finish({ configured: true, messages: [], error: err.message }))

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8")

      if (step === 0 && buffer.includes("\r\n")) {
        step = 1
        buffer = ""
        socket.write(`A1 LOGIN ${quote(cfg.user)} ${quote(cfg.pass)}\r\n`)
        return
      }

      if (step === 1 && /A1 (OK|NO|BAD)/i.test(buffer)) {
        if (!/A1 OK/i.test(buffer)) {
          const needsImapToggle = /enable IMAP/i.test(buffer)
          finish({
            configured: true,
            messages: [],
            error: needsImapToggle
              ? "В Zoho Mail ещё не включена галочка IMAP: откройте mail.zoho.com → Настройки (шестерёнка) → Почтовые учетные записи → info@tiresshop.net → поставьте галочку «Доступ по протоколу IMAP»."
              : "Ошибка авторизации IMAP (проверьте SMTP_PASS / App Password в Zoho)",
          })
          return
        }
        step = 2
        buffer = ""
        socket.write(`A2 SELECT INBOX\r\n`)
        return
      }

      if (step === 2 && /A2 (OK|NO|BAD)/i.test(buffer)) {
        const existsMatch = buffer.match(/\*\s+(\d+)\s+EXISTS/i)
        const total = existsMatch ? Number(existsMatch[1]) : 0
        if (total === 0) {
          socket.write(`A4 LOGOUT\r\n`)
          finish({ configured: true, messages: [] })
          return
        }
        const start = Math.max(1, total - limit + 1)
        step = 3
        buffer = ""
        socket.write(`A3 FETCH ${start}:${total} (UID BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])\r\n`)
        return
      }

      if (step === 3 && /A3 (OK|NO|BAD)/i.test(buffer)) {
        const items: ImapInboxItem[] = []
        const blocks = buffer.split(/\*\s+\d+\s+FETCH/i).slice(1)
        for (const block of blocks) {
          const uidMatch = block.match(/UID\s+(\d+)/i)
          const fromMatch = block.match(/^From:\s*(.+)$/im)
          const subjMatch = block.match(/^Subject:\s*(.+)$/im)
          const dateMatch = block.match(/^Date:\s*(.+)$/im)
          items.push({
            uid: uidMatch ? Number(uidMatch[1]) : items.length + 1,
            from: decodeMimeWords((fromMatch?.[1] ?? "—").trim()),
            subject: decodeMimeWords((subjMatch?.[1] ?? "(Без темы)").trim()),
            date: (dateMatch?.[1] ?? "").trim(),
          })
        }
        socket.write(`A4 LOGOUT\r\n`)
        finish({ configured: true, messages: items.reverse() })
      }
    })
  })
}
