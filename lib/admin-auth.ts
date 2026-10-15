import "server-only"

import crypto from "crypto"
import { cookies } from "next/headers"

// Single shared password (ADMIN_PASSWORD) + signed, httpOnly session cookie.
// Customers sign in with Better Auth; the operator area is deliberately separate.
const COOKIE_NAME = "cp_admin"
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

function secret(): string {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) throw new Error("ADMIN_PASSWORD is not set")
  return `${pw}:${process.env.BETTER_AUTH_SECRET ?? ""}`
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  return !!expected && safeEqual(input, expected)
}

export async function createAdminSession(): Promise<void> {
  const expires = Date.now() + SESSION_TTL_MS
  const payload = `admin.${expires}`
  const jar = await cookies()
  jar.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: true,
    // "none" so the session survives the cross-site v0 preview iframe.
    sameSite: "none",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
}

export async function destroyAdminSession(): Promise<void> {
  ;(await cookies()).delete(COOKIE_NAME)
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return false
  const lastDot = token.lastIndexOf(".")
  if (lastDot < 0) return false
  const payload = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)
  if (!safeEqual(signature, sign(payload))) return false
  const expires = Number(payload.split(".")[1])
  return Number.isFinite(expires) && expires > Date.now()
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized")
}
