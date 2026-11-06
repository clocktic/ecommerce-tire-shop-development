import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"
import { generateSitemaps } from "@/app/products/sitemap"

export const revalidate = 3600

export default async function robots(): Promise<MetadataRoute.Robots> {
  const productSitemaps = (await generateSitemaps()).map(({ id }) => absoluteUrl(`/products/sitemap/${id}.xml`))
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/images/", "/feeds/", "/api/blob"],
        disallow: ["/api/", "/admin/", "/*/*/cart", "/*/*/checkout", "/*/*/order/"],
      },
      // Merchant Center, Shopping, and Ads crawlers must reach all product, image, feed, cart, and checkout pages.
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Storebot-Google",
          "AdsBot-Google",
          "AdsBot-Google-Mobile",
          "GoogleOther",
          "Google-InspectionTool",
        ],
        allow: "/",
        disallow: ["/admin/"],
      },
    ],
    sitemap: [absoluteUrl("/sitemap-index.xml"), absoluteUrl("/sitemap.xml"), ...productSitemaps],
  }
}
