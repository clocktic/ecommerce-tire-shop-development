import type { Metadata, Viewport } from "next"
import { Archivo, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GeoBanner } from "@/components/layout/geo-banner"
import { CartProvider } from "@/components/cart/cart-provider"
import { ConsentDefaults } from "@/components/legal/consent-defaults"
import { CookieConsent } from "@/components/legal/cookie-consent"
import { OrganizationJsonLd } from "@/components/legal/organization-jsonld"
import { COMPANY } from "@/lib/company"
import { MARKETS, isMarket, markets } from "@/lib/markets"
import { SITE_URL, marketAlternates } from "@/lib/seo"
import "../globals.css"

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export function generateStaticParams() {
  return markets.map((market) => ({ market }))
}

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params
  if (!isMarket(market)) return {}
  const name = COMPANY.tradingName
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} — Tires, Wheels & Brakes | ${MARKETS[market].short} Store`,
      template: `%s | ${name} ${MARKETS[market].short}`,
    },
    description:
      market === "us"
        ? "Tires, alloy wheels and brake systems shipped across the contiguous United States. Search tires by size, wheels by bolt pattern."
        : "Tires, alloy wheels and brake systems delivered across the EU with VAT included. EU tyre label on every tire.",
    alternates: marketAlternates(market, "/"),
    openGraph: { siteName: name, locale: MARKETS[market].ogLocale, type: "website" },
    icons: { icon: "/icon.svg" },
  }
}

export const viewport: Viewport = {
  themeColor: "#f2f3f5",
  width: "device-width",
  initialScale: 1,
}

export default async function MarketLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ market: string }>
}) {
  const { market } = await params
  if (!isMarket(market)) notFound()

  return (
    <html lang={MARKETS[market].htmlLang} className={`${archivo.variable} ${jetbrains.variable} bg-background`}>
      <head>
        <ConsentDefaults market={market} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <CartProvider market={market}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-secondary focus:px-4 focus:py-2 focus:text-secondary-foreground"
          >
            Skip to content
          </a>
          <GeoBanner market={market} />
          <Header market={market} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer market={market} />
          <CookieConsent market={market} />
        </CartProvider>
        <OrganizationJsonLd />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
