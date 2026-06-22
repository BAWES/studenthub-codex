"use client";

import { useActionState } from "react";
import { appealWorkLog } from "@/modules/candidates/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function WorkLogAppealForm({ workLogUuid }: { workLogUuid: string }) {
  const [state, action, pending] = useActionState(appealWorkLog, { error: "" });

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <form action={action} className="grid gap-4">
          <h2 className="text-lg font-semibold m-0">Appeal this Work Log</h2>
          {state.error ? (
            <p className="text-sm text-destructive font-medium">{state.error}</p>
          ) : null}

          <input type="hidden" name="workLogUuid" value={workLogUuid} />

          <div className="grid gap-1.5">
            <Label htmlFor="appeal-reason">Reason for appeal</Label>
            <textarea
              id="appeal-reason"
              name="reason"
              rows={4}
              placeholder="Explain why this work log needs review..."
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting..." : "Submit appeal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
