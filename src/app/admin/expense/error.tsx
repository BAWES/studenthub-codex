"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminExpensesError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[admin/expense]", error);
  }, [error]);

  return (
    <div className="block">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="sticky top-[10px] z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
          <h1 className="text-lg font-semibold text-destructive">
            Something went wrong
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            {error.message || "Failed to load expenses."}
          </p>
          <Button type="button" onClick={reset} className="mt-4">
            Try again
          </Button>
        </section>
      </section>
    </div>
  );
}
