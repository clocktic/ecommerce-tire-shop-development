"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, count, eq, ne } from "drizzle-orm"
import { createAdminSession, destroyAdminSession, requireAdmin, verifyPassword } from "@/lib/admin-auth"
import { addMessage } from "@/lib/chat"
import { db } from "@/lib/db"
import { chatConversations, contactMessages, orders, products } from "@/lib/db/schema"
import { isCategory, type Availability, type Offer, type Product } from "@/lib/catalog"
import { markets } from "@/lib/markets"
import { confirmOrderPayment } from "@/lib/payments/confirm"
import { ensureShipmentOnShip, insertShipmentEvent, sendShipmentEventEmail } from "@/lib/shipping/events"
import { ORDER_STATUSES, isShipmentStatus, type OrderStatus } from "@/lib/shipping/tracking"
import { extrasFor } from "@/lib/i18n/extras"
import { fmt } from "@/lib/i18n/fmt"
import { localeMeta } from "@/lib/i18n/config"
import { COMPANY } from "@/lib/company"
import { sendMail, sendTestStoreEmail } from "@/lib/email"
import { emailCopy, emailStore, EMAIL_TEMPLATE_IDS, type ServiceEmailTemplateId } from "@/lib/email-templates"
import { orderStore } from "@/lib/shipping/events"
import { sendTelegramChatBotMessage, sendTelegramNotification } from "@/lib/telegram"

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string }

// ---------- session ----------

export async function adminLogin(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const password = String(form.get("password") ?? "")
  if (!verifyPassword(password)) return { ok: false, error: "Неверный пароль" }
  await createAdminSession()
  redirect("/admin")
}

export async function adminLogout() {
  await destroyAdminSession()
  redirect("/admin")
}

export async function getUnreadChatCount(): Promise<number> {
  await requireAdmin()
  const [row] = await db.select({ n: count() }).from(chatConversations).where(eq(chatConversations.unreadByAdmin, true))
  return row?.n ?? 0
}

// ---------- orders & shipments ----------

export async function setOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  await requireAdmin()
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Неизвестный статус" }

  if (status === "paid") {
    await confirmOrderPayment({
      orderId,
      paymentMethod: "Подтверждено в админке (Bank Transfer / вручную)",
    })
  } else {
    const [changed] = await db
      .update(orders)
      .set({ status: status as OrderStatus, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), ne(orders.status, status)))
      .returning()
    if (changed && ["processing", "cancelled", "refunded", "delivered"].includes(status)) {
      const store = orderStore(changed)
      const c = emailCopy(store)
      const template = status as ServiceEmailTemplateId
      const title = c.copy[EMAIL_TEMPLATE_IDS.indexOf(template)][0]
      const sent = await sendMail({
        to: changed.email,
        template,
        store,
        subject: `${title} · ${changed.orderNumber} · ${COMPANY.tradingName}`,
        paragraphs: [],
        details: { orderNumber: changed.orderNumber },
        signoff: c.footer,
        copyStoreInbox: true,
      })
      if (!sent) {
        revalidatePath("/admin", "layout")
        return { ok: true, message: "Статус сохранён, но письмо не отправлено. Проверьте настройки почты." }
      }
    }
  }

  if (status === "shipped") {
    const result = await ensureShipmentOnShip(orderId)
    // One email with the tracking link when the parcel first ships.
    if (result?.created) {
      await sendShipmentEventEmail(result.order, {
        status: "label_created",
        location: null,
        comment: null,
        carrier: result.order.carrier,
      })
    }
  }
  revalidatePath("/admin", "layout")
  return { ok: true }
}

export async function testTelegramBot(): Promise<ActionResult> {
  await requireAdmin()
  const res = await sendTelegramNotification(
    [
      `<b>Тестовое уведомление · TiresShop</b>`,
      `Бот уведомлений успешно подключён к магазину <b>tiresshop.net</b>.`,
      `Сюда приходят уведомления:`,
      `• о регистрации нового покупателя`,
      `• о создании нового заказа`,
      `• об успешной оплате заказа`,
    ].join("\n"),
  )
  if (!res.ok) {
    return { ok: false, error: res.error ?? "Ошибка отправки в Telegram" }
  }
  return { ok: true, message: "Тест отправлен в бот заказов/регистраций" }
}

export async function testTelegramChatBot(): Promise<ActionResult> {
  await requireAdmin()
  const res = await sendTelegramChatBotMessage(
    [
      `<b>Тестовое сообщение · Онлайн-чат TiresShop</b>`,
      `Отдельный бот для живого чата с покупателями подключён.`,
      `Сюда приходят все сообщения из виджета чата на сайте, и вы можете отвечать покупателям прямо отсюда (через Reply или кнопку под сообщением).`,
    ].join("\n"),
  )
  if (!res.ok) {
    return { ok: false, error: res.error ?? "Ошибка отправки в бот онлайн-чата" }
  }
  return { ok: true, message: "Тест отправлен в бот онлайн-чата" }
}

export async function testStoreEmail(): Promise<ActionResult> {
  await requireAdmin()
  const res = await sendTestStoreEmail()
  if (!res.ok) {
    return { ok: false, error: res.error ?? "Ошибка отправки письма" }
  }
  return { ok: true, message: `Тестовое письмо отправлено на ${COMPANY.email}` }
}

export async function addShipmentEvent(form: FormData): Promise<ActionResult> {
  await requireAdmin()
  const orderId = String(form.get("orderId") ?? "")
  const status = String(form.get("status") ?? "")
  const carrier = String(form.get("carrier") ?? "").trim().slice(0, 60)
  const location = String(form.get("location") ?? "").trim().slice(0, 200) || null
  const comment = String(form.get("comment") ?? "").trim().slice(0, 1000) || null
  const notify = form.get("notify") === "on"
  if (!orderId || !isShipmentStatus(status) || !carrier) return { ok: false, error: "Заполните статус и перевозчика" }

  const shipped = await ensureShipmentOnShip(orderId)
  if (!shipped) return { ok: false, error: "Заказ не найден" }
  if (!["shipped", "delivered"].includes(shipped.order.status)) {
    await db.update(orders).set({ status: "shipped", updatedAt: new Date() }).where(eq(orders.id, orderId))
  }
  const event = await insertShipmentEvent({ orderId, status, location, comment, carrier })
  const mailed = notify ? await sendShipmentEventEmail({ ...shipped.order, carrier }, event) : false
  revalidatePath("/admin", "layout")
  return {
    ok: true,
    message: !notify ? "Статус добавлен" : mailed ? "Статус добавлен, письмо отправлено" : "Статус добавлен (письмо не ушло: SMTP не настроен)",
  }
}

export async function resendOrderConfirmation(orderId: string): Promise<ActionResult> {
  await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return { ok: false, error: "Заказ не найден" }
  const x = extrasFor(localeMeta(orderStore(order)).content)
  const sent = await sendMail({
    to: order.email,
    template: "order",
    store: orderStore(order),
    details: { orderNumber: order.orderNumber, totalCents: order.totalCents },
    subject: fmt(x.email.orderSubject, { number: order.orderNumber }),
    paragraphs: [fmt(x.email.orderBody, { number: order.orderNumber, total: (order.totalCents / 100).toFixed(2) + " " + order.currency })],
    signoff: x.email.signoff,
  })
  return sent ? { ok: true, message: "Письмо отправлено" } : { ok: false, error: "SMTP не настроен" }
}

// ---------- messages & chat ----------

export async function setMessageStatus(id: string, status: "new" | "answered" | "archived"): Promise<ActionResult> {
  await requireAdmin()
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id))
  revalidatePath("/admin/messages")
  return { ok: true }
}

export async function replyToContactMessage(form: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = String(form.get("id") ?? "").trim()
  const to = String(form.get("to") ?? "").trim()
  const subject = String(form.get("subject") ?? "").trim() || `Re: ${COMPANY.tradingName}`
  const body = String(form.get("body") ?? "").trim().slice(0, 5000)
  if (!to || !body) return { ok: false, error: "Укажите получателя и текст ответа" }
  const [original] = id ? await db.select().from(contactMessages)
    .where(and(eq(contactMessages.id, id), eq(contactMessages.email, to))).limit(1) : []
  const store = emailStore(original?.market, original?.lang)
  const c = emailCopy(store)

  const sent = await sendMail({
    to,
    template: "reply",
    store,
    details: { orderNumber: original?.orderNumber || undefined },
    cta: { label: c.reply, href: `mailto:${COMPANY.email}` },
    replyTo: COMPANY.email,
    copyStoreInbox: true,
    subject,
    paragraphs: body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    signoff: c.team,
  })
  if (!sent) {
    return { ok: false, error: "Не удалось отправить письмо — добавьте пароль почты SMTP_PASS в настройки Vars" }
  }
  if (id) {
    await db.update(contactMessages).set({ status: "answered" }).where(eq(contactMessages.id, id))
  }
  revalidatePath("/admin/messages")
  return { ok: true, message: `Ответ отправлен с ${COMPANY.email} на ${to}` }
}

export async function replyToChat(conversationId: string, body: string): Promise<ActionResult> {
  await requireAdmin()
  const text = body.trim().slice(0, 2000)
  if (!text) return { ok: false, error: "Пустое сообщение" }
  await addMessage(conversationId, "admin", text)
  const [conv] = await db.select().from(chatConversations).where(eq(chatConversations.id, conversationId)).limit(1)
  if (conv?.email) {
    const store = emailStore(conv.market, conv.lang)
    const c = emailCopy(store)
    await sendMail({
      to: conv.email,
      template: "chat",
      store,
      replyTo: COMPANY.email,
      subject: `${c.copy[17][0]} · ${COMPANY.tradingName}`,
      paragraphs: [text, c.respond],
      cta: { label: c.continue, href: `${COMPANY.url}/${store.market}/${store.lang}` },
      signoff: c.team,
    })
  }
  return { ok: true }
}

export async function markChatRead(conversationId: string): Promise<void> {
  await requireAdmin()
  await db.update(chatConversations).set({ unreadByAdmin: false }).where(eq(chatConversations.id, conversationId))
}

// ---------- catalog ----------

const AVAILABILITY: Availability[] = ["in_stock", "out_of_stock", "preorder"]

function str(form: FormData, name: string, max = 500): string {
  const v = form.get(name)
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}

function cents(value: string): number | undefined {
  if (!value) return undefined
  const n = Math.round(Number(value.replace(",", ".")) * 100)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
}

export async function saveProduct(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = str(form, "id", 80)
  const slug = str(form, "slug", 120).toLowerCase()
  const category = str(form, "category", 20)
  if (!id || !/^[a-z0-9-]+$/.test(slug)) return { ok: false, error: "Slug: только a-z, 0-9 и дефис" }
  if (!isCategory(category)) return { ok: false, error: "Неизвестная категория" }

  let extra: Record<string, unknown>
  try {
    extra = JSON.parse(str(form, "extra", 100_000) || "{}")
  } catch {
    return { ok: false, error: "Блок JSON содержит ошибку" }
  }
  if (!extra || typeof extra !== "object" || !extra[category === "tires" ? "tire" : category === "wheels" ? "wheel" : "brake"]) {
    return { ok: false, error: `В JSON нужен блок "${category === "tires" ? "tire" : category === "wheels" ? "wheel" : "brake"}"` }
  }

  const offers: Product["offers"] = {}
  let productStock = 40
  for (const market of markets) {
    if (form.get(`${market}.enabled`) !== "on") continue
    const priceCents = cents(str(form, `${market}.price`, 20))
    if (!priceCents) return { ok: false, error: `Цена для ${market.toUpperCase()} не указана` }
    const availability = str(form, `${market}.availability`, 20) as Availability
    const rawStock = Number.parseInt(str(form, `${market}.stock`, 10), 10)
    const stock = Number.isFinite(rawStock) && rawStock >= 0 ? rawStock : 40
    productStock = stock
    const offer: Offer = { priceCents, availability: AVAILABILITY.includes(availability) ? availability : "in_stock", stock }
    const compareAt = cents(str(form, `${market}.compareAt`, 20))
    const saleEndsAt = str(form, `${market}.saleEndsAt`, 40)
    if (compareAt) {
      // A strike-through price is only allowed with a real end date.
      if (!saleEndsAt) return { ok: false, error: `Для скидки ${market.toUpperCase()} нужна дата окончания` }
      if (compareAt <= priceCents) return { ok: false, error: `Старая цена ${market.toUpperCase()} должна быть выше текущей` }
      offer.compareAtCents = compareAt
      offer.saleEndsAt = new Date(saleEndsAt).toISOString()
    }
    const availableFrom = str(form, `${market}.availableFrom`, 40)
    if (availableFrom) offer.availableFrom = availableFrom
    offers[market] = offer
  }
  if (Object.keys(offers).length === 0) return { ok: false, error: "Включите хотя бы один рынок" }

  const product = {
    ...extra,
    id,
    slug,
    category,
    stock: productStock,
    name: str(form, "name", 200),
    brand: str(form, "brand", 100),
    gtin: str(form, "gtin", 20) || undefined,
    mpn: str(form, "mpn", 60) || undefined,
    supplierSku: str(form, "supplierSku", 60) || undefined,
    sample: form.get("sample") === "on" || undefined,
    images: lines(str(form, "images", 5000)),
    shortDescription: str(form, "shortDescription", 400),
    description: str(form, "description", 10_000),
    highlights: lines(str(form, "highlights", 3000)),
    specs: Array.isArray(extra.specs) ? extra.specs : [],
    offers,
  } as Product
  if (!product.name || !product.brand) return { ok: false, error: "Название и бренд обязательны" }
  if (product.gtin && !/^\d{8,14}$/.test(product.gtin)) return { ok: false, error: "GTIN: 8–14 цифр или пусто" }

  const archived = form.get("archived") === "on"
  const [clash] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1)
  if (clash && clash.id !== id) return { ok: false, error: "Такой slug уже занят" }

  await db
    .insert(products)
    .values({ id, slug, category, stock: productStock, data: product, archived })
    .onConflictDoUpdate({ target: products.id, set: { slug, category, stock: productStock, data: product, archived, updatedAt: new Date() } })

  revalidatePath("/", "layout")
  return { ok: true, message: "Сохранено" }
}

export async function setProductArchived(id: string, archived: boolean): Promise<ActionResult> {
  await requireAdmin()
  await db.update(products).set({ archived, updatedAt: new Date() }).where(eq(products.id, id))
  revalidatePath("/", "layout")
  return { ok: true }
}
