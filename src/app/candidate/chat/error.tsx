"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background p-8">
      <Card className="max-w-[420px] w-full">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          <div className="flex size-14 items-center justify-center rounded-full bg-coral/10">
            <span className="text-3xl font-black leading-none text-coral">!</span>
          </div>
          <div className="w-12 h-[3px] rounded-sm bg-coral" aria-hidden="true" />
          <h2 className="text-xl font-bold m-0 text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center text-muted-foreground">
            {error.message ?? "An unexpected error occurred while loading the Chat page."}
          </p>
          {error.digest ? (
            <small className="text-muted-foreground/60">Error ID: {error.digest}</small>
          ) : null}
          <Button onClick={reset} className="mt-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
