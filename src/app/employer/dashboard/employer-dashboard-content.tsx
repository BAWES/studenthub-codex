"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
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
      <EmptyState
        variant="search"
        title="No applications yet"
        description="Post a job listing to start receiving applications."
      />
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
            <TableCell className="font-medium">
              {app.candidateName ?? `Candidate #${app.candidateId}`}
            </TableCell>
            <TableCell>{app.jobTitle}</TableCell>
            <TableCell>
              <StatusBadge status={app.status} />
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
      <EmptyState
        variant="search"
        title="No job listings yet"
        description="Create a job listing to track your hiring pipeline."
      />
    );
  }

  const total = breakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-3">
      {breakdown.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const isActive = item.status === "active";
        return (
          <div key={item.status} className="flex items-center gap-3">
            <span className="w-24 text-sm font-medium capitalize text-foreground">
              {item.status}
            </span>
            <div className="flex-1 rounded-full h-2.5 bg-muted">
              <div
                className={`rounded-full h-2.5 transition-[width] duration-300 ease-in-out ${
                  isActive ? "bg-[#eb6651]" : "bg-primary"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-20 text-right text-sm font-medium text-muted-foreground">
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
      {/* Metrics grid using shadcn MetricCard */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            note={metric.note}
            icon={metric.label === "Active Job Listings" ? Briefcase : undefined}
            accent="primary"
          />
        ))}
      </div>

      {/* Two-column layout */}
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
