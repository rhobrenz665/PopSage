import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/providers/auth/server"
import { createInvitation } from "@/server/invitations/service"
import { serializeInvitationCredentials } from "@/server/invitations/tokens"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const identity = await getAuthenticatedUser()
  if (!identity?.emailVerified) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 })
  }

  try {
    const { workspaceId } = await params
    const body = await request.json() as { email?: string }
    const invitation = await createInvitation({
      userId: identity.id,
      workspaceId,
      email: body.email ?? "",
    })
    const token = serializeInvitationCredentials(invitation)
    return NextResponse.json({
      url: new URL(`/invite/${encodeURIComponent(token)}`, request.url).toString(),
    })
  } catch {
    return NextResponse.json(
      { error: "We couldn’t create that invitation. Check the address and your access." },
      { status: 400 },
    )
  }
}
