"use client";

import { useActionState } from "react";
import { initTransfer } from "@/modules/balances/actions";

export function InitiateTransferForm() {
  const [state, action, pending] = useActionState(initTransfer, {
    success: false,
  });

  if (state.success) {
    return (
      <section className="candidateEditForm">
        <h2>Initiate Transfer</h2>
        <p className="formNotice">
          Transfer request submitted. Your payout will be processed.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="candidateEditForm">
      <h2>Request Payout</h2>
      {state.error ? <p className="formError">{state.error}</p> : null}

      <label>
        <span>Amount (KWD)</span>
        <input
          type="number"
          name="amount"
          min="0.001"
          step="0.001"
          placeholder="e.g. 100.000"
          required
          disabled={pending}
        />
      </label>

      <div className="formActions">
        <button type="submit" disabled={pending}>
          {pending ? "Processing..." : "Initiate Transfer"}
        </button>
      </div>
    </form>
  );
}
