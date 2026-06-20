"use client";

import type { SessionUser } from "@/modules/auth/types";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SalaryItem } from "@/modules/admin/salary/schemas";

export function AdminSalaryTable({
  session,
  salaries,
  total,
}: {
  session: SessionUser;
  salaries: SalaryItem[];
  total: number;
}) {
  const columns = [
    { key: "salary", label: "Salary", render: (row: SalaryItem) =>
      row.salary != null
        ? `${Number(row.salary).toLocaleString()} ${row.salary_currency ?? ""}`
        : "\u2014" },
    { key: "comment", label: "Comment", render: (row: SalaryItem) => row.comment ?? "\u2014" },
    { key: "salary_date", label: "Date", render: (row: SalaryItem) =>
      row.salary_date ? new Date(row.salary_date).toLocaleDateString() : "\u2014" },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Salaries"
      metrics={[{ label: "Total salaries", value: total, note: "All records" }]}
    >
      <DataTable
        title="Salary Records"
        description={`${total} total salary records`}
        columns={columns}
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
      />
    </WorkspaceShell>
  );
}
