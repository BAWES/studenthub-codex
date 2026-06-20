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
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-lg font-semibold text-destructive">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message ?? "Failed to load fulltimer details."}
      </p>
      <Button onClick={reset} variant="default" className="rounded-lg px-4 py-2 text-sm font-semibold bg-primary text-white" type="button">Try again</Button>
    </div>
  );
}
