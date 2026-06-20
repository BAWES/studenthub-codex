"use client";

import { useState } from "react";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { ReportTypeItem } from "../schemas";
import { generateReport } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Card key={rt.type}>
            <CardHeader>
              <CardTitle className="text-sm">{rt.label}</CardTitle>
              <CardDescription>{rt.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled={generating === rt.type}
                onClick={() => handleGenerate(rt.type)}
              >
                {generating === rt.type ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Error */}
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Report results */}
      {reportData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Report Results</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.kind === "recruiter-daily" && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
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
                      <tr key={i} className="border-b border-border">
                        <td className="py-2 px-2 text-card-foreground">
                          <div className="font-medium">{r.staffName as string}</div>
                          <div className="text-muted-foreground">{r.staffEmail as string}</div>
                        </td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalAssigned as number}</td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalRequests as number}</td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalNotes as number}</td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalStories as number}</td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalInvitations as number}</td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalAcceptedInvitations as number}</td>
                        <td className="text-right py-2 px-2 text-card-foreground">{r.totalRejectedInvitations as number}</td>
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
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.summary.map((s, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-2 px-2 text-card-foreground">
                          {s.status === 1 ? "Accepted" : s.status === 2 ? "Rejected" : `Status ${s.status}`}
                        </td>
                        <td className="text-right py-2 px-2 text-card-foreground">{s.count}</td>
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
          </CardContent>
        </Card>
      ) : null}
    </WorkspaceShell>
  );
}
