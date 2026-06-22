"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import type { SessionUser } from "@/modules/auth/types";

type ApplicationRow = Record<string, unknown> & {
  id: string;
  jobTitle: string;
  candidateName: string | null;
  status: string;
  createdAt: Date;
};

type Metrics = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

type Props = {
  session: SessionUser;
  applications: ApplicationRow[];
  total: number;
  metrics: Metrics;
};

export function EmployerApplicationsContent({ session, applications, total, metrics }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer"
      title="Applications"
      metrics={[
        { label: "Total Applications", value: total, note: "all time" },
        { label: "Pending Review", value: metrics.pending, note: "awaiting decision" },
        { label: "Accepted", value: metrics.accepted, note: "approved offers" },
        { label: "Rejected", value: metrics.rejected, note: "did not proceed" },
      ]}
    >
      <DataTablePage
        title="All Applications"
        description="Review and manage candidate applications across all your job listings."
        rows={applications.map((app) => ({
          ...app,
          id: app.id,
          createdAt: app.createdAt.toISOString().slice(0, 10),
        }))}
        searchable
        searchPlaceholder="Search by candidate name, job title..."
        columns={[
          {
            key: "jobTitle",
            label: "Job Title",
            render: (row) => <span className="font-medium">{String(row.jobTitle)}</span>,
          },
          {
            key: "candidateName",
            label: "Candidate",
            render: (row) =>
              row.candidateName ? (
                String(row.candidateName)
              ) : (
                <span className="text-muted-foreground">&mdash;</span>
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusBadge
                variant={genericStatusVariant(String(row.status ?? "unknown"))}
                label={String(row.status ?? "unknown")}
                size="sm"
              />
            ),
          },
          {
            key: "createdAt",
            label: "Date",
            render: (row) => String(row.createdAt),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
