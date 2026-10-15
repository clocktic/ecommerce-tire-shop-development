"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addShipmentEvent, resendOrderConfirmation, setOrderStatus, type ActionResult } from "@/lib/actions/admin"
import type { AdminOrder } from "@/lib/admin-orders"
import { formatPrice, type Market } from "@/lib/markets"
import {
  ADMIN_ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  SHIPMENT_STATUSES,
  adminStatusLabel,
  carriersFor,
  type OrderStatus,
} from "@/lib/shipping/tracking"
import { cn } from "@/lib/utils"

const date = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" })

const STATUS_TONE: Partial<Record<OrderStatus, string>> = {
  pending: "bg-muted text-muted-foreground",
  paid: "bg-primary text-primary-foreground",
  processing: "bg-primary/15 text-primary",
  shipped: "bg-secondary text-secondary-foreground",
  delivered: "bg-foreground text-background",
}

export function OrdersManager({ orders, focus }: { orders: AdminOrder[]; focus: "orders" | "shipments" }) {
  if (orders.length === 0) return <p className="border border-border bg-card p-6 text-muted-foreground">Заказов нет.</p>
  return (
    <ul className="flex flex-col gap-2">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} defaultOpen={orders.length === 1} focus={focus} />
      ))}
    </ul>
  )
}

function OrderRow({ order, defaultOpen, focus }: { order: AdminOrder; defaultOpen: boolean; focus: "orders" | "shipments" }) {
  const [open, setOpen] = useState(defaultOpen)
  const market = order.market as Market
  const latest = order.events[0]

  return (
    <li className="border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full items-center gap-2 p-4 text-left text-sm md:grid-cols-[1.2fr_1fr_1.4fr_1fr_auto]"
      >
        <span className="flex flex-col">
          <span className="font-mono font-semibold">{order.orderNumber}</span>
          <span className="text-xs text-muted-foreground">
            {date.format(new Date(order.createdAt))} · {order.market.toUpperCase()}/{order.lang}
          </span>
        </span>
        <span className="truncate">{order.email}</span>
        <span className="truncate text-muted-foreground">
          {focus === "shipments" || latest
            ? latest
              ? adminStatusLabel(latest.status, latest.carrier)
              : "Трек ещё не создан"
            : order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 text-xs font-semibold", STATUS_TONE[order.status as OrderStatus] ?? "bg-muted")}>
            {ADMIN_ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
          </span>
          <span className="font-mono tabular-nums">{formatPrice(order.totalCents, market, "ru-RU")}</span>
        </span>
        <ChevronDown className={cn("size-4 justify-self-end transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && <OrderDetail order={order} />}
    </li>
  )
}

function OrderDetail({ order }: { order: AdminOrder }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  const market = order.market as Market
  const carriers = carriersFor(market)

  function run(task: () => Promise<ActionResult>) {
    setResult(null)
    start(async () => {
      const r = await task()
      setResult(r)
      if (r.ok) router.refresh()
    })
  }

  return (
    <div className="grid gap-6 border-t border-border p-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4 text-sm">
        <section className="flex flex-col gap-1">
          <h3 className="label-caps text-muted-foreground">Покупатель</h3>
          <p className="font-semibold">{order.shippingName}</p>
          <p>
            {order.email} · {order.phone}
          </p>
          <p className="text-muted-foreground">
            {[order.shippingAddress1, `${order.shippingPostalCode ?? ""} ${order.shippingCity ?? ""}`.trim(), order.shippingRegion, order.shippingCountry]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="text-xs text-muted-foreground">{order.userId ? "Покупатель с аккаунтом" : "Гостевой заказ"}</p>
        </section>

        <section className="flex flex-col gap-1">
          <h3 className="label-caps text-muted-foreground">Товары</h3>
          <ul className="flex flex-col gap-1">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>
                  {i.quantity} × {i.productName} <span className="text-muted-foreground">({i.productSlug})</span>
                </span>
                <span className="font-mono tabular-nums">{formatPrice(i.lineTotalCents, market, "ru-RU")}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t border-border pt-1 font-semibold">
            <span>Итого</span>
            <span className="font-mono tabular-nums">{formatPrice(order.totalCents, market, "ru-RU")}</span>
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="label-caps text-muted-foreground">Статус заказа</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`status-${order.id}`} className="sr-only">
              Статус заказа
            </label>
            <select
              id={`status-${order.id}`}
              defaultValue={order.status}
              disabled={pending}
              onChange={(e) => run(() => setOrderStatus(order.id, e.target.value))}
              className="h-10 border border-border bg-background px-3"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ADMIN_ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => resendOrderConfirmation(order.id))}>
              Повторить письмо-подтверждение
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">«Отправлен» создаёт трек-номер и отправляет покупателю письмо со ссылкой.</p>
        </section>

        {order.trackingNumber && (
          <section className="flex flex-col gap-1">
            <h3 className="label-caps text-muted-foreground">Трек</h3>
            <p className="font-mono">{order.trackingNumber}</p>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary underline underline-offset-4">
                Страница отслеживания <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </section>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <form
          className="flex flex-col gap-3 border border-border bg-background p-4"
          onSubmit={(e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const el = e.currentTarget
            run(async () => {
              const r = await addShipmentEvent(form)
              if (r.ok) el.reset()
              return r
            })
          }}
        >
          <input type="hidden" name="orderId" value={order.id} />
          <h3 className="label-caps">Новый статус доставки</h3>
          <select name="status" required defaultValue="" className="h-10 border border-border bg-card px-3 text-sm" aria-label="Статус доставки">
            <option value="" disabled>
              Выберите статус…
            </option>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {adminStatusLabel(s)}
              </option>
            ))}
          </select>
          <select name="carrier" defaultValue={order.carrier ?? carriers[0]} className="h-10 border border-border bg-card px-3 text-sm" aria-label="Перевозчик">
            {carriers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="location" placeholder="Место (необязательно), напр. Köln Hub" maxLength={200} className="h-10 border border-border bg-card px-3 text-sm" />
          <textarea
            name="comment"
            rows={2}
            maxLength={1000}
            placeholder="Комментарий для покупателя (уходит как написан, без перевода)"
            className="border border-border bg-card px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notify" defaultChecked className="size-4 accent-primary" />
            Отправить покупателю письмо
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Сохранение…" : "Добавить статус"}
          </Button>
          {result && (
            <p role="status" className={cn("text-sm", result.ok ? "text-foreground" : "text-primary")}>
              {result.ok ? result.message ?? "Готово" : result.error}
            </p>
          )}
        </form>

        <section className="flex flex-col gap-2">
          <h3 className="label-caps text-muted-foreground">История доставки</h3>
          {order.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Событий пока нет.</p>
          ) : (
            <ol className="flex flex-col gap-2 border-l border-border pl-4 text-sm">
              {order.events.map((e) => (
                <li key={e.id} className="flex flex-col">
                  <span className="font-mono text-xs text-muted-foreground">{date.format(new Date(e.createdAt))}</span>
                  <span className="font-semibold">{adminStatusLabel(e.status, e.carrier)}</span>
                  <span className="text-muted-foreground">{[e.location, e.carrier].filter(Boolean).join(" · ")}</span>
                  {e.comment && <span>{e.comment}</span>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
