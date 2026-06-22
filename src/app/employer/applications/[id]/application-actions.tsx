"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import Link from "next/link";

function SubmitButton({
  variant,
  label,
}: {
  variant: "default" | "destructive" | "outline";
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? "Processing..." : label}
    </Button>
  );
}

type ServerAction = (formData: FormData) => Promise<void>;

export function AcceptRejectActions({
  applicationId,
  jobListingId,
  canAcceptReject,
  canRevert,
  acceptAction,
  rejectAction,
  revertAction,
}: {
  applicationId: number;
  jobListingId: number;
  canAcceptReject: boolean;
  canRevert: boolean;
  /** Server action to accept application */
  acceptAction: ServerAction;
  /** Server action to reject application */
  rejectAction: ServerAction;
  /** Server action to revert application */
  revertAction: ServerAction;
}) {
  return (
    <div className="space-y-4">
      {canAcceptReject && (
        <div className="flex gap-3">
          <form action={acceptAction}>
            <input type="hidden" name="applicationId" value={applicationId} />
            <SubmitButton variant="default" label="Accept Application" />
          </form>
          <form action={rejectAction}>
            <input type="hidden" name="applicationId" value={applicationId} />
            <SubmitButton variant="destructive" label="Reject Application" />
          </form>
        </div>
      )}

      {canRevert && (
        <form action={revertAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <SubmitButton variant="outline" label="Revert to Reviewing" />
        </form>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" asChild>
          <Link href="/employer/applications">Back to Applications</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/employer/jobs/${jobListingId}/applications`}>
            View Job Applications
          </Link>
        </Button>
      </div>
    </div>
  );
}
