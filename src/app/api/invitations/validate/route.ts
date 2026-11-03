import { NextResponse } from "next/server"

import { previewInvitation } from "@/server/invitations/service"
import { parseInvitationCredentials } from "@/server/invitations/tokens"

export async function POST(request: Request) {
  try {
    const body = await request.json() as { invitationToken?: string }
    const credentials = parseInvitationCredentials(body.invitationToken ?? "")
    await previewInvitation(credentials)
    return NextResponse.json({})
  } catch {
    return NextResponse.json(
      { error: "This invitation is invalid or no longer available." },
      { status: 400 },
    )
  }
}
