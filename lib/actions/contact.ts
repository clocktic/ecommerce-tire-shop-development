"use server"

import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { newId } from "@/lib/ids"
import { parseStore } from "@/lib/i18n/config"
import { verifyCaptcha } from "@/lib/captcha"

export type ContactState = { status: "idle" | "sent" | "error" | "captcha-error"; attempt: number }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function field(form: FormData, name: string, max: number): string {
  const value = form.get(name)
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export async function sendContactMessage(prev: ContactState, form: FormData): Promise<ContactState> {
  const attempt = prev.attempt + 1
  // Honeypot: real visitors never see or fill this field.
  if (field(form, "website", 200)) return { status: "sent", attempt }
  if (!verifyCaptcha(form.get("captchaToken"), form.get("captchaAnswer"))) {
    return { status: "captcha-error", attempt }
  }
  const store = parseStore(field(form, "market", 4), field(form, "lang", 4))
  const name = field(form, "name", 120)
  const email = field(form, "email", 200).toLowerCase()
  const message = field(form, "message", 5000)
  if (!store || !name || !EMAIL_RE.test(email) || message.length < 2) return { status: "error", attempt }

  await db.insert(contactMessages).values({
    id: newId("cm"),
    market: store.market,
    lang: store.lang,
    name,
    email,
    orderNumber: field(form, "orderNumber", 40) || null,
    subject: field(form, "subject", 200) || null,
    message,
  })
  return { status: "sent", attempt }
}
