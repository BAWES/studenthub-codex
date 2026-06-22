"use client";

import { useRef, useState } from "react";
import { rejectApplication } from "./actions.server";

type Props = {
  applicationId: number;
  candidateName: string | null;
};

/**
 * Reject button that opens a confirmation dialog with a required reason textarea.
 * Matches the Zendesk Coral + Slack design pattern — reject always requires a reason.
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
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 rounded-lg px-5 text-sm font-semibold transition-colors"
        style={{ backgroundColor: "var(--destructive)", color: "white" }}
      >
        Reject Application
      </button>

      {/* Confirmation dialog overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setOpen(false)}
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-md rounded-xl border p-6 shadow-lg"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Reject Application
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              {candidateName
                ? `Reject the application from ${candidateName}`
                : "Reject this application"}
            </p>

            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
              <label
                htmlFor="rejectionReason"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Reason for rejection <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <textarea
                id="rejectionReason"
                name="rejectionReason"
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm resize-none transition-colors focus:outline-none focus:ring-2"
                placeholder="Explain why this application is being rejected..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError("");
                }}
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: error ? "var(--destructive)" : "var(--border)",
                  color: "var(--ink)",
                  outlineColor: "var(--accent)",
                }}
                autoFocus
              />

              {error && (
                <p className="text-xs mt-1.5" style={{ color: "var(--destructive)" }}>
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="inline-flex items-center h-9 rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center h-9 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--destructive)", color: "white" }}
                >
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
