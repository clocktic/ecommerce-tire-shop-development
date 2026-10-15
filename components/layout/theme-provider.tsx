"use client"

import { useLayoutEffect } from "react"
import { THEME_COOKIE } from "@/lib/theme"

const STORAGE_KEY = "cp-theme"

function persist(next: "light" | "dark") {
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Storage can be blocked; the cookie still carries the choice.
  }
  document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
}

export function toggleTheme() {
  const root = document.documentElement
  const isDark =
    root.classList.contains("dark") ||
    (!root.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const next = isDark ? "light" : "dark"
  root.classList.remove("light", "dark")
  root.classList.add(next)
  persist(next)
}

// Applies a stored choice before paint. No script tag: the preview refuses scripts rendered by React.
export function ThemeSync() {
  useLayoutEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      stored = null
    }
    if (stored !== "light" && stored !== "dark") return
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(stored)
  }, [])
  return null
}
