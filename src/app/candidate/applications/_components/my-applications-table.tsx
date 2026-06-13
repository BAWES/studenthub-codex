"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type ApplicationRow = {
  id: string | number;
  jobTitle: string;
  employerName: string;
  status: string;
  createdAt: string;
};

type Props = {
  session: SessionUser;
  rows: ApplicationRow[];
  total: number;
};

export function MyApplicationsTable({ session, rows, total }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="My Applications"
      metrics={[
        { label: "Total Applications", value: total, note: "all time" },
        { label: "Active", value: rows.filter((r) => r.status === "applied" || r.status === "reviewing" || r.status === "shortlisted").length, note: "in progress" },
      ]}
    >
      <DataTablePage
        title="My Applications"
        description="Track your job applications and their status."
        rows={rows}
        searchable
        searchPlaceholder="Search by job title, employer..."
        columns={[
          { key: "jobTitle", label: "Position", render: (row) => <strong>{String(row.jobTitle)}</strong> },
          { key: "employerName", label: "Employer", render: (row) => String(row.employerName) },
          { key: "status", label: "Status", render: (row) => (
            <StatusBadge variant={genericStatusVariant(String(row.status))} label={String(row.status)} size="sm" />
          )},
          { key: "createdAt", label: "Applied", render: (row) => String(row.createdAt) },
        ]}
      />
    </WorkspaceShell>
  );
}
