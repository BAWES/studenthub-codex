"use client";

import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background p-8">
      <Card className="max-w-[420px] w-full">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          {/* Coral error indicator */}
          <div className="flex size-14 items-center justify-center rounded-full bg-[#eb6651]/10">
            <span className="text-3xl font-black leading-none text-[#eb6651]">!</span>
          </div>
          <div className="w-12 h-[3px] rounded-sm bg-[#eb6651]" aria-hidden="true" />
          <h1 className="text-xl font-bold m-0 text-foreground">
            Something went wrong
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed m-0 text-center">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest ? (
            <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </code>
          ) : null}
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
