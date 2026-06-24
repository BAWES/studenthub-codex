"use client";

import { useActionState } from "react";
import { respondToInvitation } from "@/modules/candidates/actions";
import { Alert } from "@/components/ui/alert";

export function InvitationRespondForm({
  invitationUuid,
  currentStatus,
}: {
  invitationUuid: string;
  currentStatus: number;
}) {
  const [state, action, pending] = useActionState(respondToInvitation, { error: "" });

  if (currentStatus === 1 || currentStatus === 2) {
    return (
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold text-foreground m-0">Response</h2>
        <p className="text-sm text-muted-foreground m-0">
          You have already {currentStatus === 1 ? "accepted" : "rejected"} this invitation.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-lg font-semibold text-foreground m-0">Respond to Invitation</h2>
      {state.error ? <Alert variant="destructive" className="py-2 text-sm">{state.error}</Alert> : null}

      <input type="hidden" name="invitationUuid" value={invitationUuid} />

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          name="action"
          value="accept"
          disabled={pending}
          className="inline-flex items-center justify-center h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Sending..." : "Accept invitation"}
        </button>
        <button
          type="submit"
          name="action"
          value="reject"
          disabled={pending}
          className="inline-flex items-center justify-center h-9 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow hover:bg-destructive/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Sending..." : "Reject invitation"}
        </button>
      </div>
    </form>
  );
}
