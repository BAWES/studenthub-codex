"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type StatusLevel = "success" | "warning" | "error" | "info" | "neutral";

const statusConfig: Record<StatusLevel, {
  bg: string;
  text: string;
  glow: string;
  dot: string;
}> = {
  success: {
    bg: "var(--sh-success-bg)",
    text: "var(--sh-success)",
    glow: "var(--sh-success-glow)",
    dot: "var(--sh-success)",
  },
  warning: {
    bg: "var(--sh-warning-bg)",
    text: "var(--sh-warning)",
    glow: "var(--sh-warning-glow)",
    dot: "var(--sh-warning)",
  },
  error: {
    bg: "var(--sh-error-bg)",
    text: "var(--sh-error)",
    glow: "var(--sh-error-glow)",
    dot: "var(--sh-error)",
  },
  info: {
    bg: "var(--sh-info-bg)",
    text: "var(--sh-info)",
    glow: "var(--sh-info-glow)",
    dot: "var(--sh-info)",
  },
  neutral: {
    bg: "var(--surface)",
    text: "var(--muted)",
    glow: "transparent",
    dot: "var(--muted)",
  },
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
  const cfg = statusConfig[status];

  return (
    <span
      ref={ref}
      data-slot="status-badge"
      className={cn(
        "shStatusBadgeBase",
        glow && "shStatusBadge_glow",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5",
        className,
      )}
      style={{
        background: cfg.bg,
        color: cfg.text,
        boxShadow: glow ? cfg.glow : undefined,
        ...style,
      }}
      {...props}
    >
      {showDot && (
        <span
          className="size-1.5 rounded-full shrink-0"
          style={{ background: cfg.dot }}
          aria-hidden="true"
        />
      )}
      {props.children}
    </span>
  );
});

export { StatusBadge, type StatusLevel };
