"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { MetricCard } from "@/components/ui/metric-card";
import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { SessionUser } from "@/modules/auth/types";

type ApplicationRow = Record<string, unknown> & {
  id: number;
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
  metrics: Metrics;
};

export function EmployerApplicationsContent({ session, applications, metrics }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer"
      title="Applications"
      metrics={[]}
    >
      {/* Metrics grid — shadcn MetricCard */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total"
          value={metrics.total}
          note="all applications"
          icon={Users}
          accent="info"
        />
        <MetricCard
          label="Pending"
          value={metrics.pending}
          note="awaiting review"
          icon={Clock}
          accent="warning"
        />
        <MetricCard
          label="Accepted"
          value={metrics.accepted}
          note="approved offers"
          icon={CheckCircle2}
          accent="success"
        />
        <MetricCard
          label="Rejected"
          value={metrics.rejected}
          note="did not proceed"
          icon={XCircle}
          accent="error"
        />
      </div>

      {/* DataTable */}
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
            render: (row) => row.candidateName ? String(row.candidateName) : <span className="text-muted-foreground">—</span>,
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
