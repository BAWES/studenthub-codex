"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-sm font-medium text-destructive">
        Something went wrong loading salary records.
      </p>
      <p className="text-xs text-muted-foreground">
        {error.message}
      </p>
      <Button
        type="button"
        onClick={reset}
        size="sm"
      >
        Try again
      </Button>
    </div>
  );
}
