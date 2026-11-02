import { NextResponse } from "next/server"
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram-chat"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const update = (await request.json().catch(() => null)) as TelegramUpdate | null
    if (!update || typeof update.update_id !== "number") {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await handleTelegramUpdate(update)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[telegram-webhook] error:", e)
    return NextResponse.json({ ok: true })
  }
}
