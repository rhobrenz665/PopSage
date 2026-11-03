import Link from "next/link"
import { PopSageMark } from "@/components/popsage-mark"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-10 p-6 sm:p-10 lg:p-12">
        <Link href="/" className="flex w-fit items-center gap-2 font-medium" aria-label="PopSage home">
          <PopSageMark className="size-9" /> PopSage
        </Link>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-xs text-muted-foreground">A little more care in every conversation.</p>
      </div>
      <aside className="hidden items-center justify-center p-12 lg:flex" aria-label="About PopSage">
        <div className="liquid-glass-strong flex min-h-[75svh] w-full max-w-xl flex-col justify-between rounded-[2rem] p-10">
          <PopSageMark className="size-14" />
          <div className="flex flex-col gap-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your team, in tune</p>
            <p className="font-serif text-5xl leading-tight">Less scattered.<br />More human.</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">One thoughtful space for your conversations, your knowledge, and the people behind them.</p>
          </div>
          <p className="text-xs text-muted-foreground">A private workspace. An invited team. A shared rhythm.</p>
        </div>
      </aside>
    </main>
  )
}
