import { isAdmin } from "@/lib/admin-auth"
import { loadAdminOrders } from "@/lib/admin-orders"
import { ORDER_STATUSES } from "@/lib/shipping/tracking"
import { OrdersManager } from "@/components/admin/orders-manager"
import { OrderFilters } from "@/components/admin/order-filters"

type Search = Promise<{ status?: string; q?: string }>

export default async function AdminOrdersPage({ searchParams }: { searchParams: Search }) {
  if (!(await isAdmin())) return null
  const { status, q } = await searchParams
  const validStatus = status && (ORDER_STATUSES as readonly string[]).includes(status) ? status : undefined
  const orders = await loadAdminOrders({ status: validStatus, q: q?.slice(0, 80) })
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-expanded text-2xl font-extrabold uppercase">Заказы</h1>
      <OrderFilters action="/admin/orders" status={validStatus} q={q} />
      <OrdersManager orders={orders} focus="orders" />
    </div>
  )
}
