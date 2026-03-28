import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-white/[0.08] bg-black/10 px-4 py-3 text-base transition-all outline-none placeholder:text-muted-foreground/30 focus:bg-black/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
