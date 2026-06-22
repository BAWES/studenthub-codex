"use client";

import { useActionState } from "react";
import { markNotificationRead } from "@/modules/candidate-notifications/actions";

export function MarkReadButton({ notificationUuid }: { notificationUuid: string }) {
  const [state, formAction, pending] = useActionState(
    markNotificationRead.bind(null, notificationUuid),
    null as { success?: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="mt-4">
      <button
        type="submit"
        disabled={pending || state?.success === true}
        className="btn btn-primary"
      >
        {pending ? "Marking..." : state?.success === true ? "✓ Read" : "Mark as Read"}
      </button>
      {state?.error ? (
        <p className="text-sm text-red-600 mt-1">{state.error}</p>
      ) : null}
    </form>
  );
}
