"use client";

import { Button } from "@/components/ui/button";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminNotesError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[admin/note]", error);
  }, [error]);

  return (
    <div className="min-h-svh">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="grid grid-cols-[1fr_minmax(220px,300px)] items-center gap-4.5 border border-border rounded-lg bg-card p-4">
          <div>
            <h1 className="text-lg font-semibold text-destructive">
              Something went wrong
            </h1>
            <p className="text-sm mt-1 text-muted-foreground">
              {error.message || "Failed to load notes."}
            </p>
            <Button onClick={reset} variant="default" className="mt-4" type="button">Try again</Button>
          </div>
        </section>
      </section>
    </div>
  );
}
