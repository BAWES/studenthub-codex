"use client";

import { useActionState } from "react";
import { appealWorkLog } from "./actions";

export function WorkLogAppealForm({ workLogUuid }: { workLogUuid: string }) {
  const [state, action, pending] = useActionState(appealWorkLog, { error: "" });

  return (
    <form action={action} className="candidateEditForm">
      <h2>Appeal this Work Log</h2>
      {state.error ? <p className="formError">{state.error}</p> : null}

      <input type="hidden" name="workLogUuid" value={workLogUuid} />

      <label>
        <span>Reason for appeal</span>
        <textarea name="reason" rows={4} placeholder="Explain why this work log needs review..." required />
      </label>

      <div className="formActions">
        <button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit appeal"}
        </button>
      </div>
    </form>
  );
}
