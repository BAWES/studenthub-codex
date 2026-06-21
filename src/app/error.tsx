"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-8">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-[15px] text-muted-foreground max-w-[400px]">{error.message || "An unexpected error occurred."}</p>
      {error.digest ? <small className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</small> : null}
      <Button onClick={reset} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
