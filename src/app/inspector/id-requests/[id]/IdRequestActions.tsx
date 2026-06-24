"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { approveIdRequest, rejectIdRequest } from "@/modules/candidates/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function IdRequestActions({
  requestUuid,
  currentStatus,
}: {
  requestUuid: string;
  currentStatus: string | null | undefined;
}) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(approveIdRequest, { error: "" });
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectIdRequest, { error: "" });

  if (currentStatus !== "pending") return null;

  const handleApprove = async (formData: FormData) => {
    formData.set("requestUuid", requestUuid);
    const result = await approveIdRequest({ error: "" }, formData);
    if (!result.error) {
      toast.success("ID request approved");
      router.refresh();
    }
    setApproveDialogOpen(false);
    return result;
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* ── Approve with AlertDialog confirmation ── */}
      <form action={approveAction} onSubmit={(e) => e.preventDefault()}>
        <input type="hidden" name="requestUuid" value={requestUuid} />
        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" disabled={approvePending}>
              {approvePending ? "Approving..." : "Approve request"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve ID Verification Request?</AlertDialogTitle>
              <AlertDialogDescription>
                All candidates in this batch will be notified about their approved ID
                verification. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  const form = document.querySelector<HTMLFormElement>("[data-approve-form]");
                  if (form) {
                    const fd = new FormData(form);
                    await handleApprove(fd);
                  }
                }}
              >
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
      {approveState.error && (
        <p className="text-sm text-destructive mt-1">{approveState.error}</p>
      )}

      {/* ── Reject with inline reason form ── */}
      {!showReject ? (
        <Button variant="destructive" onClick={() => setShowReject(true)}>
          Reject request
        </Button>
      ) : (
        <form
          action={rejectAction}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            const result = await rejectIdRequest({ error: "" }, fd);
            if (!result.error) {
              toast.success("ID request rejected");
              router.refresh();
              setShowReject(false);
            }
          }}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        >
          <input type="hidden" name="requestUuid" value={requestUuid} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Rejection reason</span>
            <Textarea
              name="reason"
              rows={3}
              required
              minLength={10}
              maxLength={500}
              placeholder="Explain why this ID verification request is being rejected (min 10 characters)..."
            />
          </label>
          {rejectState.error && (
            <p className="text-sm text-destructive">{rejectState.error}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="destructive" disabled={rejectPending}>
              {rejectPending ? "Rejecting..." : "Confirm rejection"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReject(false)}
              disabled={rejectPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
