"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useSession } from "@/lib/auth-client"
import { storePath } from "@/lib/i18n/config"

export function AccountButton() {
  const { store, x } = useI18n()
  const { data } = useSession()
  const label = data?.user ? x.account.account : x.account.signIn

  return (
    <Link
      href={storePath(store, data?.user ? "/account" : "/account?mode=sign-up")}
      className="relative inline-flex items-center gap-1 p-2 transition-colors hover:text-primary"
      aria-label={label}
      title={label}
    >
      <User className="size-5" aria-hidden="true" />
      {data?.user ? (
        <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
      ) : (
        <span className="bg-primary px-1 py-0.5 font-mono text-[9px] font-bold leading-none tracking-wider text-primary-foreground">
          −7%
        </span>
      )}
    </Link>
  )
}
