"use client";

import { useState } from "react";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { ReportTypeItem } from "../schemas";
import { generateReport } from "../actions";

type Props = {
  session: SessionUser;
  reportTypes: ReportTypeItem[];
};

type ReportData =
  | { kind: "recruiter-daily"; date: string; reports: Array<Record<string, unknown>>; total: number }
  | { kind: "invitation-summary"; date: string; summary: Array<{ status: number; count: number }> }
  | { kind: "unknown"; raw: unknown };

export function AdminReportsPageClient({ session, reportTypes }: Props) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(type: string) {
    setGenerating(type);
    setError(null);
    setReportData(null);

    try {
      const result = await generateReport({ type });
      if (result.operation === "success" && result.data) {
        if (type === "recruiter-daily") {
          const d = result.data.data as { date: string; reports: Array<Record<string, unknown>>; total: number };
          setReportData({ kind: "recruiter-daily", date: d.date, reports: d.reports, total: d.total });
        } else if (type === "invitation-summary") {
          const d = result.data.data as { date: string; summary: Array<{ status: number; count: number }> };
          setReportData({ kind: "invitation-summary", date: d.date, summary: d.summary });
        } else {
          setReportData({ kind: "unknown", raw: result.data.data });
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Reports"
      metrics={[
        { label: "Available reports", value: reportTypes.length, note: "Report types you can generate" },
      ]}
    >
      {/* Report type cards */}
      <section className="grid gap-4 md:grid-cols-2 mb-8">
        {reportTypes.map((rt) => (
          <div
            key={rt.type}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <h3 className="text-sm font-semibold mb-1 text-foreground">
              {rt.label}
            </h3>
            <p className="text-xs mb-4 text-muted-foreground">
              {rt.description}
            </p>
            <button
              type="button"
              disabled={generating === rt.type}
              onClick={() => handleGenerate(rt.type)}
              className="h-9 rounded-lg px-4 text-sm font-semibold disabled:opacity-50 bg-primary text-primary-foreground"
            >
              {generating === rt.type ? "Generating..." : "Generate Report"}
            </button>
          </div>
        ))}
      </section>

      {/* Error */}
      {error ? (
        <div
          className="rounded-lg border p-4 mb-6 text-sm"
          style={{ borderColor: "var(--sh-error)", background: "#fef2f2", color: "var(--sh-error)" }}
        >
          {error}
        </div>
      ) : null}

      {/* Report results */}
      {reportData ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Report Results
          </h3>

          {reportData.kind === "recruiter-daily" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" >
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Staff</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Assigned</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Requests</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Notes</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Stories</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Invitations</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Accepted</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.reports.map((r, i) => (
                    <tr key={i} className="border-b" >
                      <td className="py-2 px-2 text-foreground">
                        <div className="font-medium">{r.staffName as string}</div>
                        <div className="text-muted-foreground">{r.staffEmail as string}</div>
                      </td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalAssigned as number}</td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalRequests as number}</td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalNotes as number}</td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalStories as number}</td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalInvitations as number}</td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalAcceptedInvitations as number}</td>
                      <td className="text-right py-2 px-2 text-foreground">{r.totalRejectedInvitations as number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs mt-3 text-muted-foreground">
                Total staff: {reportData.total}
              </p>
            </div>
          )}

          {reportData.kind === "invitation-summary" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" >
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.summary.map((s, i) => (
                    <tr key={i} className="border-b" >
                      <td className="py-2 px-2 text-foreground">
                        {s.status === 1 ? "Accepted" : s.status === 2 ? "Rejected" : `Status ${s.status}`}
                      </td>
                      <td className="text-right py-2 px-2 text-foreground">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportData.kind === "unknown" && (
            <p className="text-sm text-muted-foreground">
              Report generated. Raw data available in the response.
            </p>
          )}
        </section>
      ) : null}
    </WorkspaceShell>
  );
}
