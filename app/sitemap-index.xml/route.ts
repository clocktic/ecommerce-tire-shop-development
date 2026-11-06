import { absoluteUrl } from "@/lib/seo"
import { generateSitemaps } from "@/app/products/sitemap"

export const revalidate = 3600

export async function GET() {
  const productIds = await generateSitemaps()
  const urls = [
    absoluteUrl("/sitemap.xml"),
    ...productIds.map(({ id }) => absoluteUrl(`/products/sitemap/${id}.xml`)),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`),
    "</sitemapindex>",
  ].join("\n")

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
