export const THEME_COOKIE = "ts-theme"

export function themeClassName(value: string | undefined): "light" | "dark" | "" {
  return value === "light" || value === "dark" ? value : ""
}
