"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InspectorErrorPage({
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
          <div className="flex size-14 items-center justify-center rounded-full bg-[#eb6651]/10">
            <span className="text-3xl font-black leading-none text-[#eb6651]">!</span>
          </div>
          <div className="w-12 h-[3px] rounded-sm bg-[#eb6651]" aria-hidden="true" />
          <h1 className="text-xl font-bold m-0 text-foreground">
            Inspector system error
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed m-0 text-center">
            {error.message || "An unexpected error occurred in the inspector workspace."}
          </p>
          {error.digest ? (
            <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </code>
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
