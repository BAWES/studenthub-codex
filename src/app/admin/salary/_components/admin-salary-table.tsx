"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryItem } from "../schemas";
import { createSalary, updateSalary, deleteSalary, listStaff } from "../actions";

type Props = {
  session: SessionUser;
  salaries: SalaryItem[];
  total: number;
  staff: { staff_id: number; staff_name: string }[];
};

export function AdminSalaryTable({ session, salaries, total, staff }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage salary records"
      metrics={[
        { label: "Total records", value: total, note: "Salary records in the system" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add salary record</h3>
          <CreateSalaryForm staff={staff} onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Salary records"
        description="All salary records. Click a row to edit or delete."
        searchable={true}
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "staff_name",
            label: "Staff",
            render: (row) =>
              editingId === row.staff_salary_uuid ? (
                <EditSalaryForm
                  row={row}
                  staff={staff}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.staff_salary_uuid)}
                >
                  {row.staff_name ?? `Staff #${row.staff_id}`}
                </button>
              ),
          },
          {
            key: "salary",
            label: "Salary",
            render: (row) => {
              if (row.salary === null || row.salary === undefined) return "—";
              return (
                <span className="text-sm font-medium text-foreground">
                  {Number(row.salary).toLocaleString()} {row.salary_currency ?? "KWD"}
                </span>
              );
            },
          },
          {
            key: "salary_date",
            label: "Date",
            render: (row) => {
              if (!row.salary_date) return "—";
              return <span className="text-sm text-foreground">{new Date(row.salary_date).toLocaleDateString()}</span>;
            },
          },
          {
            key: "comment",
            label: "Comment",
            render: (row) => (
              <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
                {row.comment ?? "—"}
              </span>
            ),
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return <span className="text-sm text-foreground">{new Date(row.updated_at).toLocaleDateString()}</span>;
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.staff_salary_uuid ? (
                <Button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete salary record for "${row.staff_name ?? "staff #" + row.staff_id}"?`)) {
                      const result = await deleteSalary(row.staff_salary_uuid);
                      if (result.operation === "error") {
                        alert(result.message);
                      }
                      router.refresh();
                    }
                  }}
                >
                  Delete
                </Button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateSalaryForm({
  staff,
  onSuccess,
}: {
  staff: { staff_id: number; staff_name: string }[];
  onSuccess: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createSalary(null, formData);
      if (result.operation === "success") {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="staffId">Staff</Label>
        <select
          id="staffId"
          name="staffId"
          required
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-[180px]"
        >
          <option value="">Select staff...</option>
          {staff.map((s) => (
            <option key={s.staff_id} value={s.staff_id}>{s.staff_name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salary">Salary</Label>
        <Input
          id="salary"
          name="salary"
          type="number"
          step="0.001"
          min="0"
          required
          placeholder="e.g. 500.000"
          className="w-32"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salaryCurrency">Currency</Label>
        <select
          id="salaryCurrency"
          name="salaryCurrency"
          defaultValue="KWD"
          className="flex h-9 w-20 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="KWD">KWD</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salaryDate">Date</Label>
        <Input
          id="salaryDate"
          name="salaryDate"
          type="date"
          required
          className="w-36"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="comment">Comment</Label>
        <Input
          id="comment"
          name="comment"
          maxLength={255}
          placeholder="Optional note"
          className="w-44"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditSalaryForm({
  row,
  staff,
  onDone,
  onCancel,
}: {
  row: SalaryItem;
  staff: { staff_id: number; staff_name: string }[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      formData.set("salaryUuid", row.staff_salary_uuid);
      const result = await updateSalary(null, formData);
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  const salaryDate = row.salary_date
    ? new Date(row.salary_date).toISOString().split("T")[0]
    : "";

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="salary"
        type="number"
        step="0.001"
        min="0"
        required
        defaultValue={row.salary ?? ""}
        className="w-24 h-8"
      />
      <select
        name="salaryCurrency"
        defaultValue={row.salary_currency ?? "KWD"}
        className="flex h-8 w-16 rounded border border-input bg-transparent px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="KWD">KWD</option>
        <option value="USD">USD</option>
      </select>
      <Input
        name="salaryDate"
        type="date"
        required
        defaultValue={salaryDate}
        className="w-32 h-8"
      />
      <Input
        name="comment"
        maxLength={255}
        defaultValue={row.comment ?? ""}
        placeholder="Comment"
        className="w-36 h-8"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
