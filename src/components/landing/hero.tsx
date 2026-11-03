import {
  ArrowRight,
  Code2,
  Globe2,
  MessageCircleMore,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WandSparkles,
} from "lucide-react"
import Link from "next/link"

import { NavigationSheet } from "@/components/landing/navigation-sheet"
import { PopSageMark } from "@/components/popsage-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const backgroundVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"

const capabilities = [
  "Grounded answers",
  "Live conversations",
  "Human handoff",
]

function HeroLanding() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 z-0 size-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source
          src={backgroundVideo}
          type="video/mp4"
          media="(prefers-reduced-motion: no-preference)"
        />
      </video>
      <div className="hero-vignette absolute inset-0 z-0" aria-hidden="true" />

      <div className="relative z-10 flex min-h-svh gap-4 p-3 sm:p-4 lg:gap-5 lg:p-6">
        <section
          id="product"
          className="relative flex min-h-[calc(100svh-1.5rem)] w-full flex-col lg:min-h-[calc(100svh-3rem)] lg:w-[52%]"
        >
          <div
            className="liquid-glass-strong absolute inset-0 rounded-3xl bg-black/10"
            aria-hidden="true"
          />
          <div className="relative z-10 flex min-h-full flex-1 flex-col px-5 py-5 sm:px-7 sm:py-6 lg:px-9 lg:py-7">
            <nav className="flex items-center justify-between" aria-label="Primary">
              <Link href="/" className="flex items-center gap-2.5 text-white">
                <PopSageMark className="size-9" />
                <span className="text-2xl font-semibold tracking-[-0.06em]">
                  PopSage
                </span>
              </Link>
              <NavigationSheet />
            </nav>

            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center sm:gap-7 lg:py-6">
              <PopSageMark className="size-20 text-white/90" label="PopSage" />
              <div className="flex max-w-2xl flex-col items-center gap-5">
                <p className="text-xs font-medium tracking-[0.22em] text-white/55 uppercase">
                  Grounded AI · human when it matters
                </p>
                <h1 className="text-5xl leading-[0.98] font-medium tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                  Support that knows when to{" "}
                  <em className="font-serif font-normal text-white/80">
                    ask a human.
                  </em>
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                  PopSage answers from your approved knowledge, keeps every live
                  conversation in one place, and hands off before confidence
                  becomes guesswork.
                </p>
              </div>

              <Button
                variant="glass-strong"
                size="xl"
                nativeButton={false}
                render={<a href="#preview" />}
              >
                See how PopSage works
                <span className="flex size-7 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight data-icon="inline-end" />
                </span>
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {capabilities.map((capability) => (
                  <Badge key={capability} variant="glass">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 pb-1 text-center">
              <p className="text-[0.68rem] font-medium tracking-[0.24em] text-white/45 uppercase">
                Trust is the product
              </p>
              <p className="max-w-lg text-xl leading-snug text-white sm:text-2xl">
                Useful answers when the evidence is there.{" "}
                <em className="font-serif text-white/70">
                  A human when it isn&apos;t.
                </em>
              </p>
              <div className="flex w-full max-w-xs items-center gap-3">
                <Separator tone="glass" grow />
                <span className="shrink-0 text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
                  The PopSage principle
                </span>
                <Separator tone="glass" grow />
              </div>
            </div>
          </div>
        </section>

        <aside
          id="preview"
          className="hidden min-h-[calc(100svh-3rem)] w-[48%] flex-col lg:flex"
          aria-label="Product preview"
        >
          <div className="flex items-start justify-between gap-4">
            <Card variant="glass" size="sm" className="flex-row items-center gap-1 py-1">
              <CardContent className="flex items-center gap-1 px-1">
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton={false}
                  render={
                    <a
                      href="https://github.com/rhobrenz665/PopSage"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="View PopSage on GitHub"
                    />
                  }
                >
                  <Code2 />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton={false}
                  render={<a href="#product" aria-label="Product promise" />}
                >
                  <Globe2 />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton={false}
                  render={<a href="#preview" aria-label="Product preview" />}
                >
                  <UsersRound />
                </Button>
                <ArrowRight className="mx-1 size-4 text-white/45" aria-hidden="true" />
              </CardContent>
            </Card>
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon" aria-label="AI is available">
                <Sparkles />
              </Button>
              <Button
                variant="glass"
                size="sm"
                nativeButton={false}
                render={<a href="#product" />}
              >
                Sign in
              </Button>
            </div>
          </div>

          <Card variant="glass" size="sm" className="mt-8 w-64 self-end">
            <CardHeader>
              <CardTitle>One conversation, start to finish</CardTitle>
              <CardDescription>
                AI and teammates share context, so visitors never have to start
                over.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="glass-strong" className="mt-auto rounded-4xl">
            <CardHeader>
              <CardTitle className="text-lg">A support loop built on evidence</CardTitle>
              <CardDescription className="max-w-lg">
                PopSage stays inside approved knowledge and makes uncertainty an
                explicit path to a person.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Card variant="glass" size="sm">
                  <CardHeader>
                    <CardAction>
                      <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                        <WandSparkles className="size-4" />
                      </span>
                    </CardAction>
                    <CardTitle>Grounded answers</CardTitle>
                    <CardDescription>
                      Retrieve, verify, then answer from the workspace knowledge.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card variant="glass" size="sm">
                  <CardHeader>
                    <CardAction>
                      <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                        <MessageCircleMore className="size-4" />
                      </span>
                    </CardAction>
                    <CardTitle>Human continuity</CardTitle>
                    <CardDescription>
                      Hand off with the transcript and reason already attached.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card variant="glass" size="sm" className="flex-row items-center py-2">
                <CardContent className="flex flex-1 items-center gap-4 px-3">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                    <video
                      className="video-thumbnail size-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      aria-hidden="true"
                    >
                      <source
                        src={backgroundVideo}
                        type="video/mp4"
                        media="(prefers-reduced-motion: no-preference)"
                      />
                    </video>
                    <ShieldCheck className="absolute right-2 bottom-2 size-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">Knowledge stays in scope</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">
                      Every source remains workspace-bound, traceable, and removable.
                    </p>
                  </div>
                  <Button variant="glass" size="icon" aria-label="Learn about knowledge safety">
                    <Plus />
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}

export { HeroLanding }
