"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DepartmentRow } from "../schemas";
import { createDepartment, updateDepartment, deleteDepartment } from "../actions";

type Props = {
  session: SessionUser;
  departments: DepartmentRow[];
};

export function AdminDepartmentsTable({ session, departments }: Props) {
  const router = useRouter();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage departments — organize employees by department across the company."
      metrics={[
        { label: "Total departments", value: departments.length, note: "Departments in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-muted p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add department</h3>
          <CreateDepartmentForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Departments"
        description="All departments. Click a row to edit or delete."
        rows={departments.map((d) => ({ ...d, id: d.department_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "English name",
            render: (row) => (
              editingUuid === row.department_uuid ? (
                <EditDepartmentForm
                  row={row}
                  onDone={() => { setEditingUuid(null); router.refresh(); }}
                  onCancel={() => setEditingUuid(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingUuid(row.department_uuid)}
                >
                  {row.department_name_en}
                </button>
              )
            ),
          },
          {
            key: "name_ar",
            label: "Arabic name",
            render: (row) => row.department_name_ar ?? "—",
          },
          {
            key: "employees",
            label: "Employees",
            render: (row) => row.employee_count,
          },
          {
            key: "updated",
            label: "Updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingUuid !== row.department_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete "${row.department_name_en}"?`)) {
                      const result = await deleteDepartment({ departmentUuid: row.department_uuid });
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

function CreateDepartmentForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("departmentNameEn") as string;
      const nameAr = formData.get("departmentNameAr") as string;
      const result = await createDepartment({ departmentNameEn: nameEn, departmentNameAr: nameAr || undefined });
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
        <label className="text-xs font-medium text-muted-foreground">English name</label>
        <input
          name="departmentNameEn"
          required
          maxLength={255}
          placeholder="e.g. Information Technology"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground"        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Arabic name</label>
        <input
          name="departmentNameAr"
          maxLength={255}
          placeholder="تقنية المعلومات"
          className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground"        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditDepartmentForm({
  row,
  onDone,
  onCancel,
}: {
  row: DepartmentRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const departmentNameEn = formData.get("departmentNameEn") as string;
      const departmentNameAr = formData.get("departmentNameAr") as string;
      const result = await updateDepartment({
        departmentUuid: row.department_uuid,
        departmentNameEn,
        departmentNameAr: departmentNameAr || undefined,
      });
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="departmentNameEn"
        defaultValue={row.department_name_en}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40 bg-muted border-border text-foreground"
      />
      <input
        name="departmentNameAr"
        defaultValue={row.department_name_ar ?? ""}
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40 bg-muted border-border text-foreground"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs text-muted-foreground"
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
