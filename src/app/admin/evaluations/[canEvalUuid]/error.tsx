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
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground"
    >
      <p className="text-sm font-medium text-foreground">
        Something went wrong loading this evaluation.
      </p>
      <p className="text-xs max-w-md text-center">
        {error.message}
      </p>
      <Button onClick={reset} variant="default" className="h-8 rounded-lg px-4 text-xs font-semibold bg-primary text-white" type="button">Try again</Button>
    </div>
  );
}
