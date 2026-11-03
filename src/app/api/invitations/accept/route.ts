import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/providers/auth/server"
import { acceptInvitation, InvitationError } from "@/server/invitations/service"
import { parseInvitationCredentials } from "@/server/invitations/tokens"

const messages: Partial<Record<InvitationError["code"], string>> = {
  expired: "This invitation has expired. Ask for a new link.",
  revoked: "This invitation was withdrawn. Ask for a new link.",
  replaced: "A newer invitation link is available. Use that link instead.",
  consumed: "This invitation has already been used.",
  wrong_email: "Sign in with the email address that received this invitation.",
  unverified: "Verify your email address before accepting this invitation.",
  workspace_name_required: "Enter a workspace name to continue.",
}

export async function POST(request: Request) {
  const identity = await getAuthenticatedUser()
  if (!identity) {
    return NextResponse.json(
      { error: "Sign in before accepting this invitation." },
      { status: 401 },
    )
  }

  try {
    const body = await request.json() as {
      token?: string
      workspaceName?: string
    }
    const credentials = parseInvitationCredentials(body.token ?? "")
    const result = await acceptInvitation({
      ...credentials,
      identity,
      workspaceName: body.workspaceName,
    })
    return NextResponse.json({
      redirectTo: `/dashboard?workspace=${encodeURIComponent(result.workspaceId)}`,
    })
  } catch (error) {
    const message = error instanceof InvitationError
      ? messages[error.code]
      : undefined
    return NextResponse.json(
      { error: message ?? "This invitation is invalid or no longer available." },
      { status: 400 },
    )
  }
}
