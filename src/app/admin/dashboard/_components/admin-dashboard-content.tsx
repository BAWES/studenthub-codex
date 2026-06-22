"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { DataTable } from "@/modules/workspace/DataTable";
import type { SessionUser } from "@/modules/auth/types";
import type { DashboardData } from "../schemas";

type Props = {
  session: SessionUser;
  data: DashboardData;
};

export function AdminDashboardContent({ session, data }: Props) {
  const { metrics, statusMix, recentCandidates, recentCompanies, recentRequests, recentTransfers, prMergeMetrics } = data;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin dashboard"
      title="Platform overview — aggregate metrics and recent activity."
      metrics={[
        { label: metrics[0]?.label ?? "Candidates", value: metrics[0]?.value ?? 0, note: metrics[0]?.note ?? "" },
        { label: metrics[1]?.label ?? "Companies", value: metrics[1]?.value ?? 0, note: metrics[1]?.note ?? "" },
        { label: metrics[2]?.label ?? "Requests", value: metrics[2]?.value ?? 0, note: metrics[2]?.note ?? "" },
        { label: metrics[3]?.label ?? "Transfers", value: metrics[3]?.value ?? 0, note: metrics[3]?.note ?? "" },
      ]}
    >
      {/* ── Request Pipeline Status ── */}
      <section className="mb-6">
        <div
          className="rounded-lg border border-border bg-card p-5"
        >
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pipeline
          </div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Request Pipeline
          </h2>

          {statusMix.length > 0 ? (
            <div className="space-y-3">
              {/* Visual bar */}
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-border">
                {statusMix.map((status) => {
                  const total = statusMix.reduce((s, a) => s + a.value, 0);
                  const pct = total > 0 ? (status.value / total) * 100 : 0;
                  const colors = ["#eb6651", "#f59e0b", "#22c55e", "#6366f1", "#8b5cf6", "#06b6d4"];
                  return (
                    <div
                      key={status.label}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[statusMix.indexOf(status) % colors.length],
                        minWidth: pct > 0 ? "4px" : "0",
                      }}
                      title={`${status.label}: ${status.value}`}
                    />
                  );
                })}
              </div>

              {/* Status items grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {statusMix.map((status) => (
                  <div
                    key={status.label}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
                    style={{ background: "var(--hover)" }}
                  >
                    <span className="text-foreground">{status.label}</span>
                    <strong style={{ color: "var(--accent)" }}>{status.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No requests in pipeline</p>
          )}
        </div>
      </section>

      {/* ── PR Merge Time-to-Merge Metrics ── */}
      {prMergeMetrics.length > 0 && (
        <section className="mb-6">
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Engineering
            </div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              PR Time-to-Merge
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {prMergeMetrics.map((metric, idx) => (
                <div
                  key={metric.label}
                  className="rounded-lg border p-3"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                  <div className="mt-1 text-lg font-bold" style={{ color: "var(--accent)" }}>{metric.value}</div>
                  {metric.note && (
                    <div className="mt-0.5 text-xs text-muted-foreground">{metric.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent Activity Tables ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Candidates */}
        <DataTable
          title="Recent Candidates"
          description="Latest candidate registrations"
          rows={recentCandidates.slice(0, 5).map((c) => ({
            id: c.id,
            name: c.title,
            email: c.subtitle,
            status: c.meta,
            date: c.date ?? "",
          }))}
          columns={[
            { key: "name", label: "Name", render: (row) => <span className="text-sm text-foreground">{String(row.name)}</span> },
            { key: "email", label: "Email", render: (row) => <span className="text-sm text-muted-foreground">{String(row.email)}</span> },
            { key: "status", label: "Status", render: (row) => <span className="text-xs">{String(row.status)}</span> },
          ]}
        />

        {/* Recent Companies */}
        <DataTable
          title="Recent Companies"
          description="Latest company registrations"
          rows={recentCompanies.slice(0, 5).map((c) => ({
            id: c.id,
            name: c.title,
            email: c.subtitle,
            status: c.meta,
            date: c.date ?? "",
          }))}
          columns={[
            { key: "name", label: "Name", render: (row) => <span className="text-sm text-foreground">{String(row.name)}</span> },
            { key: "email", label: "Email", render: (row) => <span className="text-sm text-muted-foreground">{String(row.email)}</span> },
            { key: "status", label: "Status", render: (row) => <span className="text-xs">{String(row.status)}</span> },
          ]}
        />

        {/* Recent Requests */}
        <DataTable
          title="Recent Requests"
          description="Latest hiring requests"
          rows={recentRequests.slice(0, 5).map((r) => ({
            id: r.id,
            title: r.title,
            company: r.subtitle,
            status: r.meta,
            date: r.date ?? "",
          }))}
          columns={[
            { key: "title", label: "Position", render: (row) => <span className="text-sm text-foreground">{String(row.title)}</span> },
            { key: "company", label: "Company", render: (row) => <span className="text-sm text-muted-foreground">{String(row.company)}</span> },
            { key: "status", label: "Status", render: (row) => <span className="text-xs">{String(row.status)}</span> },
          ]}
        />

        {/* Recent Transfers */}
        <DataTable
          title="Recent Transfers"
          description="Latest payroll runs"
          rows={recentTransfers.slice(0, 5).map((t) => ({
            id: t.id,
            company: t.title,
            period: t.subtitle,
            status: t.meta,
            amount: t.amount ?? "",
          }))}
          columns={[
            { key: "company", label: "Company", render: (row) => <span className="text-sm text-foreground">{String(row.company)}</span> },
            { key: "period", label: "Period", render: (row) => <span className="text-sm text-muted-foreground">{String(row.period)}</span> },
            { key: "amount", label: "Amount", render: (row) => <span className="text-sm font-medium">{String(row.amount)}</span> },
          ]}
        />
      </div>
    </WorkspaceShell>
  );
}
