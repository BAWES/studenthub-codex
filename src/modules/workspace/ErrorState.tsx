"use client";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this data.",
  onRetry,
  retryLabel = "Try again"
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="emptyState">
      <strong>{title}</strong>
      <span>{description}</span>
      {onRetry ? (
        <Button onClick={onRetry} variant="secondary" size="sm">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
