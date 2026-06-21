import { Badge, type BadgeProps } from "@/components/ui/badge";

export type StatusBadgeVariant = BadgeProps["variant"];
export type StatusBadgeSize = "sm" | "md" | "lg";

const statusVariantMap: Record<string, BadgeProps["variant"]> = {
  active: "success",
  pending: "warning",
  in_progress: "warning",
  inactive: "secondary",
  completed: "secondary",
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: StatusBadgeSize;
}

export function StatusBadge({ status, className, size }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
