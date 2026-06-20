"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import type { SessionUser } from "@/modules/auth/types";
import type { EmployerDashboardMetric, RecentApplication, JobStatusBreakdown } from "./schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/ui/metric-card";

type Props = {
  session: SessionUser;
  metrics: EmployerDashboardMetric[];
  recentApplications: RecentApplication[];
  jobStatusBreakdown: JobStatusBreakdown[];
  totalJobs: number;
  totalApplications: number;
};

function RecentApplicationsTable({ applications }: { applications: RecentApplication[] }) {
  if (applications.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No applications yet. Post a job listing to start receiving applications.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app, i) => (
          <TableRow key={app.applicationId} index={i}>
            <TableCell className="font-medium text-foreground">
              {app.candidateName ?? `Candidate #${app.candidateId}`}
            </TableCell>
            <TableCell className="text-foreground">{app.jobTitle}</TableCell>
            <TableCell>
              <StatusBadge variant={genericStatusVariant(app.status)} label={app.status} size="sm" />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(app.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
    <div className="space-y-4">
      {breakdown.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.status} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm font-medium capitalize text-foreground">
              {item.status}
            </span>
            <div className="flex-1">
              <Progress
                value={pct}
                className={item.status === "active" ? "[&>[data-slot=progress-indicator]]:bg-[var(--sh-success)]" : "[&>[data-slot=progress-indicator]]:bg-[#eb6651]"}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-sm font-medium text-muted-foreground">
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
          <MetricCard key={metric.label} label={metric.label} value={metric.value} note={metric.note} />
        ))}
      </div>

      {/* Two-column layout for tables */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest {recentApplications.length} applications</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentApplicationsTable applications={recentApplications} />
          </CardContent>
        </Card>

        {/* Job Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Breakdown</CardTitle>
            <CardDescription>{totalJobs} total job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBreakdownBar breakdown={jobStatusBreakdown} />
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
