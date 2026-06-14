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
        <section style={{ display: "flex", gap: "0.5rem", padding: "1rem" }}>
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
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--ink)" }}
      >
        Recruiter Activity — {data.date}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              <th
                className="text-left py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Staff
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Assigned
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Requests
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Notes
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Stories
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Completed
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Suggestions
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Invitations
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Accepted
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Rejected
              </th>
            </tr>
          </thead>
          <tbody>
            {data.reports.map((r, i) => (
              <tr
                key={i}
                className="border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="py-2 px-2" style={{ color: "var(--ink)" }}>
                  <div className="font-medium">{r.staffName}</div>
                  <div style={{ color: "var(--muted)" }}>{r.staffEmail}</div>
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalAssigned)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalRequests)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalNotes)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalStories)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalCompletedStories)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalSuggestions)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalInvitations)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalAcceptedInvitations)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(r.totalRejectedInvitations)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
        Total staff: {data.total}
      </p>
    </section>
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
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--ink)" }}
      >
        Invitation Summary — {data.date}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              <th
                className="text-left py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Status
              </th>
              <th
                className="text-right py-2 px-2 font-medium"
                style={{ color: "var(--muted)" }}
              >
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {data.summary.map((s, i) => (
              <tr
                key={i}
                className="border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="py-2 px-2" style={{ color: "var(--ink)" }}>
                  {statusLabel(s.status)}
                </td>
                <td className="text-right py-2 px-2" style={{ color: "var(--ink)" }}>
                  {numberCell(s.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
