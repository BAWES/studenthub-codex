import type { ReactNode } from "react";

export function EmptyState({
  title = "No records found",
  description = "There are no items to display.",
  children
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="emptyState">
      <strong>{title}</strong>
      <span>{description}</span>
      {children}
    </div>
  );
}
