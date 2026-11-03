"use client"

import { useState } from "react"
import Link from "next/link"
import { LoaderCircleIcon, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient, type AuthClient, type AuthResult } from "./client"

type Mode = "sign-in" | "sign-up" | "forgot-password" | "reset-password"
const copy = {
  "sign-in": ["Welcome back", "Sign in to your PopSage workspace.", "Sign in"],
  "sign-up": ["Make yourself at home", "Create your account to continue with your invitation.", "Create account"],
  "forgot-password": ["Let’s get you back in", "We’ll email you a link to reset your password.", "Send reset link"],
  "reset-password": ["A fresh start", "Choose a new password for your PopSage account.", "Reset password"],
}
export function AuthForm({ mode = "sign-in", invitationToken, token, initialError = "", initialMessage = "", client = authClient }: {
  mode?: Mode; invitationToken?: string; token?: string; initialError?: string; initialMessage?: string; client?: AuthClient
}) {
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState(initialError)
  const [method, setMethod] = useState<"password" | "magic">("password")
  const [email, setEmail] = useState("")
  const [title, description, label] = copy[mode]
  const signup = mode === "sign-up"
  const recovery = mode === "forgot-password" || mode === "reset-password"
  const needsInvitation = signup && !invitationToken

  async function run(action: string, callback: () => Promise<AuthResult>, fallback?: string) {
    setError(""); setPending(action)
    try {
      const result = await callback()
      if (result.error) { setError(result.error); return }
      const target = result.redirectTo || fallback
      if (target && (target.startsWith("/") && !target.startsWith("//") || action === "google" && target.startsWith("https://"))) window.location.assign(target)
    } catch { setError("We couldn’t connect. Check your connection and try again.") }
    finally { setPending(null) }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get("password") || "")
    if (mode === "reset-password") {
      if (password !== data.get("confirm-password")) { setError("Your passwords don’t match."); return }
      return void run("reset", () => client.resetPassword({ password, token: token || "" }), "/sign-in?reset=success")
    }
    if (mode === "forgot-password") return void run("email", () => client.forgotPassword({ email }), "/check-email?kind=reset")
    if (method === "magic") return void run("email", () => client.magicLink({ email, invitationToken }), "/check-email")
    if (signup) return void run("signup", () => client.signUp({ name: String(data.get("name")), email, password, invitationToken: invitationToken || "" }), "/check-email")
    void run("signin", () => client.signIn({ email, password, invitationToken }), invitationToken ? `/invite/${encodeURIComponent(invitationToken)}` : "/dashboard")
  }

  if (needsInvitation) return <div className="flex flex-col gap-5"><h1 className="text-2xl font-medium">An invitation opens the door</h1><p className="text-sm leading-relaxed text-muted-foreground">PopSage workspaces are invitation only. Ask your workspace administrator for an invitation, then open the link in your email.</p><Button nativeButton={false} render={<Link href="/sign-in" />}>Back to sign in</Button></div>
  if (mode === "reset-password" && !token) return <div className="flex flex-col gap-5"><h1 className="text-2xl font-medium">This reset link is incomplete</h1><p className="text-sm text-muted-foreground">Request a fresh password reset email to continue.</p><Button nativeButton={false} render={<Link href="/forgot-password" />}>Request a new link</Button></div>

  return <form onSubmit={submit} aria-busy={!!pending}>
    <FieldGroup>
      <div className="flex flex-col gap-2"><h1 className="text-2xl font-medium">{title}</h1><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></div>
      {!recovery && <><Field><Button variant="outline" type="button" size="lg" disabled={!!pending} onClick={() => void run("google", () => client.google({ invitationToken }))}>{pending === "google" ? <LoaderCircleIcon className="animate-spin" data-icon="inline-start" /> : <GoogleIcon />}Continue with Google</Button></Field><FieldSeparator>or use your email</FieldSeparator></>}
      {signup && <Field><FieldLabel htmlFor="name">Full name</FieldLabel><Input id="name" name="name" autoComplete="name" required disabled={!!pending} /></Field>}
      {mode !== "reset-password" && <Field><FieldLabel htmlFor="email">Email address</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!pending} /></Field>}
      {(mode === "reset-password" || !recovery && method === "password") && <Field><div className="flex items-center justify-between gap-3"><FieldLabel htmlFor="password">{mode === "reset-password" ? "New password" : "Password"}</FieldLabel>{!signup && !recovery && <Link href="/forgot-password" className="text-xs underline-offset-4 hover:underline">Forgot password?</Link>}</div><Input id="password" name="password" type="password" autoComplete={signup || recovery ? "new-password" : "current-password"} minLength={signup || recovery ? 12 : undefined} required disabled={!!pending} />{(signup || recovery) && <FieldDescription>Use at least 12 characters.</FieldDescription>}</Field>}
      {mode === "reset-password" && <Field data-invalid={!!error || undefined}><FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel><Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" minLength={12} required disabled={!!pending} aria-invalid={!!error} aria-describedby={error ? "auth-error" : undefined} /></Field>}
      {error && <p id="auth-error" role="alert" className="text-sm leading-relaxed">{error}</p>}
      {initialMessage && !error && <p role="status" className="text-sm leading-relaxed text-muted-foreground">{initialMessage}</p>}
      <Field><Button type="submit" size="lg" disabled={!!pending}>{pending && pending !== "google" && <LoaderCircleIcon className="animate-spin" data-icon="inline-start" />}{pending ? "Please wait…" : !recovery && method === "magic" ? "Email me a sign-in link" : label}</Button></Field>
      {!recovery && <Field><Button type="button" variant="ghost" disabled={!!pending} onClick={() => { setMethod(method === "password" ? "magic" : "password"); setError("") }}><MailIcon data-icon="inline-start" />{method === "password" ? "Use an email link instead" : "Use a password instead"}</Button><FieldDescription className="text-center">{signup ? <>Already have an account? <Link href={invitationToken ? `/sign-in?invitation=${encodeURIComponent(invitationToken)}` : "/sign-in"} className="underline underline-offset-4">Sign in</Link></> : <>New to PopSage? <Link href={invitationToken ? `/sign-up?invitation=${encodeURIComponent(invitationToken)}` : "/sign-up"} className="underline underline-offset-4">Join with an invitation</Link></>}</FieldDescription></Field>}
      {recovery && <FieldDescription className="text-center"><Link href="/sign-in" className="underline underline-offset-4">Back to sign in</Link></FieldDescription>}
      {signup && <FieldDescription className="text-center">Creating an account doesn’t grant workspace access. Your invitation must be accepted.</FieldDescription>}
    </FieldGroup>
  </form>
}
function GoogleIcon() { return <svg data-icon="inline-start" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.7ZM12 22c2.7 0 5-.9 6.8-2.5l-3.3-2.6c-.9.6-2 .9-3.5.9-2.6 0-4.9-1.8-5.7-4.2H2.9v2.7A10.2 10.2 0 0 0 12 22ZM6.3 13.6a6 6 0 0 1 0-3.2V7.7H2.9a10 10 0 0 0 0 8.6l3.4-2.7ZM12 6.2c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10.2 10.2 0 0 0-9.1 5.7l3.4 2.7C7.1 8 9.4 6.2 12 6.2Z" /></svg> }
