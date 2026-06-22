"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import type { SalaryListItem } from "@/modules/salaries/schemas";
import { updateSalary, deleteSalary } from "@/modules/salaries/actions";

type Props = {
  record: SalaryListItem;
};

export function SalaryDetailView({ record }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSalary(record.staff_salary_uuid);
      router.push("/admin/salary");
      router.refresh();
    } catch {
      setDeleteError("Failed to delete salary record");
    } finally {
      setDeleting(false);
    }
  };

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{record.staff_name ?? "Salary Record"}</CardTitle>
              <CardDescription>
                Staff salary details — {record.staff_salary_uuid}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete salary record</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the salary record for{" "}
                      <strong>{record.staff_name ?? "this staff member"}</strong>?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {deleteError && (
                    <p className="text-sm text-destructive font-medium">{deleteError}</p>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={deleting} onClick={handleDelete}>
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <EditSalaryForm
              record={record}
              onSuccess={() => {
                setEditing(false);
                router.refresh();
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Staff Name" value={record.staff_name} />
              <Field label="Salary" value={record.salary != null ? String(record.salary) : null} />
              <Field label="Currency" value={record.salary_currency} />
              <Field label="Comment" value={record.comment} />
              <Field label="Salary Date" value={record.salary_date ? new Date(record.salary_date).toLocaleDateString() : null} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
          <CardDescription>Record creation and update history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Created" value={record.created_at ? new Date(record.created_at).toLocaleString() : null} />
            <Field label="Updated" value={record.updated_at ? new Date(record.updated_at).toLocaleString() : null} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/salary")}>
          Back to list
        </Button>
      </div>
    </div>
  );
}

function EditSalaryForm({
  record,
  onSuccess,
  onCancel,
}: {
  record: SalaryListItem;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const salary = formData.get("salary") as string;
      const salary_currency = formData.get("salary_currency") as string;
      const comment = formData.get("comment") as string;
      const salary_date = formData.get("salary_date") as string;

      try {
        await updateSalary({
          staff_salary_uuid: record.staff_salary_uuid,
          salary: salary ? parseFloat(salary) : null,
          salary_currency: salary_currency || "KWD",
          comment: comment || "",
          salary_date: salary_date ? new Date(salary_date) : undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to update salary" };
      }
    },
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Staff ID</Label>
          <Input
            name="staff_id"
            type="number"
            defaultValue={record.staff_id ?? ""}
            disabled
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">Staff: {record.staff_name ?? "—"}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Salary</Label>
          <Input
            name="salary"
            type="number"
            step="0.001"
            defaultValue={record.salary ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Currency</Label>
          <Input
            name="salary_currency"
            maxLength={3}
            defaultValue={record.salary_currency ?? "KWD"}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Input
            name="salary_date"
            type="date"
            defaultValue={record.salary_date ? record.salary_date.slice(0, 10) : ""}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Comment</Label>
          <Input
            name="comment"
            maxLength={255}
            defaultValue={record.comment ?? ""}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive font-medium">{state.error}</p>
      ) : null}
    </form>
  );
}
