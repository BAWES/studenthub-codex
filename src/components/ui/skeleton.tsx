import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  GlassSkeleton — shimmer skeleton for the StudentHub OS aesthetic  */
/*  Uses glass-morphism backgrounds with a subtle shimmer sweep        */
/*  instead of the standard animate-pulse.                             */
/* ------------------------------------------------------------------ */

export type SkeletonVariant = "glass" | "pulse";

export interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Skeleton animation style: "glass" (default, shimmer sweep) or "pulse" (standard) */
  variant?: SkeletonVariant;
  /** Optional rounded variant: defaults to rounded-md */
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

const roundedMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

function Skeleton({ className, variant = "glass", rounded = "md", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn(
        variant === "glass"
          ? "shSkeletonGlass"
          : "animate-pulse bg-accent",
        roundedMap[rounded],
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
