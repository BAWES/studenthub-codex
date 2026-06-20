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
    <div className="flex items-center justify-center p-12">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {error.message ?? "Failed to load applications. Please try again."}
        </p>
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  );
}
