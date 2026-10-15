"use client"

import { Moon, Sun } from "lucide-react"
import { toggleTheme } from "@/components/layout/theme-provider"

export function AdminThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Сменить тему"
      className="p-2 text-muted-foreground hover:text-foreground"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
    </button>
  )
}
