"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

/** Client component that bridges shadcn Select (which doesn't support native form
 *  submission) to a server action via a hidden input + form submit. */
function StatusSelect({
  name,
  options,
  currentValue,
}: {
  name: string;
  options: { value: string; label: string }[];
  currentValue: string;
}) {
  const [value, setValue] = useState(currentValue);

  return (
    <>
      <input name={name} type="hidden" value={value} />
      <Select value={value} onValueChange={(v) => setValue(v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Change status..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.value === currentValue}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function RequestActionBar({ requestUuid, currentStatus, currentStaffId, currentTitle, role, basePath }: RequestActionBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Actions</CardTitle>
        <CardDescription>Manage this request&rsquo;s status, assignment, and details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-3">
          <form action={transitionRequestStatusAction} className="flex items-end gap-2">
            <input name="request_uuid" type="hidden" value={requestUuid} />
            <input name="redirect_to" type="hidden" value={basePath} />
            <StatusSelect
              name="to_status"
              options={statusOptions}
              currentValue={currentStatus ?? ""}
            />
            <Button type="submit" variant="secondary" size="sm">
              Update status
            </Button>
          </form>

          <form action={updateRequestAction} className="flex items-end gap-2">
            <input name="request_uuid" type="hidden" value={requestUuid} />
            <input name="redirect_to" type="hidden" value={basePath} />
            <Input name="position_title" defaultValue={currentTitle ?? ""} placeholder="Update title..." />
            <Input name="number_of_employees" type="number" placeholder="Seats" />
            <Button type="submit" variant="outline" size="sm">
              Save
            </Button>
          </form>

          {role === "admin" ? (
            <form action={assignStaffToRequestAction} className="flex items-end gap-2">
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
