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
    <Link href={storePath(store, "/account")} className="relative p-2 transition-colors hover:text-primary" aria-label={label} title={label}>
      <User className="size-5" aria-hidden="true" />
      {data?.user && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
    </Link>
  )
}
