"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryListItem } from "@/modules/salaries/schemas";

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
        ]}
      />
    </WorkspaceShell>
  );
}
