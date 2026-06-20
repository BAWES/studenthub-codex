"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

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
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add salary record</h3>
          <CreateSalaryForm staff={staff} onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Salary records"
        description="All salary records. Click a row to edit or delete."
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
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
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
                <span className="text-sm font-medium">
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
              return <span className="text-sm">{new Date(row.salary_date).toLocaleDateString()}</span>;
            },
          },
          {
            key: "comment",
            label: "Comment",
            render: (row) => <span className="text-sm text-[var(--muted)] truncate max-w-[200px] inline-block">{row.comment ?? "—"}</span>,
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return <span className="text-sm">{new Date(row.updated_at).toLocaleDateString()}</span>;
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.staff_salary_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
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
                </button>
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
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Staff</label>
        <select
          name="staffId"
          required
          className="h-9 rounded-lg px-3 text-sm border min-w-[180px]"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        >
          <option value="">Select staff...</option>
          {staff.map((s) => (
            <option key={s.staff_id} value={s.staff_id}>{s.staff_name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Salary</label>
        <input
          name="salary"
          type="number"
          step="0.001"
          min="0"
          required
          placeholder="e.g. 500.000"
          className="h-9 rounded-lg px-3 text-sm border w-32"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Currency</label>
        <select
          name="salaryCurrency"
          defaultValue="KWD"
          className="h-9 rounded-lg px-3 text-sm border w-20"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        >
          <option value="KWD">KWD</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Date</label>
        <input
          name="salaryDate"
          type="date"
          required
          className="h-9 rounded-lg px-3 text-sm border w-36"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Comment</label>
        <input
          name="comment"
          maxLength={255}
          placeholder="Optional note"
          className="h-9 rounded-lg px-3 text-sm border w-44"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full" style={{ color: "var(--sh-error)" }}>{state.error}</p>
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
      <input
        name="salary"
        type="number"
        step="0.001"
        min="0"
        required
        defaultValue={row.salary ?? ""}
        className="h-8 rounded px-2 text-sm border w-24"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <select
        name="salaryCurrency"
        defaultValue={row.salary_currency ?? "KWD"}
        className="h-8 rounded px-2 text-sm border w-16"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      >
        <option value="KWD">KWD</option>
        <option value="USD">USD</option>
      </select>
      <input
        name="salaryDate"
        type="date"
        required
        defaultValue={salaryDate}
        className="h-8 rounded px-2 text-sm border w-32"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <input
        name="comment"
        maxLength={255}
        defaultValue={row.comment ?? ""}
        placeholder="Comment"
        className="h-8 rounded px-2 text-sm border w-36"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs"
        style={{ color: "var(--muted)" }}
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs w-full" style={{ color: "var(--sh-error)" }}>{state.error}</p>
      ) : null}
    </form>
  );
}
