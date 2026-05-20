"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { transitionRequestStatusAction, assignStaffToRequestAction, updateRequestAction } from "./create-actions";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "started", label: "Started" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "finished_by_recruitment", label: "Finished" },
  { value: "re_work", label: "Re-work" }
];

interface RequestActionBarProps {
  requestUuid: string;
  currentStatus: string | null;
  currentStaffId?: number | null;
  currentTitle?: string | null;
  role: "admin" | "staff";
  basePath: string;
}

export function RequestActionBar({ requestUuid, currentStatus, currentStaffId, currentTitle, role, basePath }: RequestActionBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Actions</CardTitle>
        <CardDescription>Manage this request&rsquo;s status, assignment, and details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="requestOSActions">
          <form action={transitionRequestStatusAction} className="requestActionForm">
            <input name="request_uuid" type="hidden" value={requestUuid} />
            <input name="redirect_to" type="hidden" value={basePath} />
            <select name="to_status" defaultValue={currentStatus ?? ""}>
              <option value="" disabled>Change status...</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.value === currentStatus}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" size="sm">
              Update status
            </Button>
          </form>

          <form action={updateRequestAction} className="requestActionForm">
            <input name="request_uuid" type="hidden" value={requestUuid} />
            <input name="redirect_to" type="hidden" value={basePath} />
            <Input name="position_title" defaultValue={currentTitle ?? ""} placeholder="Update title..." />
            <Input name="number_of_employees" type="number" placeholder="Seats" />
            <Button type="submit" variant="outline" size="sm">
              Save
            </Button>
          </form>

          {role === "admin" ? (
            <form action={assignStaffToRequestAction} className="requestActionForm">
              <input name="request_uuid" type="hidden" value={requestUuid} />
              <Input name="staff_id" type="number" placeholder="Staff ID" defaultValue={currentStaffId ?? ""} />
              <Button type="submit" variant="outline" size="sm">
                Assign staff
              </Button>
            </form>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
