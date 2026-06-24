"use client";

import { useActionState } from "react";
import { initTransfer } from "@/modules/balances/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InitiateTransferForm() {
  const [state, action, pending] = useActionState(initTransfer, {
    success: false,
  });

  if (state.success) {
    return (
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Initiate Transfer</h2>
        <p className="text-sm text-muted-foreground">
          Transfer request submitted. Your payout will be processed.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Request Payout</h2>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">Amount (KWD)</span>
        <Input
          type="number"
          name="amount"
          min="0.001"
          step="0.001"
          placeholder="e.g. 100.000"
          required
          disabled={pending}
        />
      </label>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Processing..." : "Initiate Transfer"}
        </Button>
      </div>
    </form>
  );
}
