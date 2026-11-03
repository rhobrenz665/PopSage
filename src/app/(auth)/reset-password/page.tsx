import { Suspense } from "react"
import { AuthForm } from "@/features/auth/auth-form"

async function ResetPasswordContent({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <AuthForm mode="reset-password" token={token} />
}

export default function Page(props: { searchParams: Promise<{ token?: string }> }) {
  return <Suspense fallback={<AuthForm mode="reset-password" />}><ResetPasswordContent {...props} /></Suspense>
}
