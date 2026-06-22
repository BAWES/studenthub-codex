import { Badge, type BadgeProps } from "@/components/ui/badge";

// ── Types ────────────────────────────────────────────────────

export type StatusBadgeVariant = "info" | "success" | "warning" | "error" | "neutral" | "muted";
export type StatusBadgeSize = "sm" | "md" | "lg";

export type StatusBadgeProps =
  // New API: status + className
  | { status: string; className?: string; variant?: never; label?: never; size?: never }
  // Old API: variant + label + optional size
  | { variant: StatusBadgeVariant; label: string; size?: StatusBadgeSize; status?: never; className?: string };

// ─── Variant map for the new API (status → badge variant) ──────

const statusVariantMap: Record<string, BadgeProps["variant"]> = {
  active: "success",
  pending: "warning",
  in_progress: "warning",
  inactive: "secondary",
  completed: "secondary",
};

function badgeVariantFromStatusBadgeVariant(v: StatusBadgeVariant): BadgeProps["variant"] {
  switch (v) {
    case "info":    return "default";
    case "success": return "success";
    case "warning": return "warning";
    case "error":   return "warning";
    case "neutral": return "secondary";
    case "muted":   return "secondary";
  }
}

// ─── Component ────────────────────────────────────────────────

export function StatusBadge(props: StatusBadgeProps) {
  // Old API: { variant, label, size }
  if ("variant" in props && props.variant) {
    const badgeVariant = badgeVariantFromStatusBadgeVariant(props.variant);
    return (
      <Badge variant={badgeVariant} className={props.className}>
        {props.label}
      </Badge>
    );
  }

  // New API: { status, className }
  const { status, className } = props as { status: string; className?: string };
  const variant = statusVariantMap[status] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
