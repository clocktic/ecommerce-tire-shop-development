"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { setMessageStatus } from "@/lib/actions/admin"

const OPTIONS = [
  { value: "new", label: "Новое" },
  { value: "answered", label: "Отвечено" },
  { value: "archived", label: "В архив" },
] as const

export function MessageStatusButtons({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.filter((o) => o.value !== status).map((o) => (
        <Button key={o.value} variant="outline" size="sm" disabled={pending} onClick={() => start(() => setMessageStatus(id, o.value).then(() => undefined))}>
          {o.label}
        </Button>
      ))}
    </div>
  )
}
