import { NextResponse } from "next/server"
import { ilike } from "drizzle-orm"
import { COMPANY } from "@/lib/company"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderNumber = (searchParams.get("order") || searchParams.get("externalId") || "").trim()
  const rawStatus = (
    searchParams.get("status") ||
    searchParams.get("result") ||
    searchParams.get("paymentStatus") ||
    ""
  )
    .trim()
    .toLowerCase()

  if (!orderNumber) {
    return NextResponse.redirect(`${COMPANY.url}/us/en`, 303)
  }

  const [order] = await db
    .select({
      orderNumber: orders.orderNumber,
      market: orders.market,
      lang: orders.lang,
    })
    .from(orders)
    .where(ilike(orders.orderNumber, orderNumber))
    .limit(1)

  const market = order?.market || "us"
  const lang = order?.lang || "en"
  const resolvedOrder = order?.orderNumber || orderNumber

  let paymentParam = "zen_return"
  if (rawStatus.includes("success") || rawStatus.includes("approv")) {
    paymentParam = "zen_success"
  } else if (rawStatus.includes("cancel")) {
    paymentParam = "zen_cancelled"
  } else if (rawStatus.includes("fail") || rawStatus.includes("declin") || rawStatus.includes("error")) {
    paymentParam = "zen_failed"
  }

  const target = `${COMPANY.url}/${market}/${lang}/order/${encodeURIComponent(resolvedOrder)}?payment=${paymentParam}`
  return NextResponse.redirect(target, 303)
}
