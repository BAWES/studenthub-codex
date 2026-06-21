import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeVariant =
  | "info"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "default"
  | "secondary"
  | "outline"
  | "muted";

export type { StatusBadgeVariant };

export type StatusBadgeProps = {
  variant?: StatusBadgeVariant;
  label?: string;
  children?: ReactNode;
  size?: "sm" | "default" | "lg";
  className?: string;
};

const sizeClasses: Record<string, string> = {
  sm: "text-[11px] px-1.5 py-0",
  default: "",
  lg: "text-sm px-3 py-1",
};

const variantMap: Record<StatusBadgeVariant, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  muted: "bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-500",
  default: "",
  secondary: "",
  outline: "",
};

/**
 * A status badge built on shadcn/ui Badge with convenience variants.
 *
 * Usage:
 * ```tsx
 * <StatusBadge variant="success" label="Active" size="sm" />
 * <StatusBadge variant="warning" size="sm">Pending Review</StatusBadge>
 * ```
 */
export function StatusBadge({
  variant = "default",
  label,
  children,
  size = "default",
  className,
}: StatusBadgeProps) {
  const displayText = label ?? children;

  if (variant in variantMap && variantMap[variant as keyof typeof variantMap]) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          sizeClasses[size],
          variantMap[variant],
          className,
        )}
      >
        {displayText}
      </span>
    );
  }

  return (
    <Badge variant={variant as "default" | "secondary" | "outline"} className={cn(sizeClasses[size], className)}>
      {displayText}
    </Badge>
  );
}
