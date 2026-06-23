import { cn } from "@/lib/utils"

function Skeleton({ className, variant: _variant, ...props }: React.ComponentProps<"div"> & { variant?: string }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
