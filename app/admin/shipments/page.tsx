import { isAdmin } from "@/lib/admin-auth"
import { loadAdminOrders } from "@/lib/admin-orders"
import { OrdersManager } from "@/components/admin/orders-manager"
import { OrderFilters } from "@/components/admin/order-filters"

type Search = Promise<{ q?: string }>

export default async function AdminShipmentsPage({ searchParams }: { searchParams: Search }) {
  if (!(await isAdmin())) return null
  const { q } = await searchParams
  const orders = await loadAdminOrders({ shippedOnly: true, q: q?.slice(0, 80) })
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-expanded text-2xl font-extrabold uppercase">Доставка</h1>
        <p className="text-sm text-muted-foreground">
          Отправления с трек-номером. Новый заказ попадает сюда, когда ему ставят статус «Отправлен» во вкладке «Заказы».
        </p>
      </div>
      <OrderFilters action="/admin/shipments" q={q} withStatus={false} />
      <OrdersManager orders={orders} focus="shipments" />
    </div>
  )
}
