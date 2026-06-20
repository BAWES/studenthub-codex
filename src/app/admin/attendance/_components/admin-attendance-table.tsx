"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import { StatusBadge } from "@/modules/workspace/StatusBadge";
import type { SessionUser } from "@/modules/auth/types";
import type { AttendanceItem } from "@/modules/attendance/schemas";
import { createAdminAttendance } from "../actions";

type Props = {
  session: SessionUser;
  attendance: AttendanceItem[];
  employees: { uuid: string; name: string }[];
};

function statusVariant(status: number): "success" | "warning" | "error" | "info" | "neutral" {
  if (status === 10) return "success";
  if (status === 5) return "warning";
  if (status === 0) return "error";
  return "neutral";
}

function statusLabel(status: number): string {
  if (status === 10) return "Present";
  if (status === 5) return "Late";
  if (status === 0) return "Absent";
  return `Status ${status}`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function AdminAttendanceTable({ session, attendance, employees }: Props) {
  const router = useRouter();
  const [employeeFilter, setEmployeeFilter] = useState("");

  const filtered = employeeFilter
    ? attendance.filter((a) => a.employee_uuid === employeeFilter)
    : attendance;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin HR"
      title="Manage attendance records — clock-in/out tracking for employees."
      metrics={[
        { label: "Total records", value: attendance.length, note: "Attendance entries" },
        { label: "Employees", value: employees.length, note: "Active employees" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Record attendance</h3>
          <CreateAttendanceForm employees={employees} onSuccess={() => router.refresh()} />
        </div>
      </section>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs font-medium text-muted-foreground">Filter by employee:</label>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="h-9 rounded-lg px-3 text-sm border max-w-xs bg-card border-border text-foreground"
        >
          <option value="">All employees</option>
          {employees.map((e) => (
            <option key={e.uuid} value={e.uuid}>{e.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        title="Attendance records"
        description="All attendance entries, most recent first."
        rows={filtered.map((a) => ({ ...a, id: a.attendance_uuid }))}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (row) => <span className="text-sm font-medium">{row.date}</span>,
          },
          {
            key: "employee",
            label: "Employee",
            render: (row) => {
              const emp = employees.find((e) => e.uuid === row.employee_uuid);
              return <span className="text-sm">{emp?.name ?? row.employee_uuid ?? "—"}</span>;
            },
          },
          {
            key: "clock_in",
            label: "Clock In",
            render: (row) => <span className="text-sm">{formatTime(row.clock_in)}</span>,
          },
          {
            key: "clock_out",
            label: "Clock Out",
            render: (row) => <span className="text-sm">{formatTime(row.clock_out)}</span>,
          },
          {
            key: "hours",
            label: "Hours",
            render: (row) => (
              <span className="text-sm">{row.total_hours != null ? `${row.total_hours.toFixed(1)}h` : "—"}</span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusBadge variant={statusVariant(row.status)} size="sm" label={statusLabel(row.status)} />
            ),
          },
          {
            key: "note",
            label: "Note",
            render: (row) => <span className="text-sm text-gray-500">{row.note ?? "—"}</span>,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateAttendanceForm({
  employees,
  onSuccess,
}: {
  employees: { uuid: string; name: string }[];
  onSuccess: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      try {
        const result = await createAdminAttendance({
          employee_uuid: formData.get("employee_uuid") as string,
          date: formData.get("date") as string,
          clock_in: (formData.get("clock_in") as string) || undefined,
          clock_out: (formData.get("clock_out") as string) || undefined,
          total_hours: formData.get("total_hours") ? Number(formData.get("total_hours")) : undefined,
          status: 10,
          note: (formData.get("note") as string) || undefined,
        });
        if (result.attendance_uuid) {
          onSuccess();
          return { error: undefined };
        }
        return { error: "Failed to create attendance record" };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Unknown error" };
      }
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
          <label className="text-xs font-medium text-muted-foreground">Employee *</label>
          <select
            name="employee_uuid"
            required
            className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground w-full"
          >
            <option value="">— Select —</option>
            {employees.map((e) => (
              <option key={e.uuid} value={e.uuid}>{e.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Date *</label>
          <input
            name="date"
            type="date"
            required
            className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Clock In</label>
          <input
            name="clock_in"
            type="datetime-local"
            className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Clock Out</label>
          <input
            name="clock_out"
            type="datetime-local"
            className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Total hours</label>
          <input
            name="total_hours"
            type="number"
            min="0"
            step="0.1"
            placeholder="8.0"
            className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground w-full"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Note</label>
          <input
            name="note"
            maxLength={500}
            placeholder="Optional note"
            className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground w-full"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-lg px-5 text-sm font-semibold bg-primary text-primary-foreground"
          >
            {pending ? "Adding..." : "Record"}
          </button>
        </div>
      </div>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
