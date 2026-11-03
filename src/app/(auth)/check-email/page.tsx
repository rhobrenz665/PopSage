import { Suspense } from "react"
import { CheckEmail } from "@/features/auth/auth-states"

async function CheckEmailContent({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams
  return <CheckEmail reset={kind === "reset"} verification={kind === "verify"} />
}

export default function Page(props: { searchParams: Promise<{ kind?: string }> }) {
  return <Suspense fallback={<CheckEmail />}><CheckEmailContent {...props} /></Suspense>
}
