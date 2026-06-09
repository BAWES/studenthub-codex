"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ActionButton } from "./ActionButton";
import type { ActionButtonProps } from "./ActionButton";

// ---------------------------------------------------------------------------
// NewRequestButton
// ---------------------------------------------------------------------------

export interface NewRequestButtonProps extends Omit<ActionButtonProps, "icon" | "iconPosition" | "variant"> {
  /** Button label — default: "New Request". */
  label?: string;
}

/**
 * Convenience button for creating new requests.
 *
 * Wraps ActionButton with a plus icon and "request.create" capability check.
 * Intended as the primary call-to-action on request list pages.
 *
 * @example
 * ```tsx
 * <NewRequestButton onClick={() => router.push("/staff/requests/new")} />
 *
 * <NewRequestButton label="Create Position" className="ml-auto" />
 * ```
 */
export function NewRequestButton({
  label = "New Request",
  size = "md",
  ...props
}: NewRequestButtonProps) {
  return (
    <ActionButton
      variant="primary"
      size={size}
      icon={<Plus className="size-4" />}
      iconPosition="leading"
      {...props}
    >
      {label}
    </ActionButton>
  );
}
