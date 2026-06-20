"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryItem } from "@/modules/admin/salary/schemas";

type Props = {
  session: SessionUser;
  salaries: SalaryItem[];
};

export function AdminSalaryTable({ session, salaries }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Salaries — staff salary records."
      metrics={[
        { label: "Total salaries", value: salaries.length, note: "Salary records in the system" },
      ]}
    >
      <DataTable
        title="Salaries"
        description="All salary records. Click a row to view details."
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "staff_name",
            label: "Staff Name",
            render: (row) => (
              <span className="text-sm font-medium" style={{ color: "var(--sh-primary)" }}>
                {row.staff_name ?? "—"}
              </span>
            ),
          },
          {
            key: "salary",
            label: "Salary",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.salary != null ? `${row.salary.toLocaleString()} ${row.salary_currency ?? ""}` : "—"}
              </span>
            ),
          },
          {
            key: "salary_date",
            label: "Date",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.salary_date ? new Date(row.salary_date).toLocaleDateString() : "—"}
              </span>
            ),
          },
          {
            key: "comment",
            label: "Comment",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.comment ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
