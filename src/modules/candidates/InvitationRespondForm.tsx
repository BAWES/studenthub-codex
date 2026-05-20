"use client";

import { useActionState } from "react";
import { respondToInvitation } from "./actions";

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
      <section className="candidateEditForm">
        <h2>Response</h2>
        <p className="formNotice">
          You have already {currentStatus === 1 ? "accepted" : "rejected"} this invitation.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="candidateEditForm">
      <h2>Respond to Invitation</h2>
      {state.error ? <p className="formError">{state.error}</p> : null}

      <input type="hidden" name="invitationUuid" value={invitationUuid} />

      <div className="formActions">
        <button
          type="submit"
          name="action"
          value="accept"
          disabled={pending}
          className="acceptButton"
        >
          {pending ? "Sending..." : "Accept invitation"}
        </button>
        <button
          type="submit"
          name="action"
          value="reject"
          disabled={pending}
          className="rejectButton"
        >
          {pending ? "Sending..." : "Reject invitation"}
        </button>
      </div>
    </form>
  );
}
