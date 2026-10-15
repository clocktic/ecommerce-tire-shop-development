"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { signOut } from "@/lib/auth-client"

export function SignOutButton() {
  const { x } = useI18n()
  const router = useRouter()
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signOut()
        router.refresh()
      }}
    >
      {x.account.signOut}
    </Button>
  )
}
