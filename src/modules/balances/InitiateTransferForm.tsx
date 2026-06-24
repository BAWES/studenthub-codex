"use client";

import { useActionState } from "react";
import { initTransfer } from "@/modules/balances/actions";
import { Alert } from "@/components/ui/alert";

export function InitiateTransferForm() {
  const [state, action, pending] = useActionState(initTransfer, {
    success: false,
  });

  if (state.success) {
    return (
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold text-foreground m-0">Initiate Transfer</h2>
        <p className="text-sm text-muted-foreground m-0">
          Transfer request submitted. Your payout will be processed.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-lg font-semibold text-foreground m-0">Request Payout</h2>
      {state.error ? <Alert variant="destructive" className="py-2 text-sm">{state.error}</Alert> : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium text-muted-foreground">Amount (KWD)</span>
        <input
          type="number"
          name="amount"
          min="0.001"
          step="0.001"
          placeholder="e.g. 100.000"
          required
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Requesting..." : "Request Payout"}
        </button>
      </div>
    </form>
  );
}
