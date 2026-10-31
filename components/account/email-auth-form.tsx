"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CaptchaField } from "@/components/captcha/captcha-field"
import { useI18n } from "@/components/i18n/i18n-provider"
import { signIn } from "@/lib/auth-client"
import { storePath } from "@/lib/i18n/config"
import { signUpWithCaptcha, type SignUpState } from "@/lib/actions/auth"

const initialSignUp: SignUpState = { status: "idle", attempt: 0 }

export function EmailAuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const { x } = useI18n()
  const a = x.account

  return (
    <div className="flex flex-col gap-4 border border-border bg-card p-5">
      <div className="flex gap-1 border-b border-border">
        <ModeTab active={mode === "sign-in"} onClick={() => setMode("sign-in")}>
          {a.signIn}
        </ModeTab>
        <ModeTab active={mode === "sign-up"} onClick={() => setMode("sign-up")}>
          {a.signUpTitle}
        </ModeTab>
      </div>
      {mode === "sign-in" ? (
        <SignInForm onSwitch={() => setMode("sign-up")} />
      ) : (
        <SignUpForm onSwitch={() => setMode("sign-in")} />
      )}
    </div>
  )
}

function ModeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`-mb-px border-b-2 px-1 pb-2 text-sm font-semibold ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { store, x } = useI18n()
  const a = x.account
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(false)
    try {
      const res = await signIn.email({ email, password })
      if (res?.error) throw new Error(res.error.message)
      router.push(storePath(store, "/account"))
      router.refresh()
    } catch (err) {
      console.error("[auth] email sign-in failed", err)
      setError(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <TextField
        label={a.email}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
      />
      <TextField
        label={a.password}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={setPassword}
      />
      {error && (
        <p role="alert" className="text-sm text-primary">
          {a.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {a.signInSubmit}
      </Button>
      <button type="button" onClick={onSwitch} className="self-start text-xs text-muted-foreground underline underline-offset-4">
        {a.switchToSignUp}
      </button>
    </form>
  )
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { store, x } = useI18n()
  const a = x.account
  const [state, action, pending] = useActionState(signUpWithCaptcha, initialSignUp)

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="market" value={store.market} />
      <input type="hidden" name="lang" value={store.lang} />
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <TextField label={a.name} name="name" autoComplete="name" required />
      <TextField label={a.email} name="email" type="email" autoComplete="email" required />
      <TextField label={a.password} name="password" type="password" autoComplete="new-password" required minLength={8} />
      <TextField label={a.confirmPassword} name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      <CaptchaField
        label={x.captcha.label}
        refreshLabel={x.captcha.refresh}
        errorText={state.status === "captcha-error" ? x.captcha.error : undefined}
        resetSignal={state.attempt}
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-primary">
          {state.error === "exists"
            ? a.emailExists
            : state.error === "weak-password"
              ? a.weakPassword
              : state.error === "password-mismatch"
                ? a.passwordMismatch
                : a.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {a.createAccount}
      </Button>
      <button type="button" onClick={onSwitch} className="self-start text-xs text-muted-foreground underline underline-offset-4">
        {a.switchToSignIn}
      </button>
    </form>
  )
}

function TextField({
  label,
  name,
  value,
  onChange,
  ...props
}: {
  label: string
  name: string
  value?: string
  onChange?: (value: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const id = `email-auth-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-caps text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="h-11 border border-border bg-background px-3 text-sm"
        {...props}
      />
    </div>
  )
}
