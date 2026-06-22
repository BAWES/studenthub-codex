"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { Route } from "next";

import type { SessionUser } from "@/modules/auth/types";
import type { JobItem } from "../schemas";

type Props = {
  session: SessionUser;
  jobs: JobItem[];
};

export function AdminJobsTable({ session, jobs }: Props) {
  const statusLabel = (status: boolean | null) => {
    if (status === true) return "Active";
    if (status === false) return "Inactive";
    return "Unknown";
  };

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage jobs — oversee all job postings and their status."
      metrics={[
        { label: "Total jobs", value: jobs.length, note: "Jobs in the system" },
      ]}
    >
      <DataTable
        title="Jobs"
        description="All job postings. Click a row to view details."
        rows={jobs.map((j) => ({ ...j, id: j.job_uuid }))}
        rowHref={(row) => `/admin/job/${row.job_uuid}` as Route}
        columns={[
          {
            key: "job_uuid",
            label: "Job UUID",
            render: (row) => (
              <span className="font-mono text-xs">{row.job_uuid.slice(0, 12)}...</span>
            ),
          },
          {
            key: "position",
            label: "Position",
            render: (row) => row.position,
          },
          {
            key: "status",
            label: "Status",
            render: (row) => statusLabel(row.status),
          },
          {
            key: "hours_per_day",
            label: "Hours/Day",
            render: (row) =>
              row.hours_per_day != null ? String(row.hours_per_day) : "—",
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
