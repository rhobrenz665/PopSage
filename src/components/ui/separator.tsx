"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "cn"

function Separator({
  className,
  orientation = "horizontal",
  tone = "default",
  grow = false,
  ...props
}: SeparatorPrimitive.Props & {
  tone?: "default" | "glass"
  grow?: boolean
}) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        tone === "glass" ? "bg-white/20" : "bg-border",
        grow && "min-w-0 flex-1 data-horizontal:w-auto",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
