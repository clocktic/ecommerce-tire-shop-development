export type DatabaseReadResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "quota" }

export function isDatabaseQuotaError(error: unknown): boolean {
  const visited = new Set<object>()
  let current = error

  // Drizzle wraps the PostgreSQL error in cause; never expose its SQL to users.
  while (current !== null && typeof current === "object" && !visited.has(current)) {
    visited.add(current)
    const details = current as { message?: unknown; cause?: unknown }
    if (
      typeof details.message === "string" &&
      /(?:account|project) has exceeded the quota/i.test(details.message)
    ) {
      return true
    }
    current = details.cause
  }
  return false
}

export async function readDatabase<T>(read: () => Promise<T>): Promise<DatabaseReadResult<T>> {
  try {
    return { ok: true, data: await read() }
  } catch (error) {
    if (!isDatabaseQuotaError(error)) throw error
    return { ok: false, reason: "quota" }
  }
}
