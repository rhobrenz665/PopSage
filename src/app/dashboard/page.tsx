import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpenIcon, InboxIcon, UsersIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getAuthenticatedUser } from "@/providers/auth/server"
import { listActiveWorkspaces } from "@/server/workspaces/service"
import { TeamInviteForm } from "@/features/auth/team-invite-form"

async function DashboardContent({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const identity = await getAuthenticatedUser()
  if (!identity) redirect("/sign-in")
  if (!identity.emailVerified) redirect("/check-email?kind=verify")

  const workspaces = await listActiveWorkspaces(identity.id)
  const requestedWorkspace = (await searchParams).workspace
  const workspace = workspaces.find((entry) => entry.id === requestedWorkspace) ?? workspaces[0]
  if (!workspace) redirect("/no-access")

  async function createTeamInvitation(email: string) {
    "use server"
    const currentUser = await getAuthenticatedUser()
    if (!currentUser?.emailVerified) return { error: "Authentication required." }
    try {
      const { createInvitation } = await import("@/server/invitations/service")
      const { serializeInvitationCredentials } = await import("@/server/invitations/tokens")
      const invitation = await createInvitation({ userId: currentUser.id, workspaceId: workspace.id, email })
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      return { url: new URL(`/invite/${serializeInvitationCredentials(invitation)}`, appUrl).toString(), selector: invitation.selector }
    } catch {
      return { error: "We couldn’t create that invitation. Check the address and your access." }
    }
  }

  async function revokeTeamInvitation(selector: string) {
    "use server"
    const currentUser = await getAuthenticatedUser()
    if (!currentUser?.emailVerified) return { error: "Authentication required." }
    try {
      const { revokeInvitation } = await import("@/server/invitations/service")
      const result = await revokeInvitation({ userId: currentUser.id, workspaceId: workspace.id, selector })
      return result.revoked ? {} : { error: "This invitation is no longer pending." }
    } catch {
      return { error: "We couldn’t revoke that invitation." }
    }
  }

  return <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 64)", "--header-height": "calc(var(--spacing) * 14)" } as React.CSSProperties}><AppSidebar variant="inset" /><SidebarInset><SiteHeader /><main className="flex flex-1 flex-col gap-8 p-5 md:p-8 lg:p-10"><div className="flex flex-col gap-3"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{workspace.name}</p><h1 className="font-serif text-4xl leading-tight">Welcome to your workspace.</h1><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Bring your team, conversations, and shared knowledge together. Your workspace is ready for its first chapter.</p></div><Card variant="glass-strong"><CardHeader><CardTitle>Make it yours</CardTitle><CardDescription>A few thoughtful first steps.</CardDescription></CardHeader><CardContent><ol className="flex list-inside list-decimal flex-col gap-4 text-sm"><li>Invite the people who will share this space.</li><li>Add the knowledge your team reaches for most.</li><li>Connect a conversation source when integrations become available.</li></ol></CardContent></Card><div className="grid gap-5 lg:grid-cols-2"><Card id="inbox" variant="glass"><CardHeader><InboxIcon className="mb-3 size-6" aria-hidden="true" /><CardTitle>Room for every conversation</CardTitle><CardDescription>Your inbox is empty.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">No conversation source is connected yet. Conversations will appear here once a source is available and connected.</p></CardContent></Card><Card id="knowledge" variant="glass"><CardHeader><BookOpenIcon className="mb-3 size-6" aria-hidden="true" /><CardTitle>A shared place to know</CardTitle><CardDescription>No knowledge has been added yet.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Keep your team’s useful answers close. Knowledge tools will appear here as they become available.</p></CardContent></Card></div><Card id="team" variant="glass"><CardHeader><UsersIcon className="mb-3 size-6" aria-hidden="true" /><CardTitle>Better together</CardTitle><CardDescription>Invite a teammate to share the workspace.</CardDescription></CardHeader><CardContent className="flex flex-col gap-6"><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Workspace administrators can create an invitation for a specific email address, then copy and share the link. Your teammate joins only after signing in and accepting.</p>{workspace.role === "owner" ? <TeamInviteForm createInvitation={createTeamInvitation} revokeInvitation={revokeTeamInvitation} /> : <p className="text-sm text-muted-foreground">Ask the workspace owner to create an invitation.</p>}</CardContent></Card></main></SidebarInset></SidebarProvider>
}

export default function Page(props: { searchParams: Promise<{ workspace?: string }> }) {
  return <Suspense fallback={<main className="min-h-svh p-8 text-sm text-muted-foreground">Opening your workspace…</main>}><DashboardContent {...props} /></Suspense>
}
