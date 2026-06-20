"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
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
        {applications.map((app) => (
          <TableRow key={app.applicationId}>
            <TableCell>
              {app.candidateName ?? `Candidate #${app.candidateId}`}
            </TableCell>
            <TableCell>{app.jobTitle}</TableCell>
            <TableCell>
              <StatusBadge status={genericStatusVariant(app.status)} size="sm">
                {app.status}
              </StatusBadge>
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
          <div key={item.status} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize text-foreground">{item.status}</span>
              <span className="text-sm text-muted-foreground">
                {item.count} ({pct}%)
              </span>
            </div>
            <Progress value={pct} className="h-2" />
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
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            subtitle={metric.note}
          />
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
