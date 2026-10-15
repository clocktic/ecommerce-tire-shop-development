import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Archivo, JetBrains_Mono } from "next/font/google"
import { LogOut } from "lucide-react"
import { isAdmin } from "@/lib/admin-auth"
import { adminLogout } from "@/lib/actions/admin"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle"
import { ThemeSync } from "@/components/layout/theme-provider"
import { THEME_COOKIE, themeClassName } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import "@/app/globals.css"

// Archivo has no Cyrillic; Russian admin copy falls back to the system sans in the font stack.
const archivo = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-archivo" })
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: "Contact Patch · Operations",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin()
  const theme = themeClassName((await cookies()).get(THEME_COOKIE)?.value)

  return (
    <html lang="ru" className={`${archivo.variable} ${jetbrains.variable} bg-background ${theme}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeSync />
          {!authed ? (
            <AdminLogin />
          ) : (
            <div className="min-h-dvh">
              <header className="sticky top-0 z-30 border-b border-border bg-background">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
                  <Link href="/admin" className="font-expanded text-sm font-extrabold uppercase">
                    Contact Patch <span className="text-muted-foreground">· Operations</span>
                  </Link>
                  <div className="flex items-center gap-1">
                    <AdminThemeToggle />
                    <form action={adminLogout}>
                      <Button variant="ghost" size="sm" type="submit">
                        <LogOut className="size-4" aria-hidden="true" />
                        Выйти
                      </Button>
                    </form>
                  </div>
                </div>
                <div className="mx-auto hidden max-w-7xl px-4 md:px-6 lg:block">
                  <AdminNav placement="desktop" />
                </div>
              </header>
              <AdminNav placement="mobile" />
              <main className="mx-auto max-w-7xl px-4 py-6 pb-28 md:px-6 lg:pb-10">{children}</main>
            </div>
          )}
      </body>
    </html>
  )
}
