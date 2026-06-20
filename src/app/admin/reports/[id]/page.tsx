import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getReport } from "./actions";
import { formatDate } from "@/modules/workspace/format";
import type {
  RecruiterStaffReport,
  GetRecruiterReportResult,
} from "@/modules/admin/reports/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Inline helpers
// ---------------------------------------------------------------------------

function statusLabel(status: number): string {
  switch (status) {
    case 1:
      return "Accepted";
    case 2:
      return "Rejected";
    default:
      return `Status ${status}`;
  }
}

function numberCell(value: number): string {
  return value != null ? String(value) : "—";
}

// ---------------------------------------------------------------------------
// Detail page
// ---------------------------------------------------------------------------

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const { type } = await searchParams;

  if (!type) {
    notFound();
  }

  const report = await getReport({ id, type });

  if (!report) {
    notFound();
  }

  const metricValue =
    report.type === "recruiter-daily"
      ? numberCell((report.data as GetRecruiterReportResult).total)
      : "—";

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Reports"
        title={report.label}
        metrics={[
          { label: "Type", value: report.type, note: "" },
          { label: "Staff", value: metricValue, note: "" },
        ]}
      >
        {/* Report metadata */}
        <DetailSection
          title="Report Details"
          facts={[
            { label: "Report ID", value: report.id },
            { label: "Type", value: report.type },
            { label: "Label", value: report.label },
            {
              label: "Generated",
              value: report.generatedAt
                ? formatDate(new Date(report.generatedAt))
                : "—",
            },
          ]}
        />

        {/* Recruiter daily report — staff table */}
        {report.type === "recruiter-daily" && (
          <RecruiterDailySection data={report.data as GetRecruiterReportResult} />
        )}

        {/* Invitation summary — status breakdown */}
        {report.type === "invitation-summary" && (
          <InvitationSummarySection
            data={
              report.data as {
                date: string;
                summary: Array<{ status: number; count: number }>;
              }
            }
          />
        )}

        {/* Back link */}
        <section className="flex gap-2 p-4">
          <Link href={"/admin/reports" as Route}>
            <Button variant="outline">Back to Reports</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Recruiter daily — staff activity table
// ---------------------------------------------------------------------------

async function RecruiterDailySection({
  data,
}: {
  data: GetRecruiterReportResult;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Recruiter Activity — {data.date}
        </CardTitle>
      </CardHeader>
      <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead className="text-right">Assigned</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Notes</TableHead>
              <TableHead className="text-right">Stories</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Suggestions</TableHead>
              <TableHead className="text-right">Invitations</TableHead>
              <TableHead className="text-right">Accepted</TableHead>
              <TableHead className="text-right">Rejected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.reports.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-medium">{r.staffName}</div>
                  <div className="text-muted-foreground">{r.staffEmail}</div>
                </TableCell>
                <TableCell className="text-right">{numberCell(r.totalAssigned)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalRequests)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalNotes)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalStories)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalCompletedStories)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalSuggestions)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalInvitations)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalAcceptedInvitations)}</TableCell>
                <TableCell className="text-right">{numberCell(r.totalRejectedInvitations)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs mt-3 text-muted-foreground">
        Total staff: {data.total}
      </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Invitation summary — status breakdown table
// ---------------------------------------------------------------------------

async function InvitationSummarySection({
  data,
}: {
  data: { date: string; summary: Array<{ status: number; count: number }> };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Invitation Summary — {data.date}
        </CardTitle>
      </CardHeader>
      <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.summary.map((s, i) => (
              <TableRow key={i}>
                <TableCell>
                  {statusLabel(s.status)}
                </TableCell>
                <TableCell className="text-right">
                  {numberCell(s.count)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </CardContent>
    </Card>
  );
}
