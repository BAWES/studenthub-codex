"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import type { Route } from "next";
import type { SessionUser } from "@/modules/auth/types";
import type { AdminJobItem } from "@/modules/admin/jobs/schemas";

type Props = {
  session: SessionUser;
  jobs: AdminJobItem[];
};

export function AdminJobsTable({ session, jobs }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage job postings — view and manage all job listings across the platform."
      metrics={[
        { label: "Total jobs", value: jobs.length, note: "Active and inactive" },
      ]}
    >
      <DataTable
        title="Jobs"
        description="All job postings. Click a row to view details."
        rows={jobs.map((j) => ({ ...j, id: j.job_uuid }))}
        rowHref={(row) => `/admin/job/${row.job_uuid}` as Route}
        columns={[
          {
            key: "position",
            label: "Position",
            render: (row) => (
              <span className="text-sm font-medium">{row.position}</span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) =>
              row.status ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              ),
          },
          {
            key: "hours_per_day",
            label: "Hours/day",
            render: (row) =>
              row.hours_per_day != null ? `${row.hours_per_day}h` : "—",
          },
          {
            key: "compensation_type",
            label: "Compensation",
            render: (row) =>
              row.compensation_type
                ? `${row.compensation_type}${row.compensation_amount ? ` (${row.compensation_amount})` : ""}`
                : "—",
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => {
              if (!row.created_at) return "—";
              return new Date(row.created_at).toLocaleDateString();
            },
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => {
              if (!row.updated_at) return "—";
              return new Date(row.updated_at).toLocaleDateString();
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
