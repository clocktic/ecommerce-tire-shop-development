import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/images/", "/feeds/"],
        disallow: ["/api/", "/*/*/cart", "/*/*/checkout"],
      },
      // Merchant Center and Shopping crawlers must reach product pages and images in every store language.
      { userAgent: ["Googlebot", "Googlebot-Image", "Storebot-Google", "AdsBot-Google"], allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
