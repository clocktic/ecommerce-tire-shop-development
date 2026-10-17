import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Archivo, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GeoBanner } from "@/components/layout/geo-banner"
import { CartProvider } from "@/components/cart/cart-provider"
import { I18nProvider } from "@/components/i18n/i18n-provider"
import { ConsentDefaults } from "@/components/legal/consent-defaults"
import { CookieConsent } from "@/components/legal/cookie-consent"
import { OrganizationJsonLd } from "@/components/legal/organization-jsonld"
import { ThemeSync } from "@/components/layout/theme-provider"
import { THEME_COOKIE, themeClassName } from "@/lib/theme"
import { ChatWidget } from "@/components/chat/chat-widget"
import { COMPANY } from "@/lib/company"
import { ALL_STORES, getDictionary, localeMeta, parseStore } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { SITE_URL, storeAlternates } from "@/lib/seo"
import "@/app/globals.css"

const archivo = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-archivo" })
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-jetbrains" })

type Params = Promise<{ market: string; lang: string }>

export function generateStaticParams() {
  return ALL_STORES.map(({ market, lang }) => ({ market, lang }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const t = getDictionary(store)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: t.meta.template },
    description: t.meta.description,
    alternates: storeAlternates(store, "/"),
    openGraph: { siteName: COMPANY.tradingName, locale: localeMeta(store).ogLocale, type: "website" },
    icons: { icon: "/icon.svg" },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f3f5" },
    { media: "(prefers-color-scheme: dark)", color: "#16181c" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const meta = localeMeta(store)
  const theme = themeClassName((await cookies()).get(THEME_COOKIE)?.value)

  return (
    <html
      lang={meta.htmlLang}
      className={`${archivo.variable} ${jetbrains.variable} overflow-x-clip bg-background ${theme}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        <ThemeSync />
        <ConsentDefaults market={store.market} />
        <I18nProvider store={store} t={t} x={getExtras(store)} intl={meta.intlLocale}>
          <CartProvider market={store.market}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-secondary focus:px-4 focus:py-2 focus:text-secondary-foreground"
            >
              {t.common.skip}
            </a>
            <GeoBanner />
            <Header store={store} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer store={store} />
            <CookieConsent />
            <ChatWidget />
          </CartProvider>
        </I18nProvider>
        <OrganizationJsonLd />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
