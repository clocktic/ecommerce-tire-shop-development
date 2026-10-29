import { NextResponse } from "next/server"
import { createCaptcha } from "@/lib/captcha"

export const dynamic = "force-dynamic"

export async function GET() {
  const captcha = createCaptcha()
  return NextResponse.json(captcha, { headers: { "Cache-Control": "no-store" } })
}
