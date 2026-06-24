"use client";

import { useActionState } from "react";
import { appealWorkLog } from "@/modules/candidates/actions";
import { Alert } from "@/components/ui/alert";

export function WorkLogAppealForm({ workLogUuid }: { workLogUuid: string }) {
  const [state, action, pending] = useActionState(appealWorkLog, { error: "" });

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-lg font-semibold text-foreground m-0">Appeal this Work Log</h2>
      {state.error ? <Alert variant="destructive" className="py-2 text-sm">{state.error}</Alert> : null}

      <input type="hidden" name="workLogUuid" value={workLogUuid} />

      <label className="grid gap-1">
        <span className="text-sm font-medium text-muted-foreground">Reason for appeal</span>
        <textarea
          name="reason"
          rows={4}
          placeholder="Explain why this work log needs review..."
          required
          className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Submitting..." : "Submit appeal"}
        </button>
      </div>
    </form>
  );
}
