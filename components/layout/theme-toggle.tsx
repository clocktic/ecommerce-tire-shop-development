"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useI18n } from "@/components/i18n/i18n-provider"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { x } = useI18n()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={x.theme.toggle}
      title={x.theme.toggle}
      className="flex items-center p-1 text-secondary-foreground/80 transition-colors hover:text-secondary-foreground"
    >
      {/* Both icons render; CSS picks one so server and client markup match before the theme resolves. */}
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
    </button>
  )
}
