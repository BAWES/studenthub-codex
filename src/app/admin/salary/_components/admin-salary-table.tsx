"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryItem } from "@/modules/admin/salary/schemas";

type Props = {
  session: SessionUser;
  salaries: SalaryItem[];
  total: number;
};

export function AdminSalaryTable({ session, salaries, total }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Salaries — staff salary records."
      metrics={[
        { label: "Total salaries", value: total, note: "Salary records in the system" },
      ]}
    >
      <DataTable
        title="Salaries"
        description="All salary records. Click a row to view details."
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "salary",
            label: "Salary",
            render: (row) => (
              <span className="text-sm font-medium">
                {row.salary != null
                  ? `${row.salary.toLocaleString()} ${row.salary_currency ?? ""}`
                  : "—"}
              </span>
            ),
          },
          {
            key: "comment",
            label: "Comment",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.comment ?? "—"}
              </span>
            ),
          },
          {
            key: "salary_date",
            label: "Date",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.salary_date
                  ? new Date(row.salary_date).toLocaleDateString()
                  : "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
