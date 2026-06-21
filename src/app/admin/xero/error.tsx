"use client";

import { Button } from "@/components/ui/button";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminXeroError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[admin/xero]", error);
  }, [error]);

  return (
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
          <h1 className="text-lg font-semibold text-destructive">
            Something went wrong
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            {error.message || "Failed to load bank transactions."}
          </p>
          <Button onClick={reset} variant="default" className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold bg-primary text-white" type="button">Try again</Button>
        </section>
      </section>
    </div>
  );
}
