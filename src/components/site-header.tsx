import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
export function SiteHeader() {
  return <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b"><div className="flex w-full items-center gap-2 px-4 lg:px-6"><SidebarTrigger className="-ml-1" /><Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" /><span className="text-sm font-medium">Workspace overview</span></div></header>
}
