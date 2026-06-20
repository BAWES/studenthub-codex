"use client";

import { useEffect } from "react";

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
          <h1 className="text-lg font-semibold" style={{ color: "var(--sh-error)" }}>
            Something went wrong
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {error.message || "Failed to load expenses."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--sh-primary)", color: "#fff" }}
          >
            Try again
          </button>
        </section>
      </section>
    </div>
  );
}
