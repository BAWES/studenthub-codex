"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ActionButton, type ActionButtonProps } from "./ActionButton";

export interface NewRequestButtonProps
  extends Omit<ActionButtonProps, "asChild" | "icon" | "leadingIcon" | "trailingIcon"> {
  /** Where the button links to. Defaults to "/company/requests/create". */
  href?: Route<string>;
}

/**
 * NewRequestButton — a styled link button that navigates to the
 * "New Request" creation page.
 *
 * Consolidates the inline "+New Request" `<Link>` that was previously
 * hand-styled on the Company Requests page.
 *
 * @example
 * ```tsx
 * <NewRequestButton />
 * <NewRequestButton href="/admin/requests/create" />
 * ```
 */
export function NewRequestButton({
  href = "/company/requests/create" as Route<string>,
  children = "+ New Request",
  variant = "primary",
  size = "md",
  ...props
}: NewRequestButtonProps) {
  return (
    <ActionButton asChild variant={variant} size={size} {...props}>
      <Link href={href}>{children}</Link>
    </ActionButton>
  );
}
