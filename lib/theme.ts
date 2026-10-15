export const THEME_COOKIE = "cp-theme"

export function themeClassName(value: string | undefined): "light" | "dark" | "" {
  return value === "light" || value === "dark" ? value : ""
}
