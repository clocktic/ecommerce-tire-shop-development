import crypto from "node:crypto"
import { revalidatePath, revalidateTag } from "next/cache"
import { getStampedReviews, reviewStats, STAMPED_REVIEWS_TAG } from "@/lib/stamped-reviews"
import { NextResponse } from "next/server"
import { STAMPED_STORE_HASH } from "@/lib/stamped"
import { STAMPED_PRIVATE_API_KEY } from "@/lib/stamped-server"
import { escapeHtml, sendTelegramNotification } from "@/lib/telegram"

export const dynamic = "force-dynamic"

const MARKETS = ["us", "eu"] as const
const LANGS = ["en", "de", "fr", "es", "it", "nl"] as const

function revalidateReviewRoutes(productSlug?: string) {
  revalidateTag(STAMPED_REVIEWS_TAG, "max")
  for (const market of MARKETS) {
    for (const lang of LANGS) {
      revalidatePath(`/${market}/${lang}`)
      revalidatePath(`/${market}/${lang}/reviews`)
      if (productSlug) {
        revalidatePath(`/${market}/${lang}/product/${productSlug}`)
      }
    }
  }
}

function verifyStampedSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.STAMPED_WEBHOOK_SECRET || STAMPED_PRIVATE_API_KEY
  if (!signatureHeader || !secret) return true

  const cleanSig = signatureHeader.replace(/^sha256=/i, "").trim()
  const digestHex = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
  const digestBase64 = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")

  return (
    cleanSig.toLowerCase() === digestHex.toLowerCase() ||
    cleanSig === digestBase64
  )
}

export async function GET() {
  revalidateReviewRoutes()
  const reviews = await getStampedReviews()
  const stats = reviewStats(reviews)
  return NextResponse.json({
    ok: true,
    service: "stamped-webhook",
    storeHash: STAMPED_STORE_HASH,
    publishedReviews: stats.count,
    averageRating: Number(stats.average.toFixed(2)),
    distribution: stats.distribution,
  })
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature =
      request.headers.get("x-stamped-hmac-sha256") ||
      request.headers.get("x-stamped-signature") ||
      request.headers.get("x-webhook-signature")

    if (signature && !verifyStampedSignature(rawBody, signature)) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
    }

    const payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {}
    const event =
      (typeof payload.event === "string" && payload.event) ||
      (typeof payload.type === "string" && payload.type) ||
      request.headers.get("x-stamped-topic") ||
      "review.updated"

    const data =
      payload.data && typeof payload.data === "object"
        ? (payload.data as Record<string, unknown>)
        : payload.review && typeof payload.review === "object"
          ? (payload.review as Record<string, unknown>)
          : payload

    const productSlug =
      (typeof data.productSKU === "string" && data.productSKU) ||
      (typeof data.productHandle === "string" && data.productHandle) ||
      ""

    const productName =
      (typeof data.productName === "string" && data.productName) ||
      (typeof data.productTitle === "string" && data.productTitle) ||
      productSlug ||
      "Product"

    const rating =
      typeof data.reviewRating === "number"
        ? data.reviewRating
        : typeof data.rating === "number"
          ? data.rating
          : null

    const author =
      (typeof data.author === "string" && data.author) ||
      (typeof data.email === "string" && data.email) ||
      "Customer"

    const reviewTitle =
      (typeof data.reviewTitle === "string" && data.reviewTitle) ||
      (typeof data.title === "string" && data.title) ||
      ""

    const reviewBody =
      (typeof data.reviewMessage === "string" && data.reviewMessage) ||
      (typeof data.body === "string" && data.body) ||
      (typeof data.question === "string" && data.question) ||
      ""

    revalidateReviewRoutes(productSlug || undefined)

    const stars =
      rating && rating >= 1 && rating <= 5
        ? `${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))} (${rating}/5)`
        : "Новое событие"

    const lines = [
      `⭐ <b>Stamped.io — ${escapeHtml(String(event))}</b>`,
      `<b>Товар:</b> ${escapeHtml(productName)}`,
      rating ? `<b>Оценка:</b> ${escapeHtml(stars)}` : null,
      `<b>Автор:</b> ${escapeHtml(author)}`,
      reviewTitle ? `<b>Заголовок:</b> ${escapeHtml(reviewTitle)}` : null,
      reviewBody ? `<b>Текст:</b> ${escapeHtml(reviewBody.slice(0, 500))}` : null,
    ].filter(Boolean)

    await sendTelegramNotification(lines.join("\n"))

    return NextResponse.json({
      ok: true,
      event,
      productSlug: productSlug || null,
    })
  } catch (error) {
    console.error("[stamped-webhook] failed:", error)
    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 400 })
  }
}
