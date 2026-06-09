"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass intensity: subtle (default), strong (more opaque), elevated (with glow) */
  variant?: keyof typeof glassVariants;
  /** Border radius */
  radius?: keyof typeof radiusVariants;
  /** Remove padding (for nested layouts) */
  noPadding?: boolean;
}

function GlassPanel({
  className,
  variant = "subtle",
  radius = "lg",
  noPadding = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
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
}

export { GlassPanel, glassVariants };
