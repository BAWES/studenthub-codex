"use client";

import { useRef, useState } from "react";
import { rejectApplication } from "./actions.server";
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

type Props = {
  applicationId: number;
  candidateName: string | null;
};

/**
 * Reject button that opens a confirmation dialog with a required reason textarea.
 * Matches the Zendesk Coral + Slack design pattern — reject always requires a reason.
 * Uses shadcn Dialog and Button components with Tailwind CSS only — no inline styles.
 */
export function RejectButton({ applicationId, candidateName }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!submitting) setOpen(isOpen); }}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          Reject Application
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              {candidateName
                ? `Reject the application from ${candidateName}`
                : "Reject this application"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Reason for rejection <span className="text-destructive">*</span>
            </label>
            <textarea
              id="rejectionReason"
              name="rejectionReason"
              rows={4}
              className={`w-full rounded-lg border px-3 py-2 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
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
              <p className="text-xs mt-1.5 text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
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
