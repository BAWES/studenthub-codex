"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { approveWorkLog, rejectWorkLog } from "@/modules/candidates/worklog-actions";

type WorkLogAction = (state: { error: string }, formData: FormData) => Promise<{ error: string }>;
type FormAction = (formData: FormData) => void;

export function WorkLogStaffActions({
  workLogUuid,
  currentStatus,
}: {
  workLogUuid: string;
  currentStatus: number;
}) {
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const [approveState, approveAction, approvePending] = useActionState(
    approveWorkLog as WorkLogAction,
    { error: "" }
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectWorkLog as WorkLogAction,
    { error: "" }
  );
  const prevApproveError = useRef(approveState.error);
  const prevRejectError = useRef(rejectState.error);

  useEffect(() => {
    if (approveState.error && approveState.error !== prevApproveError.current) {
      toast.error("Approval failed", { description: approveState.error });
    } else if (!approvePending && approveState.error === "" && prevApproveError.current !== "") {
      toast.success("Work log approved");
      setMode("idle");
    }
    prevApproveError.current = approveState.error;
  }, [approveState.error, approvePending]);

  useEffect(() => {
    if (rejectState.error && rejectState.error !== prevRejectError.current) {
      toast.error("Rejection failed", { description: rejectState.error });
    } else if (!rejectPending && rejectState.error === "" && prevRejectError.current !== "") {
      toast.success("Work log rejected");
      setMode("idle");
    }
    prevRejectError.current = rejectState.error;
  }, [rejectState.error, rejectPending]);

  if (currentStatus === 1) {
    return <span className="workLogStatusBadge" data-status="approved">Approved</span>;
  }
  if (currentStatus === 2) {
    return <span className="workLogStatusBadge" data-status="rejected">Rejected</span>;
  }

  if (mode === "reject") {
    return (
      <form action={rejectAction as FormAction} className="workLogRejectForm">
        <input type="hidden" name="workLogUuid" value={workLogUuid} />
        <input name="reason" placeholder="Rejection reason..." required className="workLogRejectInput" maxLength={500} />
        <button type="submit" disabled={rejectPending} className="workLogRejectConfirm">
          {rejectPending ? "..." : "Confirm"}
        </button>
        <button type="button" onClick={() => setMode("idle")} className="workLogRejectCancel">Cancel</button>
      </form>
    );
  }

  return (
    <form action={approveAction as FormAction} className="workLogActions">
      <input type="hidden" name="workLogUuid" value={workLogUuid} />
      <button type="submit" disabled={approvePending} className="workLogApproveBtn">
        {approvePending ? "..." : "Approve"}
      </button>
      <button type="button" onClick={() => setMode("reject")} className="workLogRejectBtn">Reject</button>
    </form>
  );
}
