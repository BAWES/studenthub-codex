"use client";

import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ActionButtonSize = "sm" | "md" | "lg" | "icon";
export type IconPosition = "leading" | "trailing" | "only";

export interface ActionButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  /** Visual variant — maps to shadcn Button variants. Default: "primary". */
  variant?: ActionButtonVariant;
  /** Size — maps to shadcn Button sizes. Default: "md". */
  size?: ActionButtonSize;
  /** Optional icon element (lucide-react component instance). */
  icon?: React.ReactNode;
  /** Where to place the icon relative to children text. Default: "leading". */
  iconPosition?: IconPosition;
  /** Show loading spinner and disable interaction. */
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Variant mapping: ActionButtonVariant → shadcn Button variant
// ---------------------------------------------------------------------------

const variantMap: Record<ActionButtonVariant, NonNullable<ButtonProps["variant"]>> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "destructive",
};

// ---------------------------------------------------------------------------
// Size mapping: ActionButtonSize → shadcn Button size
// ---------------------------------------------------------------------------

const sizeMap: Record<ActionButtonSize, NonNullable<ButtonProps["size"]>> = {
  sm: "sm",
  md: "default",
  lg: "lg",
  icon: "icon",
};

// ---------------------------------------------------------------------------
// ActionButton
// ---------------------------------------------------------------------------

/**
 * Shared action button used across workspace pages.
 *
 * Wraps the shadcn/ui Button with opinionated defaults (primary variant,
 * no `asChild` surface). Supports icons, loading state, and standard
 * button props.
 *
 * For capability-gated visibility, the consumer is expected to check the
 * user's capabilities from the WorkspaceOSContext session and conditionally
 * render this button.
 *
 * @example
 * ```tsx
 * <ActionButton icon={<Plus />} onClick={() => setShowForm(true)}>
 *   New Request
 * </ActionButton>
 *
 * <ActionButton variant="danger" loading onClick={handleDelete}>
 *   Delete
 * </ActionButton>
 * ```
 */
export function ActionButton({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "leading",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  const content = loading ? (
    <Loader2Icon className="size-4 animate-spin" aria-label="Loading" />
  ) : (
    children
  );

  const iconElement = loading ? null : icon;

  return (
    <Button
      className={cn(className)}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={isDisabled}
      {...props}
    >
      {iconPosition === "leading" && iconElement ? (
        <span className="inline-flex items-center gap-2">
          {iconElement}
          {content}
        </span>
      ) : iconPosition === "trailing" && iconElement ? (
        <span className="inline-flex items-center gap-2">
          {content}
          {iconElement}
        </span>
      ) : iconPosition === "only" && iconElement ? (
        iconElement
      ) : (
        content
      )}
    </Button>
  );
}
