"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import type { SessionUser } from "@/modules/auth/types";

type ApplicationRow = Record<string, unknown> & {
  id: string | number;
  candidateName: string | null;
  jobTitle: string;
  status: string;
  createdAt: string;
};

type AppMetrics = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

type Props = {
  session: SessionUser;
  rows: ApplicationRow[];
  total: number;
  metrics: AppMetrics;
};

function MetricCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-xl border bg-card p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span className="text-3xl font-bold" style={{ color: "var(--ink)" }}>
        {value.toLocaleString()}
      </span>
      {note && (
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {note}
        </span>
      )}
    </div>
  );
}

export function EmployerApplicationsContent({ session, rows, total, metrics }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer"
      title="Applications"
      metrics={[
        { label: "Total Applications", value: total, note: "all submitted applications" },
        { label: "Pending Review", value: metrics.pending, note: "awaiting decision" },
        { label: "Accepted", value: metrics.accepted, note: "approved candidates" },
        { label: "Rejected", value: metrics.rejected, note: "declined candidates" },
      ]}
    >
      {/* Metrics grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Applications" value={metrics.total} note="all submitted" />
        <MetricCard label="Pending Review" value={metrics.pending} note="awaiting decision" />
        <MetricCard
          label="Accepted"
          value={metrics.accepted}
          note="approved candidates"
        />
        <MetricCard
          label="Rejected"
          value={metrics.rejected}
          note="declined candidates"
        />
      </div>

      <DataTablePage
        title="Applications"
        description="Review and manage applications from candidates for your job listings."
        rows={rows}
        rowHref="/employer/applications/"
        searchable
        searchPlaceholder="Search by name, job title..."
        columns={[
          {
            key: "candidateName",
            label: "Candidate",
            render: (row) =>
              row.candidateName ? String(row.candidateName) : <span className="text-muted-foreground">—</span>,
          },
          {
            key: "jobTitle",
            label: "Job",
            render: (row) => <strong>{String(row.jobTitle)}</strong>,
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
