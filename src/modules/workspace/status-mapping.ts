/**
 * Map application/workflow status strings to shadcn Badge variant names.
 * shadcn Badge supports: default, secondary, success, warning, outline.
 * Use "warning" for rejected/error/delete states (no destructive variant).
 */
export function genericStatusVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "outline" {
  if (!status || status === "unknown") return "outline";

  const s = status.toLowerCase();

  if (
    s === "active" ||
    s === "approved" ||
    s === "accepted" ||
    s === "success" ||
    s === "completed" ||
    s === "done"
  )
    return "success";

  if (
    s === "pending" ||
    s === "review" ||
    s === "needs-review" ||
    s === "in-review" ||
    s === "in_progress"
  )
    return "warning";

  // Rejected/error/delete → warning (no destructive variant in shadcn Badge)
  if (
    s === "rejected" ||
    s === "error" ||
    s === "failed" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "deleted" ||
    s === "void"
  )
    return "warning";

  if (s === "closed" || s === "archived") return "secondary";
  if (s === "draft" || s === "new") return "outline";

  return "secondary";
}
