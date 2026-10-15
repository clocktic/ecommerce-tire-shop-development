"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { adminLogin, type ActionResult } from "@/lib/actions/admin"

export function AdminLogin() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminLogin, null)
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form action={action} className="flex w-full max-w-sm flex-col gap-4 border border-border bg-card p-6">
        <h1 className="font-expanded text-xl font-extrabold uppercase">Contact Patch · Operations</h1>
        <label htmlFor="admin-password" className="label-caps text-muted-foreground">
          Пароль
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 border border-border bg-background px-3 text-sm"
        />
        {state && !state.ok && (
          <p role="alert" className="text-sm text-primary">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Вход…" : "Войти"}
        </Button>
      </form>
    </main>
  )
}
