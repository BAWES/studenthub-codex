"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva("shStatusBadgeBase", {
  variants: {
    status: {
      success: "shStatusBadge_success",
      warning: "shStatusBadge_warning",
      error: "shStatusBadge_error",
      info: "shStatusBadge_info",
      neutral: "shStatusBadge_neutral",
    },
    size: {
      sm: "shStatusBadge_sm",
      md: "shStatusBadge_md",
      lg: "shStatusBadge_lg",
    },
  },
  defaultVariants: {
    status: "neutral",
    size: "md",
  },
});

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Optional dot indicator */
  dot?: boolean;
  /** Optional glow effect (default: true) */
  glow?: boolean;
}

function StatusBadge({
  className,
  status,
  size,
  dot = true,
  glow = true,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        statusBadgeVariants({ status, size }),
        glow && "shStatusBadge_glow",
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          data-slot="status-badge-dot"
          className={cn(
            "shStatusBadgeDot",
            status === "success" && "shStatusDot_success",
            status === "warning" && "shStatusDot_warning",
            status === "error" && "shStatusDot_error",
            status === "info" && "shStatusDot_info",
            status === "neutral" && "shStatusDot_neutral",
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
