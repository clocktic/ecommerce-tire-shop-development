"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function AdminThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Сменить тему"
      className="p-2 text-muted-foreground hover:text-foreground"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
    </button>
  )
}
