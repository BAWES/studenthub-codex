"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Variant → Tailwind class maps
// ---------------------------------------------------------------------------

const variantStyles: Record<string, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 " +
    "shadow-sm dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 " +
    "dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-600",
  outline:
    "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100 " +
    "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 " +
    "dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 " +
    "shadow-sm dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700",
};

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

const iconOnlySizes: Record<string, string> = {
  sm: "h-8 w-8 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-12 w-12 p-0",
};

// ---------------------------------------------------------------------------
// Spinner SVG
// ---------------------------------------------------------------------------

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionButtonVariant = keyof typeof variantStyles;
export type ActionButtonSize = keyof typeof sizeStyles;

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ActionButtonVariant;
  /** Size preset */
  size?: ActionButtonSize;
  /** When true, shows a spinner and disables interaction */
  loading?: boolean;
  /** Text to show when loading (replaces children) */
  loadingText?: string;
  /** Icon rendered before the label */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label */
  trailingIcon?: React.ReactNode;
  /** Icon rendered alone (icon-only mode). Omits children. */
  icon?: React.ReactNode;
  /** If true, renders as child element using Radix Slot */
  asChild?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Shared `<ActionButton>` — a styled button with variants, sizes, icons,
 * loading state, and disabled state.
 *
 * Variants: primary (blue), secondary, outline, ghost, danger
 * Sizes: sm (32px), md (40px), lg (48px)
 *
 * Consolidates the following inline buttons:
 * - Company +New Request
 * - Admin action buttons
 * - Staff action buttons
 */
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      leadingIcon,
      trailingIcon,
      icon,
      asChild = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const Comp = asChild ? Slot : "button";

    // Icon-only mode: render just the icon in a square button
    if (icon) {
      return (
        <Comp
          ref={ref}
          disabled={isDisabled}
          className={cn(
            "inline-flex items-center justify-center rounded-lg font-semibold",
            "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            variantStyles[variant],
            iconOnlySizes[size],
            className,
          )}
          {...props}
        >
          {loading ? <Spinner className="h-4 w-4" /> : icon}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "select-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leadingIcon}
            {children}
            {trailingIcon}
          </>
        )}
      </Comp>
    );
  },
);

ActionButton.displayName = "ActionButton";
