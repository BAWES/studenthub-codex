"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { approveWorkLog, rejectWorkLog } from "@/modules/candidates/worklog-actions";

export function WorkLogStaffActions({
  workLogUuid,
  currentStatus,
}: {
  workLogUuid: string;
  currentStatus: number | null;
}) {
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const [approveState, approveAction, approvePending] = useActionState(approveWorkLog, { error: "" });
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectWorkLog, { error: "" });
  const prevApproveError = useRef(approveState.error);
  const prevRejectError = useRef(rejectState.error);

  useEffect(() => {
    if (approveState.error && approveState.error !== prevApproveError.current) {
      toast.error("Approval failed", { description: approveState.error });
    } else if (!approvePending && approveState.error === "" && prevApproveError.current !== "") {
      toast.success("Work log approved", { description: "The work log entry has been approved." });
    }
    prevApproveError.current = approveState.error;
  }, [approveState.error, approvePending]);

  useEffect(() => {
    if (rejectState.error && rejectState.error !== prevRejectError.current) {
      toast.error("Rejection failed", { description: rejectState.error });
    } else if (!rejectPending && rejectState.error === "" && prevRejectError.current !== "") {
      toast.success("Work log rejected", { description: "The work log entry has been rejected." });
      setMode("idle");
    }
    prevRejectError.current = rejectState.error;
  }, [rejectState.error, rejectPending]);

  const isPending = currentStatus === 0;

  if (!isPending) {
    return (
      <span className="workLogStatusBadge" data-status={currentStatus}>
        {currentStatus === 1 ? "Approved" : currentStatus === 2 ? "Rejected" : `Status ${currentStatus}`}
      </span>
    );
  }

  if (mode === "reject") {
    return (
      <form action={rejectAction} className="workLogRejectForm">
        <input type="hidden" name="workLogUuid" value={workLogUuid} />
        <input
          name="reason"
          placeholder="Rejection reason..."
          required
          className="workLogRejectInput"
          maxLength={500}
        />
        <button type="submit" disabled={rejectPending} className="workLogRejectConfirm">
          {rejectPending ? "..." : "Confirm"}
        </button>
        <button type="button" onClick={() => setMode("idle")} className="workLogRejectCancel">
          Cancel
        </button>
      </form>
    );
  }

  return (
    <form action={approveAction} className="workLogActions">
      <input type="hidden" name="workLogUuid" value={workLogUuid} />
      <button type="submit" disabled={approvePending} className="workLogApproveBtn">
        {approvePending ? "..." : "Approve"}
      </button>
      <button type="button" onClick={() => setMode("reject")} className="workLogRejectBtn">
        Reject
      </button>
    </form>
  );
}
