import { Badge } from "@/components/ui/badge";
import { genericStatusVariant } from "./status-mapping";

export type StatusBadgeProps = {
  variant?: "default" | "secondary" | "success" | "warning" | "outline";
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Status badge using shadcn Badge with semantic status variant mapping.
 * If no explicit variant is provided, it's auto-derived from the label.
 */
export function StatusBadge({
  variant,
  label,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const resolvedVariant = variant ?? genericStatusVariant(label);
  const sizeClass =
    size === "sm"
      ? "text-[11px] px-1.5 py-0.5"
      : size === "lg"
        ? "text-sm px-3 py-1"
        : "";

  return (
    <Badge variant={resolvedVariant} className={`${sizeClass} ${className}`.trim()}>
      {label}
    </Badge>
  );
}
