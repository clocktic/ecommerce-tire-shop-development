import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"
import { generateSitemaps } from "@/app/products/sitemap"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const productSitemaps = (await generateSitemaps()).map(({ id }) => absoluteUrl(`/products/sitemap/${id}.xml`))
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/images/", "/feeds/"],
        disallow: ["/api/", "/admin/", "/*/*/cart", "/*/*/checkout", "/*/*/order/"],
      },
      // Merchant Center and Shopping crawlers must reach product pages and images in every store language.
      { userAgent: ["Googlebot", "Googlebot-Image", "Storebot-Google", "AdsBot-Google"], allow: "/" },
    ],
    sitemap: [absoluteUrl("/sitemap.xml"), ...productSitemaps],
  }
}
