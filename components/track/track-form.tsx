"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { storePath } from "@/lib/i18n/config"

export function TrackForm({ defaultValue = "" }: { defaultValue?: string }) {
  const { store, x } = useI18n()
  const router = useRouter()
  return (
    <form
      role="search"
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        const code = String(new FormData(e.currentTarget).get("code") ?? "").trim()
        if (code) router.push(storePath(store, `/track/${encodeURIComponent(code.toUpperCase())}`))
      }}
    >
      <label htmlFor="track-code" className="sr-only">
        {x.track.placeholder}
      </label>
      <input
        id="track-code"
        name="code"
        required
        maxLength={40}
        defaultValue={defaultValue}
        placeholder={x.track.placeholder}
        autoComplete="off"
        spellCheck={false}
        className="h-12 flex-1 border border-border bg-card px-4 font-mono text-sm uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] placeholder:normal-case placeholder:tracking-normal"
      />
      <Button type="submit" size="lg" className="h-12">
        {x.track.submit}
      </Button>
    </form>
  )
}
