"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SessionUser } from "@/modules/auth/types";
import type { EmployerDashboardMetric, RecentApplication, JobStatusBreakdown } from "./schemas";

type Props = {
  session: SessionUser;
  metrics: EmployerDashboardMetric[];
  recentApplications: RecentApplication[];
  jobStatusBreakdown: JobStatusBreakdown[];
  totalJobs: number;
  totalApplications: number;
};

function MetricCard({ label, value, note }: EmployerDashboardMetric) {
  return (
    <Card>
      <CardContent className="p-5">
        <CardDescription className="text-sm font-medium mb-1">{label}</CardDescription>
        <CardTitle className="text-3xl">{value.toLocaleString()}</CardTitle>
        {note && (
          <p className="text-xs text-muted-foreground mt-1">{note}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RecentApplicationsTable({ applications }: { applications: RecentApplication[] }) {
  if (applications.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No applications yet. Post a job listing to start receiving applications.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 font-medium text-muted-foreground">Candidate</th>
            <th className="py-3 pr-4 font-medium text-muted-foreground">Job</th>
            <th className="py-3 pr-4 font-medium text-muted-foreground">Status</th>
            <th className="py-3 font-medium text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.applicationId} className="border-b border-border">
              <td className="py-3 pr-4 text-foreground">
                {app.candidateName ?? `Candidate #${app.candidateId}`}
              </td>
              <td className="py-3 pr-4 text-foreground">{app.jobTitle}</td>
              <td className="py-3 pr-4">
                <StatusBadge variant={genericStatusVariant(app.status)} label={app.status} size="sm" />
              </td>
              <td className="py-3 text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBreakdownBar({ breakdown }: { breakdown: JobStatusBreakdown[] }) {
  if (breakdown.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No job listings yet.
      </p>
    );
  }

  const total = breakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-3">
      {breakdown.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.status} className="flex items-center gap-3">
            <span className="w-24 text-sm font-medium capitalize text-foreground">{item.status}</span>
            <div className="flex-1 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-all duration-[300ms]"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.status === "active" ? "#2e7d32" : "#eb6651",
                }}
              />
            </div>
            <span className="w-16 text-right text-sm font-medium text-muted-foreground">
              {item.count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function EmployerDashboardContent({
  session,
  metrics,
  recentApplications,
  jobStatusBreakdown,
  totalJobs,
  totalApplications,
}: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer"
      title="Dashboard"
      metrics={[
        { label: "Total Jobs", value: totalJobs, note: "all listings" },
        { label: "Total Applications", value: totalApplications, note: "across all jobs" },
        { label: "Active Jobs", value: metrics.find((m) => m.label === "Active Job Listings")?.value ?? 0, note: "currently accepting applications" },
      ]}
    >
      {/* Metrics grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Two-column layout for tables */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <CardDescription>Latest {recentApplications.length} applications</CardDescription>
          </div>
          <div className="px-5 pb-4">
            <RecentApplicationsTable applications={recentApplications} />
          </div>
        </div>

        {/* Job Status Breakdown */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <CardTitle className="text-lg">Job Status Breakdown</CardTitle>
            <CardDescription>{totalJobs} total job listings</CardDescription>
          </div>
          <div className="px-5 pb-4">
            <StatusBreakdownBar breakdown={jobStatusBreakdown} />
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
