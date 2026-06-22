"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { rejectApplication } from "./actions.server";

type Props = {
  applicationId: number;
  candidateName: string | null;
};

/**
 * Reject button that opens a confirmation dialog with a required reason textarea.
 * Matches the shadcn + Zendesk Coral design pattern — reject always requires a reason.
 */
export function RejectButton({ applicationId, candidateName }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.set("applicationId", String(applicationId));
    formData.set("rejectionReason", trimmed);

    try {
      await rejectApplication(formData);
    } catch {
      setError("Failed to reject application. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Reject Application</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            {candidateName
              ? `Reject the application from ${candidateName}`
              : "Reject this application"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="rejectionReason" className={error ? "text-destructive" : ""}>
              Reason for rejection <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="rejectionReason"
              name="rejectionReason"
              rows={4}
              className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                error ? "border-destructive" : "border-input"
              }`}
              placeholder="Explain why this application is being rejected..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={submitting}
            >
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
