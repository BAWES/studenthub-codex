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
};

export function AdminSalaryTable({ session, salaries }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage salary records — track staff salaries across the organization."
      metrics={[
        {
          label: "Total salary records",
          value: salaries.length,
          note: "Entries in the system",
        },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 border-l-4 border-l-[var(--sh-coral)]">
          <h3
            className="text-sm font-semibold mb-3 text-[var(--ink)]"
          >
            Add salary record
          </h3>
          <CreateSalaryForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Salary records"
        description="All salary entries. Click a row to edit or delete."
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "staff_name",
            label: "Staff name",
            render: (row) =>
              editingId === row.staff_salary_uuid ? (
                <EditSalaryForm
                  row={row}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-[var(--sh-coral)]"
                  onClick={() => setEditingId(row.staff_salary_uuid)}
                >
                  {row.staff_name || "—"}
                </button>
              ),
          },
          {
            key: "salary",
            label: "Salary",
            render: (row) => {
              if (row.salary == null) return "—";
              const curr = row.salary_currency || "KWD";
              return `${Number(row.salary).toFixed(3)} ${curr}`;
            },
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
              <span className="text-sm text-[var(--muted)]">
                {row.comment || "\u2014"}
              </span>
            ),
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.staff_salary_uuid ? (
                deletingId === row.staff_salary_uuid ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-xs text-[var(--muted)]">Delete?</span>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={async () => {
                        setDeletingId(null);
                        const result = await deleteSalary(row.staff_salary_uuid);
                        if (result.operation === "error") {
                          setDeletingId("__error__");
                        }
                        router.refresh();
                      }}
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded text-[var(--muted)] hover:text-[var(--ink)]"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-[var(--sh-error)]"
                    onClick={() => setDeletingId(row.staff_salary_uuid)}
                  >
                    Delete
                  </button>
                )
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateSalaryForm({ onSuccess }: { onSuccess: () => void }) {
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
  const [staffOptions, setStaffOptions] = useState<
    { staff_id: number; staff_name: string }[]
  >([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Load staff list on focus
  const loadStaff = async () => {
    if (staffOptions.length > 0) return;
    setLoadingStaff(true);
    try {
      const staff = await listStaff();
      setStaffOptions(staff);
    } catch {
      // silently handle
    } finally {
      setLoadingStaff(false);
    }
  };

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 100)
      }
    >
      <div className="grid gap-1">
        <label
          className="text-xs font-medium text-[var(--muted)]"
        >
          Staff
        </label>
        <select
          name="staffId"
          required
          onFocus={loadStaff}
          className="h-9 rounded-lg px-3 text-sm border min-w-[160px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        >
          <option value="">Select staff...</option>
          {loadingStaff && <option disabled>Loading...</option>}
          {staffOptions.map((s) => (
            <option key={s.staff_id} value={s.staff_id}>
              {s.staff_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label
          className="text-xs font-medium text-[var(--muted)]"
        >
          Salary amount
        </label>
        <input
          name="salary"
          type="number"
          step="0.001"
          required
          placeholder="e.g. 750.000"
          className="h-9 rounded-lg px-3 text-sm border w-[120px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        />
      </div>
      <div className="grid gap-1">
        <label
          className="text-xs font-medium text-[var(--muted)]"
        >
          Currency
        </label>
        <input
          name="salaryCurrency"
          defaultValue="KWD"
          maxLength={3}
          className="h-9 rounded-lg px-3 text-sm border w-[70px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        />
      </div>
      <div className="grid gap-1">
        <label
          className="text-xs font-medium text-[var(--muted)]"
        >
          Date
        </label>
        <input
          name="salaryDate"
          type="date"
          required
          className="h-9 rounded-lg px-3 text-sm border bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        />
      </div>
      <div className="grid gap-1">
        <label
          className="text-xs font-medium text-[var(--muted)]"
        >
          Comment
        </label>
        <input
          name="comment"
          maxLength={255}
          placeholder="Optional note"
          className="h-9 rounded-lg px-3 text-sm border w-[160px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-[var(--sh-coral)] text-white hover:bg-[var(--sh-coral-hover)]"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-[var(--sh-error)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function EditSalaryForm({
  row,
  onDone,
  onCancel,
}: {
  row: SalaryItem;
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

  const formatDate = (d: Date | string | null | undefined): string => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <input type="hidden" name="salaryUuid" value={row.staff_salary_uuid} />
      <input
        name="salary"
        type="number"
        step="0.001"
        defaultValue={row.salary ?? ""}
        required
        className="h-8 rounded px-2 text-sm border w-[100px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      />
      <input
        name="salaryCurrency"
        defaultValue={row.salary_currency || "KWD"}
        maxLength={3}
        className="h-8 rounded px-2 text-sm border w-[60px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      />
      <input
        name="salaryDate"
        type="date"
        defaultValue={formatDate(row.salary_date)}
        required
        className="h-8 rounded px-2 text-sm border bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      />
      <input
        name="comment"
        defaultValue={row.comment ?? ""}
        maxLength={255}
        placeholder="Comment"
        className="h-8 rounded px-2 text-sm border w-[120px] bg-[var(--surface)] border-[var(--border)] text-[var(--ink)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold bg-[var(--sh-coral)] text-white hover:bg-[var(--sh-coral-hover)]"
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs text-[var(--sh-error)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
