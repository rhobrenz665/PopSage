import { Suspense } from "react"
import { redirect } from "next/navigation"
import { AuthForm } from "@/features/auth/auth-form"
import { getAuthenticatedUser } from "@/providers/auth/server"

async function SignUpContent({ searchParams }: { searchParams: Promise<{ invitation?: string }> }) {
  const { invitation } = await searchParams
  const identity = await getAuthenticatedUser()
  if (identity) redirect(invitation ? `/invite/${encodeURIComponent(invitation)}` : "/dashboard")
  return <AuthForm mode="sign-up" invitationToken={invitation} />
}

export default function Page(props: { searchParams: Promise<{ invitation?: string }> }) {
  return <Suspense fallback={<AuthForm mode="sign-up" />}><SignUpContent {...props} /></Suspense>
}
