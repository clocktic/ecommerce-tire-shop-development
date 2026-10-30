import { auth } from "@/lib/auth"
import { readDatabase } from "@/lib/db/availability"
import { toNextJsHandler } from "better-auth/next-js"

const handlers = toNextJsHandler(auth)

async function handle(request: Request, method: "GET" | "POST") {
  const result = await readDatabase(() => handlers[method](request))
  if (result.ok) return result.data
  return Response.json(
    { code: "SERVICE_UNAVAILABLE", message: "Account services are temporarily unavailable. Please try again later." },
    { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
  )
}

export function GET(request: Request) {
  return handle(request, "GET")
}

export function POST(request: Request) {
  return handle(request, "POST")
}
