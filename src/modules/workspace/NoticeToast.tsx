"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Shared toast notice catalog.
 * Server actions redirect with `?notice=key` → this component reads it and fires a sonner toast.
 */
const noticeCatalog: Record<string, { title: string; description: string; variant?: "default" | "success" | "error" | "info" }> = {
  // Suggestion notices
  "suggestion-added": {
    title: "Suggestion added",
    description: "The candidate is now in the request suggestion pipeline.",
    variant: "success"
  },
  "duplicate-suggestion": {
    title: "Already suggested",
    description: "This candidate already has an active suggestion for this request.",
    variant: "error"
  },
  "missing-suggestion": {
    title: "Missing details",
    description: "Add a short reason before creating a suggestion.",
    variant: "error"
  },
  // Request notices
  "request-created": {
    title: "Request created",
    description: "The hiring request has been created and is now available.",
    variant: "success"
  },
  "request-updated": {
    title: "Request updated",
    description: "Request details have been saved.",
    variant: "success"
  },
  "status-changed": {
    title: "Status updated",
    description: "Request status has been changed.",
    variant: "success"
  },
  "staff-assigned": {
    title: "Staff assigned",
    description: "A staff member has been assigned to this request.",
    variant: "success"
  },
  // Transfer notices
  "paid-toggled": {
    title: "Payout updated",
    description: "Candidate payment status has been toggled.",
    variant: "success"
  },
  "status-toggled": {
    title: "Transfer lock toggled",
    description: "Transfer lock status has been changed.",
    variant: "success"
  },
  "payment-received": {
    title: "Payment recorded",
    description: "Payment received date has been set.",
    variant: "success"
  },
  "transfer-deleted": {
    title: "Transfer removed",
    description: "The transfer has been soft-deleted.",
    variant: "info"
  },
  // Error notices
  "invalid-params": {
    title: "Invalid request",
    description: "The action parameters were invalid. Please try again.",
    variant: "error"
  },
  "not-found": {
    title: "Not found",
    description: "The requested record could not be found.",
    variant: "error"
  },
  "invalid-date": {
    title: "Invalid date",
    description: "The date provided was not valid.",
    variant: "error"
  },
  "company-not-found": {
    title: "Company not found",
    description: "The selected company does not exist or has been deleted.",
    variant: "error"
  },
  "staff-not-found": {
    title: "Staff not found",
    description: "The specified staff member does not exist.",
    variant: "error"
  },
  "missing-fields": {
    title: "Missing fields",
    description: "Required fields were not provided. Please fill in all required fields.",
    variant: "error"
  },
};

export function NoticeToast() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");
  const shownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!notice || notice === shownRef.current) return;
    shownRef.current = notice;

    const entry = noticeCatalog[notice];
    if (!entry) return;

    const variant = entry.variant ?? "default";

    switch (variant) {
      case "success":
        toast.success(entry.title, { description: entry.description });
        break;
      case "error":
        toast.error(entry.title, { description: entry.description });
        break;
      case "info":
        toast.info(entry.title, { description: entry.description });
        break;
      default:
        toast(entry.title, { description: entry.description });
    }
  }, [notice]);

  return null;
}
