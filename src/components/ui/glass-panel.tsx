"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @deprecated Board directive — use plain div with rounded-lg border border-[var(--border)] bg-white
 */

const glassVariants = {
  subtle: "",                // default
  strong: "shGlassStrong",
  elevated: "shGlassElevated",
} as const;

const radiusVariants = {
  sm: "shGlassRadiusSm",
  md: "shGlassRadiusMd",
  lg: "shGlassRadiusLg",
  xl: "shGlassRadiusXl",
  full: "shGlassRadiusFull",
} as const;

export interface GlassPanelProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Glass intensity: subtle (default), strong (more opaque), elevated (with glow) */
  variant?: keyof typeof glassVariants;
  /** Border radius */
  radius?: keyof typeof radiusVariants;
  /** Remove padding (for nested layouts) */
  noPadding?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  { className, variant = "subtle", radius = "lg", noPadding = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="glass-panel"
      className={cn(
        "shGlassBase",
        glassVariants[variant],
        radiusVariants[radius],
        noPadding ? "p-0" : "p-4",
        className,
      )}
      {...props}
    />
  );
});

export { GlassPanel, glassVariants };
