import { ADMIN_ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/shipping/tracking"
import { Button } from "@/components/ui/button"

export function OrderFilters({ action, status, q, withStatus = true }: { action: string; status?: string; q?: string; withStatus?: boolean }) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-2" role="search">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="label-caps text-muted-foreground">Поиск</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Номер заказа, email или трек"
          className="h-10 min-w-56 border border-border bg-card px-3"
        />
      </label>
      {withStatus && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="label-caps text-muted-foreground">Статус</span>
          <select name="status" defaultValue={status ?? ""} className="h-10 border border-border bg-card px-3">
            <option value="">Все</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ADMIN_ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      )}
      <Button type="submit" variant="outline" className="h-10">
        Показать
      </Button>
    </form>
  )
}
