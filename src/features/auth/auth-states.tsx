"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, LoaderCircleIcon, MailIcon, ShieldCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient, type AuthClient } from "./client"

export function CheckEmail({ reset = false, verification = false, client = authClient }: { reset?: boolean; verification?: boolean; client?: AuthClient }) {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("")
  return <div className="flex flex-col gap-5"><MailIcon className="size-9" aria-hidden="true" /><h1 className="text-2xl font-medium">Check your inbox</h1><p className="text-sm leading-relaxed text-muted-foreground">{reset ? "If an account matches that address, you’ll receive a password reset link shortly." : verification ? "Verify your email address before entering a workspace." : "If your address is eligible, you’ll receive an email with your next step. Open the link on this device to continue."}</p>{verification && <div className="flex flex-col gap-2"><Input type="email" aria-label="Email address" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /><Button variant="outline" disabled={pending || !email} onClick={async () => { setPending(true); setMessage(""); try { const result = await client.resendVerification({ email }); setMessage(result.error ?? "If that account needs verification, a new email is on its way.") } catch { setMessage("We couldn’t resend the verification email. Please try again.") } finally { setPending(false) } }}>{pending ? "Sending…" : "Resend verification email"}</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}</div>}<p className="text-sm text-muted-foreground">No email yet? Check your spam folder or return to sign in to try again.</p><Button nativeButton={false} variant="outline" render={<Link href="/sign-in" />}>Back to sign in</Button></div>
}
export function NoAccess() {
  return <div className="flex flex-col gap-5"><ShieldCheckIcon className="size-9" aria-hidden="true" /><h1 className="text-2xl font-medium">You’re signed in. One more step.</h1><p className="text-sm leading-relaxed text-muted-foreground">Your account doesn’t have access to a PopSage workspace yet. Open your invitation email, or ask your workspace administrator to invite this account.</p><p className="text-sm text-muted-foreground">Workspace access is granted only after an invitation is accepted.</p><SignOutButton /><Link href="/sign-in" className="text-sm underline underline-offset-4">Back to sign in</Link></div>
}
export function SignOutButton({ client = authClient, returnTo = "/sign-in", label = "Sign out" }: { client?: AuthClient; returnTo?: string; label?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  return <div className="flex flex-col gap-2"><Button variant="outline" disabled={pending} onClick={async () => { setPending(true); setError(""); try { const result = await client.signOut(); if (result.error) setError(result.error); else router.push(returnTo) } catch { setError("Couldn’t sign out. Please try again.") } finally { setPending(false) } }}>{pending ? "Signing out…" : label}</Button>{error && <p role="alert" className="text-sm">{error}</p>}</div>
}
export function InvitationAcceptance({ token, status = "ready", workspaceName, ownerOnboarding = false, client = authClient }: { token: string; status?: "ready" | "expired" | "revoked" | "invalid" | "wrong-account"; workspaceName?: string; ownerOnboarding?: boolean; client?: AuthClient }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const invalid = status !== "ready"
  return <div className="flex flex-col gap-5"><ShieldCheckIcon className="size-9" aria-hidden="true" /><h1 className="text-2xl font-medium">{invalid ? status === "wrong-account" ? "This invitation is for another account" : "This invitation is no longer available" : workspaceName ? `Join ${workspaceName}` : ownerOnboarding ? "Name your new workspace" : "Your team saved you a place"}</h1><p className="text-sm leading-relaxed text-muted-foreground">{invalid ? status === "wrong-account" ? "Sign in with the email address that received this invitation, then open the invitation again." : "The invitation may have expired or been withdrawn. Ask your workspace administrator for a new link." : "Accept your invitation to continue. You’ll need to sign in with the email address that received it."}</p>{ownerOnboarding && !invalid && <Input aria-label="Workspace name" placeholder="Workspace name" value={newWorkspaceName} maxLength={100} onChange={(event) => setNewWorkspaceName(event.target.value)} disabled={pending} />}{error && <p role="alert" className="text-sm">{error}</p>}{!invalid && <Button disabled={pending || ownerOnboarding && !newWorkspaceName.trim()} onClick={async () => { setPending(true); setError(""); try { const result = await client.acceptInvitation({ token, workspaceName: ownerOnboarding ? newWorkspaceName.trim() : undefined }); if (result.error) setError(result.error); else window.location.assign(result.redirectTo?.startsWith("/") && !result.redirectTo.startsWith("//") ? result.redirectTo : "/dashboard") } catch { setError("We couldn’t accept this invitation. Please try again.") } finally { setPending(false) } }}>{pending ? <LoaderCircleIcon className="animate-spin" data-icon="inline-start" /> : <ArrowRightIcon data-icon="inline-start" />}{pending ? "Accepting…" : "Accept invitation"}</Button>}<SignOutButton client={client} label="Sign in with another account" returnTo={`/sign-in?invitation=${encodeURIComponent(token)}`} />{!invalid && <Link href={`/sign-up?invitation=${encodeURIComponent(token)}`} className="text-center text-sm underline underline-offset-4">Create an account for this invitation</Link>}</div>
}
