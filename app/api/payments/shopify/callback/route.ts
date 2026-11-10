import { NextResponse } from "next/server"
import {
  getShopifyAdminAccessToken,
  SHOPIFY_STORE_DOMAIN,
} from "@/lib/payments/shopify"

export async function GET(request: Request) {
  const token = await getShopifyAdminAccessToken()
  const url = new URL(request.url)
  return NextResponse.redirect(
    new URL(token ? "/us/en?shopify=connected" : "/us/en", url.origin),
  )
}
