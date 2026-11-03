import { Suspense } from "react"
import { redirect } from "next/navigation"
import { AuthForm } from "@/features/auth/auth-form"
import { getAuthenticatedUser } from "@/providers/auth/server"

const errorMessages: Record<string, string> = {
  oauth: "Google sign-in could not be completed. Please try again.",
  "magic-link": "That email sign-in link is invalid or expired. Request a new one.",
}

async function SignInContent({ searchParams }: { searchParams: Promise<{ invitation?: string; error?: string; reset?: string }> }) {
  const { invitation, error, reset } = await searchParams
  const identity = await getAuthenticatedUser()
  if (identity) redirect(invitation ? `/invite/${encodeURIComponent(invitation)}` : "/dashboard")
  return <AuthForm invitationToken={invitation} initialError={error ? errorMessages[error] ?? "Sign-in could not be completed." : ""} initialMessage={reset === "success" ? "Your password has been reset. Sign in with your new password." : ""} />
}

export default function Page(props: { searchParams: Promise<{ invitation?: string; error?: string; reset?: string }> }) {
  return <Suspense fallback={<AuthForm />}><SignInContent {...props} /></Suspense>
}
