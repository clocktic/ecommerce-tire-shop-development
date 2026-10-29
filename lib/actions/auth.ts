"use server"

import { redirect } from "next/navigation"
import { APIError } from "better-auth"
import { auth } from "@/lib/auth"
import { verifyCaptcha } from "@/lib/captcha"
import { parseStore, storePath } from "@/lib/i18n/config"

export type SignUpError = "validation" | "weak-password" | "password-mismatch" | "exists" | "unknown"
export type SignUpState = { status: "idle" | "error" | "captcha-error"; error?: SignUpError; attempt: number }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function field(form: FormData, name: string, max: number): string {
  const value = form.get(name)
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

// Account creation is only ever performed here, server-side, so the captcha check
// cannot be bypassed by calling the Better Auth client endpoint directly.
export async function signUpWithCaptcha(prev: SignUpState, form: FormData): Promise<SignUpState> {
  const attempt = prev.attempt + 1

  // Honeypot: real visitors never see or fill this field. Fail silently.
  if (field(form, "website", 200)) return { status: "idle", attempt }

  if (!verifyCaptcha(form.get("captchaToken"), form.get("captchaAnswer"))) {
    return { status: "captcha-error", attempt }
  }

  const store = parseStore(field(form, "market", 4), field(form, "lang", 4))
  const name = field(form, "name", 120)
  const email = field(form, "email", 200).toLowerCase()
  const password = form.get("password")
  const confirmPassword = form.get("confirmPassword")

  if (!store || !name || !EMAIL_RE.test(email)) {
    return { status: "error", error: "validation", attempt }
  }
  if (typeof password !== "string" || password.length < 8) {
    return { status: "error", error: "weak-password", attempt }
  }
  if (password !== confirmPassword) {
    return { status: "error", error: "password-mismatch", attempt }
  }

  try {
    await auth.api.signUpEmail({ body: { name, email, password } })
  } catch (e) {
    // Never reveal whether an email is already registered beyond this generic signal.
    const exists = e instanceof APIError && e.status === "UNPROCESSABLE_ENTITY"
    if (!exists) console.error("[auth] sign-up failed", e)
    return { status: "error", error: exists ? "exists" : "unknown", attempt }
  }

  redirect(storePath(store, "/account"))
}
