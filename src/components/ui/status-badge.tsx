"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type StatusLevel = "success" | "warning" | "error" | "info" | "neutral";

const statusClasses: Record<StatusLevel, {
  base: string;
  dot: string;
}> = {
  success: {
    base: "bg-success-bg text-success",
    dot: "bg-success",
  },
  warning: {
    base: "bg-warning-bg text-warning",
    dot: "bg-warning",
  },
  error: {
    base: "bg-error-bg text-error",
    dot: "bg-error",
  },
  info: {
    base: "bg-info-bg text-info",
    dot: "bg-info",
  },
  neutral: {
    base: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const glowClasses: Record<string, string> = {
  success: "shadow-[var(--sh-success-glow)]",
  warning: "shadow-[var(--sh-warning-glow)]",
  error: "shadow-[var(--sh-error-glow)]",
  info: "shadow-[var(--sh-info-glow)]",
  neutral: "",
};

export interface StatusBadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Status level that maps to color + glow */
  status?: StatusLevel;
  /** Show a small dot indicator before the label */
  showDot?: boolean;
  /** Enable subtle glow effect */
  glow?: boolean;
  /** Small variant (compact) */
  size?: "sm" | "md";
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { className, status = "neutral", showDot = false, glow = false, size = "md", style, ...props },
  ref,
) {
  const cfg = statusClasses[status];

  return (
    <span
      ref={ref}
      data-slot="status-badge"
      className={cn(
        cfg.base,
        glow && status !== "neutral" && glowClasses[status],
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5",
        "inline-flex items-center gap-1 rounded-full font-medium",
        className,
      )}
      style={style}
      {...props}
    >
      {showDot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", cfg.dot)}
          aria-hidden="true"
        />
      )}
      {props.children}
    </span>
  );
});

export { StatusBadge, type StatusLevel };
