import { Badge, type BadgeProps } from "@/components/ui/badge";

const statusVariantMap: Record<string, BadgeProps["variant"]> = {
  active: "success",
  pending: "warning",
  in_progress: "warning",
  inactive: "secondary",
  completed: "secondary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = statusVariantMap[status] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
