"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import type { Route } from "next";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryListItem } from "@/modules/salaries/schemas";
import { createSalary, deleteSalary } from "@/modules/salaries/actions";

type Props = {
  session: SessionUser;
  records: SalaryListItem[];
};

export function AdminSalariesTable({ session, records }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Salaries — view staff salary records across the platform."
      metrics={[
        { label: "Total records", value: records.length, note: "Salary records" },
      ]}
    >
      <section className="mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add a salary record</h3>
          <CreateSalaryForm onSuccess={() => router.refresh()} />
        </Card>
      </section>

      <DataTable
        title="Salaries"
        description="All staff salary records. Click a row to view details."
        rows={records.map((r) => ({ ...r, id: r.staff_salary_uuid }))}
        rowHref={(row) => `/admin/salary/${row.staff_salary_uuid}` as Route}
        columns={[
          {
            key: "staff_name",
            label: "Staff Name",
            render: (row) => (
              <span className="text-sm font-medium">
                {row.staff_name ?? "(no name)"}
              </span>
            ),
          },
          {
            key: "salary",
            label: "Salary",
            render: (row) => (
              <span className="text-sm">
                {row.salary != null ? `${row.salary_currency ?? "KWD"} ${row.salary}` : "—"}
              </span>
            ),
          },
          {
            key: "salary_currency",
            label: "Currency",
            render: (row) => (
              <span className="text-sm">{row.salary_currency ?? "—"}</span>
            ),
          },
          {
            key: "salary_date",
            label: "Date",
            render: (row) => {
              if (!row.salary_date) return "—";
              return new Date(row.salary_date).toLocaleDateString();
            },
          },
          {
            key: "comment",
            label: "Comment",
            render: (row) => (
              <span className="text-sm truncate max-w-[250px] inline-block align-middle">
                {row.comment ?? "—"}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <DeleteSalaryButton
                salaryUuid={row.staff_salary_uuid}
                staffName={row.staff_name || "Unnamed"}
                onDelete={async () => {
                  await deleteSalary(row.staff_salary_uuid);
                  router.refresh();
                }}
              />
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function DeleteSalaryButton({
  salaryUuid,
  staffName,
  onDelete,
}: {
  salaryUuid: string;
  staffName: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete salary record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete salary record for <strong>{staffName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                await onDelete();
                setOpen(false);
              } catch {
                setError("Failed to delete salary record");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CreateSalaryForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const staff_id = formData.get("staff_id") as string;
      const salary = formData.get("salary") as string;
      const salary_currency = formData.get("salary_currency") as string;
      const comment = formData.get("comment") as string;
      const salary_date = formData.get("salary_date") as string;

      try {
        await createSalary({
          staff_id: staff_id ? parseInt(staff_id) : null,
          salary: salary ? parseFloat(salary) : null,
          salary_currency: salary_currency || "KWD",
          comment: comment || "",
          salary_date: salary_date ? new Date(salary_date) : undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create salary record" };
      }
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Staff ID</label>
        <Input name="staff_id" type="number" placeholder="e.g. 1" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Salary</label>
        <Input name="salary" type="number" step="0.001" placeholder="e.g. 500" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Currency</label>
        <Input name="salary_currency" maxLength={3} placeholder="KWD" defaultValue="KWD" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Date</label>
        <Input name="salary_date" type="date" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Comment</label>
        <Input name="comment" maxLength={255} placeholder="Optional comment" />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="col-span-2 md:col-span-5 justify-self-start"
      >
        {pending ? "Adding..." : "Add Salary"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive col-span-full">{state.error}</p>
      ) : null}
    </form>
  );
}
