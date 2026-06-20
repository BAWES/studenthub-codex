"use client";

import { useActionState, useState } from "react";
import { approveIdRequest, rejectIdRequest } from "@/modules/candidates/actions";

export function IdRequestActions({
  requestUuid,
  currentStatus,
}: {
  requestUuid: string;
  currentStatus: string | null | undefined;
}) {
  const [showReject, setShowReject] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(approveIdRequest, { error: "" });
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectIdRequest, { error: "" });

  if (currentStatus !== "pending") return null;

  return (
    <div className="flex flex-col gap-4 mt-4">
      <form
        action={approveAction}
        onSubmit={(e) => {
          if (!window.confirm("Approve this ID verification request? All candidates in the batch will be notified.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="requestUuid" value={requestUuid} />
        <div className="formActions">
          <button type="submit" className="acceptButton" disabled={approvePending}>
            {approvePending ? "Approving..." : "Approve request"}
          </button>
        </div>
        {approveState.error && (
          <p className="text-sm text-destructive mt-1">{approveState.error}</p>
        )}
      </form>

      <form action={rejectAction}>
        <input type="hidden" name="requestUuid" value={requestUuid} />
        {!showReject ? (
          <div className="formActions">
            <button type="button" className="rejectButton" onClick={() => setShowReject(true)}>
              Reject request
            </button>
          </div>
        ) : (
          <>
            <label>
              <span>Rejection reason</span>
              <textarea
                name="reason"
                rows={3}
                required
                minLength={10}
                maxLength={500}
                placeholder="Explain why this ID verification request is being rejected (min 10 characters)..."
              />
            </label>
            {rejectState.error && (
              <p className="text-sm text-destructive mt-1">{rejectState.error}</p>
            )}
            <div className="formActions">
              <button type="submit" className="rejectButton" disabled={rejectPending}>
                {rejectPending ? "Rejecting..." : "Confirm rejection"}
              </button>
              <button type="button" onClick={() => setShowReject(false)} disabled={rejectPending}>
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
