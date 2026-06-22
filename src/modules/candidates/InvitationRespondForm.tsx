"use client";

import { useActionState } from "react";
import { respondToInvitation } from "@/modules/candidates/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function InvitationRespondForm({
  invitationUuid,
  currentStatus,
}: {
  invitationUuid: string;
  currentStatus: number;
}) {
  const [state, action, pending] = useActionState(respondToInvitation, { error: "" });

  if (currentStatus === 1 || currentStatus === 2) {
    return (
      <Card className="mb-6">
        <CardContent className="p-5 grid gap-2">
          <h2 className="text-lg font-semibold m-0">Response</h2>
          <p className="text-sm text-muted-foreground m-0">
            You have already {currentStatus === 1 ? "accepted" : "rejected"} this invitation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <form action={action} className="grid gap-4">
          <h2 className="text-lg font-semibold m-0">Respond to Invitation</h2>
          {state.error ? (
            <p className="text-sm text-destructive font-medium">{state.error}</p>
          ) : null}

          <input type="hidden" name="invitationUuid" value={invitationUuid} />

          <div className="flex gap-3 pt-1">
            <Button type="submit" name="action" value="accept" disabled={pending}>
              {pending ? "Sending..." : "Accept invitation"}
            </Button>
            <Button type="submit" name="action" value="reject" disabled={pending} variant="destructive">
              {pending ? "Sending..." : "Reject invitation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
