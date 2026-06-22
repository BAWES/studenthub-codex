"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DegreeItem } from "../schemas";

type Props = {
  session: SessionUser;
  degrees: DegreeItem[];
};

export function AdminDegreesTable({ session, degrees }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage degrees — configure academic degree types used across the system."
      metrics={[
        {
          label: "Total degrees",
          value: degrees.length,
          note: "Degree types in the system",
        },
      ]}
    >
      <DataTable
        title="Degrees"
        description="All academic degrees. Click a row to view details."
        rows={degrees.map((d) => ({ ...d, id: d.degree_uuid }))}
        rowHref="/admin/degree/"
        columns={[
          {
            key: "degree_name_en",
            label: "Name (English)",
            render: (row) => (
              <span className="text-sm font-medium">{row.degree_name_en}</span>
            ),
          },
          {
            key: "degree_name_ar",
            label: "Name (Arabic)",
            render: (row) =>
              row.degree_name_ar ? (
                <span className="text-sm" dir="rtl">{row.degree_name_ar}</span>
              ) : (
                "—"
              ),
          },
          {
            key: "degree_sort_order",
            label: "Sort order",
            render: (row) =>
              row.degree_sort_order != null
                ? String(row.degree_sort_order)
                : "—",
          },
          {
            key: "degree_updated_at",
            label: "Last updated",
            render: (row) => {
              if (!row.degree_updated_at) return "—";
              return new Date(row.degree_updated_at).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
