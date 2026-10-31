import "server-only"

import crypto from "node:crypto"

// Characters that are easy to tell apart at a glance (no 0/O, 1/I/L, etc).
const CHARS = "ACDEFGHJKMNPQRTUVWXY34679"
const CODE_LENGTH = 5
const TTL_MS = 10 * 60 * 1000

function secret(): string {
  // BETTER_AUTH_SECRET is already required by the project's auth setup, so it
  // doubles as the HMAC key for signing captcha tokens. Never logged or returned.
  return process.env.BETTER_AUTH_SECRET ?? "v0-dev-fallback-captcha-secret"
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex")
}

function randomCode(): string {
  return Array.from({ length: CODE_LENGTH }, () => CHARS[crypto.randomInt(CHARS.length)]).join("")
}

export type Captcha = { token: string; svg: string }

export function createCaptcha(): Captcha {
  const code = randomCode()
  const expires = Date.now() + TTL_MS
  const payload = `${code}.${expires}`
  const token = `${Buffer.from(payload, "utf8").toString("base64url")}.${sign(payload)}`
  return { token, svg: renderCaptchaSvg(code) }
}

/** Verifies a captcha token against the user-entered answer. Single use is not enforced
 *  server-side (no session store); the short TTL plus per-submit refresh in the UI bounds replay. */
export function verifyCaptcha(token: unknown, answer: unknown): boolean {
  if (typeof token !== "string" || typeof answer !== "string" || !token || !answer) return false
  const [encoded, signature] = token.split(".")
  if (!encoded || !signature) return false
  let payload: string
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8")
  } catch {
    return false
  }
  if (sign(payload) !== signature) return false
  const [code, expiresRaw] = payload.split(".")
  const expires = Number(expiresRaw)
  if (!code || Number.isNaN(expires) || Date.now() > expires) return false
  return answer.trim().toUpperCase() === code
}

function renderCaptchaSvg(code: string): string {
  const width = 140
  const height = 48
  const rand = (min: number, max: number) => min + Math.random() * (max - min)

  const strokeLines = Array.from({ length: 4 }, () => {
    const y1 = rand(4, height - 4)
    const y2 = rand(4, height - 4)
    return `<line x1="0" y1="${y1.toFixed(1)}" x2="${width}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.5" />`
  }).join("")

  const dots = Array.from({ length: 18 }, () => {
    const cx = rand(0, width)
    const cy = rand(0, height)
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="1" fill="currentColor" fill-opacity="0.25" />`
  }).join("")

  const slot = width / code.length
  const glyphs = Array.from(code, (char, i) => {
    const cx = slot * i + slot / 2
    const cy = height / 2
    const rotate = rand(-18, 18)
    const size = rand(22, 27)
    const dy = rand(-3, 3)
    return `<text x="${cx.toFixed(1)}" y="${(cy + dy).toFixed(1)}" transform="rotate(${rotate.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" font-size="${size.toFixed(0)}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-weight="700" fill="currentColor" text-anchor="middle" dominant-baseline="middle">${char}</text>`
  }).join("")

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${strokeLines}${glyphs}${dots}</svg>`
}
