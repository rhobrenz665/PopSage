"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { PopSageMark } from "@/components/popsage-mark"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function NavigationSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="glass"
        size="sm"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu data-icon="inline-start" />
        Menu
      </Button>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <PopSageMark className="size-9 text-white" />
            <SheetTitle className="text-white">Explore PopSage</SheetTitle>
          </div>
          <SheetDescription className="text-white/60">
            Grounded AI support that brings a human in at the right moment.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4" aria-label="Landing page">
          <SheetClose
            nativeButton={false}
            render={
              <a
                href="#product"
                className="rounded-xl px-3 py-3 text-white transition-colors hover:bg-white/10"
              />
            }
          >
            Product promise
          </SheetClose>
          <SheetClose
            nativeButton={false}
            render={
              <a
                href="#preview"
                className="rounded-xl px-3 py-3 text-white transition-colors hover:bg-white/10"
              />
            }
          >
            How it works
          </SheetClose>
          <SheetClose
            nativeButton={false}
            render={
              <a
                href="https://github.com/rhobrenz665/PopSage"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-3 text-white transition-colors hover:bg-white/10"
              />
            }
          >
            View the project
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
