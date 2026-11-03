import { InvitationAcceptance } from "@/features/auth/auth-states"
import { previewInvitation } from "@/server/invitations/service"
import { parseInvitationCredentials } from "@/server/invitations/tokens"

type InvitationStatus = "ready" | "expired" | "revoked" | "invalid"

async function InvitationContent({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const token = (await params).token
  let status: InvitationStatus = "invalid"
  let ownerOnboarding = false

  try {
    const invitation = await previewInvitation(parseInvitationCredentials(token))
    status = "ready"
    ownerOnboarding = invitation.kind === "owner_onboarding"
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    if (code === "expired" || code === "revoked") status = code
  }

  return <InvitationAcceptance token={token} status={status} ownerOnboarding={ownerOnboarding} />
}
import { Suspense } from "react"

export default function Page(props: { params: Promise<{ token: string }> }) {
  return <Suspense fallback={<InvitationAcceptance token="" status="invalid" />}><InvitationContent {...props} /></Suspense>
}
