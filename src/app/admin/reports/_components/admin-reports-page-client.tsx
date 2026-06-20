"use client";

import { useState } from "react";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { ReportTypeItem } from "../schemas";
import { generateReport } from "../actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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
              <CardTitle>{rt.label}</CardTitle>
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
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Report results */}
      {reportData ? (
        <Card>
          <CardHeader>
            <CardTitle>Report Results</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.kind === "recruiter-daily" && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead className="text-right">Assigned</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Notes</TableHead>
                      <TableHead className="text-right">Stories</TableHead>
                      <TableHead className="text-right">Invitations</TableHead>
                      <TableHead className="text-right">Accepted</TableHead>
                      <TableHead className="text-right">Rejected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.reports.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-medium">{r.staffName as string}</div>
                          <div className="text-muted-foreground">{r.staffEmail as string}</div>
                        </TableCell>
                        <TableCell className="text-right">{r.totalAssigned as number}</TableCell>
                        <TableCell className="text-right">{r.totalRequests as number}</TableCell>
                        <TableCell className="text-right">{r.totalNotes as number}</TableCell>
                        <TableCell className="text-right">{r.totalStories as number}</TableCell>
                        <TableCell className="text-right">{r.totalInvitations as number}</TableCell>
                        <TableCell className="text-right">{r.totalAcceptedInvitations as number}</TableCell>
                        <TableCell className="text-right">{r.totalRejectedInvitations as number}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs mt-3 text-muted-foreground">
                  Total staff: {reportData.total}
                </p>
              </div>
            )}

            {reportData.kind === "invitation-summary" && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.summary.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {s.status === 1 ? "Accepted" : s.status === 2 ? "Rejected" : `Status ${s.status}`}
                        </TableCell>
                        <TableCell className="text-right">{s.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
