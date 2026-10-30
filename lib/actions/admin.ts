"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { count, eq } from "drizzle-orm"
import { createAdminSession, destroyAdminSession, requireAdmin, verifyPassword } from "@/lib/admin-auth"
import { addMessage } from "@/lib/chat"
import { db } from "@/lib/db"
import { chatConversations, contactMessages, orders, products } from "@/lib/db/schema"
import { isCategory, type Availability, type Offer, type Product } from "@/lib/catalog"
import { markets } from "@/lib/markets"
import { ensureShipmentOnShip, insertShipmentEvent, sendShipmentEventEmail } from "@/lib/shipping/events"
import { ORDER_STATUSES, isShipmentStatus, type OrderStatus } from "@/lib/shipping/tracking"
import { extrasFor } from "@/lib/i18n/extras"
import { fmt } from "@/lib/i18n/fmt"
import { localeMeta } from "@/lib/i18n/config"
import { sendMail } from "@/lib/email"
import { orderStore } from "@/lib/shipping/events"

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
  await db
    .update(orders)
    .set({ status: status as OrderStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId))

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

export async function replyToChat(conversationId: string, body: string): Promise<ActionResult> {
  await requireAdmin()
  const text = body.trim().slice(0, 2000)
  if (!text) return { ok: false, error: "Пустое сообщение" }
  await addMessage(conversationId, "admin", text)
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
