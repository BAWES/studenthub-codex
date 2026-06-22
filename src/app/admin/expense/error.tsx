"use client";
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
    <div className="shell shellEmbedded">
      <section className="workspaceStage">
        <section className="topbar">
          <h1 className="text-lg font-semibold text-destructive">
            Something went wrong
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            {error.message || "Failed to load expenses."}
          </p>
          <Button onClick={reset} className="mt-4">
            Try again
          </Button>
        </section>
      </section>
    </div>
  );
}
