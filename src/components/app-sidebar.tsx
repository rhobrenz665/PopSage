"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BookOpenIcon, InboxIcon, LayoutDashboardIcon, UsersIcon } from "lucide-react"
import { PopSageMark } from "@/components/popsage-mark"
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { SignOutButton } from "@/features/auth/auth-states"
export function AppSidebar({ workspaceId, ...props }: React.ComponentProps<typeof Sidebar> & { workspaceId?: string }) {
  const searchParams = useSearchParams()
  const activeWorkspaceId = workspaceId ?? searchParams.get("workspace")
  const dashboard = activeWorkspaceId ? `/dashboard?workspace=${encodeURIComponent(activeWorkspaceId)}` : "/dashboard"
  const navigation = [
    { title: "Overview", url: dashboard, icon: LayoutDashboardIcon },
    { title: "Inbox", url: `${dashboard}#inbox`, icon: InboxIcon },
    { title: "Knowledge", url: `${dashboard}#knowledge`, icon: BookOpenIcon },
    { title: "Team", url: `${dashboard}#team`, icon: UsersIcon },
  ]
  return <Sidebar collapsible="offcanvas" {...props}><SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href={dashboard} />} size="lg"><PopSageMark className="size-8" /><span>PopSage</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel>Your workspace</SidebarGroupLabel><SidebarMenu>{navigation.map(({ title, url, icon: Icon }) => <SidebarMenuItem key={title}><SidebarMenuButton render={<Link href={url} />}><Icon /><span>{title}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup></SidebarContent><SidebarFooter><p className="px-2 py-2 text-xs text-muted-foreground">A shared space for thoughtful work.</p><SignOutButton /></SidebarFooter></Sidebar>
}
