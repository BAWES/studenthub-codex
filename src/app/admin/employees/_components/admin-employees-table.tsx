"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import { StatusBadge } from "@/modules/workspace/StatusBadge";
import type { SessionUser } from "@/modules/auth/types";
import type { EmployeeRow } from "../schemas";
import { createAdminEmployee, deleteAdminEmployee } from "../actions";

type Props = {
  session: SessionUser;
  employees: EmployeeRow[];
  departments: { uuid: string; name: string }[];
  designations: { uuid: string; nameEn: string }[];
};

function statusVariant(status: number): "success" | "warning" | "error" | "info" | "neutral" {
  if (status === 10) return "success";
  if (status === 0) return "error";
  return "neutral";
}

function statusLabel(status: number): string {
  if (status === 10) return "Active";
  if (status === 0) return "Inactive";
  return `Status ${status}`;
}

export function AdminEmployeesTable({ session, employees, departments, designations }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin org"
      title="Manage employees — internal staff records, designations, and department assignments."
      metrics={[
        { label: "Total employees", value: employees.length, note: "Active employees in system" },
        { label: "Departments", value: departments.length, note: "Available departments" },
        { label: "Designations", value: designations.length, note: "Available job titles" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add employee</h3>
          <CreateEmployeeForm
            departments={departments}
            designations={designations}
            onSuccess={() => router.refresh()}
          />
        </div>
      </section>

      <DataTable
        title="Employees"
        description="All employee records. Active and inactive staff."
        rows={employees.map((e) => ({ ...e, id: e.employee_uuid }))}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.employee_name}
              </span>
            ),
          },
          {
            key: "email",
            label: "Email",
            render: (row) => <span className="text-sm">{row.employee_email}</span>,
          },
          {
            key: "phone",
            label: "Phone",
            render: (row) => <span className="text-sm">{row.employee_phone ?? "—"}</span>,
          },
          {
            key: "salary",
            label: "Salary",
            render: (row) => (
              <span className="text-sm">
                {row.employee_salary != null ? `${row.employee_salary.toLocaleString()} KWD` : "—"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusBadge
                variant={statusVariant(row.employee_status)}
                size="sm"
                label={statusLabel(row.employee_status)}
              />
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <button
                type="button"
                className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                onClick={async () => {
                  if (confirm(`Deactivate "${row.employee_name}"?`)) {
                    await deleteAdminEmployee(row.employee_uuid);
                    router.refresh();
                  }
                }}
              >
                Deactivate
              </button>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateEmployeeForm({
  departments,
  designations,
  onSuccess,
}: {
  departments: { uuid: string; name: string }[];
  designations: { uuid: string; nameEn: string }[];
  onSuccess: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createAdminEmployee({
        employeeName: formData.get("employeeName") as string,
        employeeEmail: formData.get("employeeEmail") as string,
        employeePhone: (formData.get("employeePhone") as string) || undefined,
        employeeSalary: formData.get("employeeSalary") ? Number(formData.get("employeeSalary")) : undefined,
        employeeStatus: 10,
        designationUuid: (formData.get("designationUuid") as string) || undefined,
        departmentUuid: (formData.get("departmentUuid") as string) || undefined,
      });
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
      onSubmit={() => setTimeout(() => formRef.current?.reset(), 100)}
      className="grid gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Name *</label>
          <input
            name="employeeName"
            required
            maxLength={255}
            placeholder="Full name"
            className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Email *</label>
          <input
            name="employeeEmail"
            type="email"
            required
            maxLength={255}
            placeholder="email@company.com"
            className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <input
            name="employeePhone"
            maxLength={45}
            placeholder="+965 9999 9999"
            className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Salary (KWD)</label>
          <input
            name="employeeSalary"
            type="number"
            min="0"
            step="0.001"
            placeholder="0.000"
            className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <select
            name="departmentUuid"
            className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border w-full"
          >
            <option value="">— None —</option>
            {departments.map((d) => (
              <option key={d.uuid} value={d.uuid}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Designation</label>
          <select
            name="designationUuid"
            className="h-9 rounded-lg px-3 text-sm border bg-background text-foreground border-border w-full"
          >
            <option value="">— None —</option>
            {designations.map((d) => (
              <option key={d.uuid} value={d.uuid}>{d.nameEn}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-lg px-5 text-sm font-semibold bg-primary text-primary-foreground"
          >
            {pending ? "Adding..." : "Add employee"}
          </button>
        </div>
      </div>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
