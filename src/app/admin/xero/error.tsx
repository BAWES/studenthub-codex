"use client";

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
<<<<<<< Updated upstream
    <div className="min-h-screen p-6">
      <section className="space-y-6">
        <section className="flex items-center justify-between gap-4">
=======
    <div className="shell shellEmbedded">
      <section className="min-w-0 overflow-x-hidden grid content-start gap-3.5 p-3.5">
        <section className="topbar">
>>>>>>> Stashed changes
          <h1 className="text-lg font-semibold" style={{ color: "var(--sh-error)" }}>
            Something went wrong
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {error.message || "Failed to load bank transactions."}
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
