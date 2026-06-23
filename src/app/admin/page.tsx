import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { AdminFeatureGrid } from "@/modules/workspace/AdminFeatureGrid";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { getDashboardData } from "./dashboard/actions";
import { getCoderHealthData } from "./dashboard/coder-health-actions";
import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

/* ── Status badge variant map ─────────────────────────────────────── */

function statusVariant(label: string): "success" | "warning" | "error" | "info" | "neutral" {
  const l = label.toLowerCase();
  if (l.includes("approved") || l.includes("completed") || l.includes("active") || l.includes("live")) return "success";
  if (l.includes("pending") || l.includes("review") || l.includes("draft")) return "warning";
  if (l.includes("rejected") || l.includes("denied") || l.includes("archived") || l.includes("cancelled")) return "error";
  if (l.includes("submitted") || l.includes("processing")) return "info";
  return "neutral";
}

/* ── Admin Page ───────────────────────────────────────────────────── */

export default async function AdminPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const dashboard = await getDashboardData();

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin Workspace"
        title="Command center for the whole operation."
        metrics={[]}
      >
        <AdminFeatureGrid />

        {/* ── Metric cards ── */}
        <section className="space-y-6" aria-label="StudentHub health metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Candidates"
              value={dashboard.metrics[0]?.value ?? 0}
              note={dashboard.metrics[0]?.note}
              accent="info"
              sparklineData={[12, 19, 15, 22, 28, 24, dashboard.metrics[0]?.value ?? 0]}
              entranceDelay={0}
            />
            <MetricCard
              label="Companies"
              value={dashboard.metrics[1]?.value ?? 0}
              note={dashboard.metrics[1]?.note}
              accent="success"
              sparklineData={[8, 12, 10, 14, 18, 16, dashboard.metrics[1]?.value ?? 0]}
              entranceDelay={60}
            />
            <MetricCard
              label="Requests"
              value={dashboard.metrics[2]?.value ?? 0}
              note={dashboard.metrics[2]?.note}
              accent="warning"
              sparklineData={[5, 9, 7, 11, 15, 13, dashboard.metrics[2]?.value ?? 0]}
              entranceDelay={120}
            />
            <MetricCard
              label="Transfers"
              value={dashboard.metrics[3]?.value ?? 0}
              note={dashboard.metrics[3]?.note}
              accent="primary"
              sparklineData={[3, 6, 5, 8, 10, 9, dashboard.metrics[3]?.value ?? 0]}
              entranceDelay={180}
            />
          </div>
        </section>

        {/* ── Request Pipeline ── */}
        <section className="space-y-6" aria-label="Request pipeline status">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Pipeline</span>
                <h2 className="text-lg font-semibold text-foreground">Request Pipeline</h2>
              </div>
              <Link
                href="/admin/requests"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View all
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {dashboard.statusMix.length > 0 ? (
              <div className="space-y-4">
                {/* Visual bar showing proportional breakdown */}
                <div className="flex h-2 rounded-full overflow-hidden bg-muted" aria-hidden="true">
                  {dashboard.statusMix.map((status) => {
                    const total = dashboard.statusMix.reduce((s, a) => s + a.value, 0);
                    const pct = total > 0 ? (status.value / total) * 100 : 0;
                    return (
                      <div
                        key={status.label}
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: `var(--sh-${statusVariant(status.label)}-bg)`,
                        }}
                        title={`${status.label}: ${status.value}`}
                      />
                    );
                  })}
                </div>

                {/* Status items */}
                <div className="space-y-2">
                  {dashboard.statusMix.map((status) => (
                    <div key={status.label} className="flex items-center justify-between">
                      <StatusBadge
                        variant={statusVariant(status.label)}
                        size="sm"
                        label={status.label}
                      />
                      <strong className="text-lg font-semibold tabular-nums">
                        {status.value.toLocaleString("en-US")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8">
                <EmptyState variant="idle" message="No requests in pipeline" />
              </div>
            )}
          </div>
        </section>

        {/* ── PR Merge Time-to-Merge Metrics ── */}
        <section className="space-y-6" aria-label="PR merge time-to-merge metrics">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Engineering</span>
                <h2 className="text-lg font-semibold text-foreground">PR Time-to-Merge</h2>
              </div>
              <Link
                href="https://github.com/BAWES/studenthub-codex/pulls"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open GitHub
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {dashboard.prMergeMetrics.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  {dashboard.prMergeMetrics.map((metric, idx) => (
                    <MetricCard
                      key={metric.label}
                      label={metric.label}
                      value={typeof metric.value === "number" ? metric.value : (metric.value as string)}
                      note={metric.note}
                      accent={idx === 3 ? "warning" : idx === 2 ? "success" : "info"}
                      entranceDelay={idx * 60}
                    />
                  ))}
                </div>

                {dashboard.recentPrMergeTimes.length > 0 && (
                  <>
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mt-3">Recent merges</h3>
                    <div className="divide-y rounded-md border border-border">
                      {dashboard.recentPrMergeTimes.map((pr) => {
                        const fmtHours = pr.hours < 1
                          ? `${Math.round(pr.hours * 60)}m`
                          : `${pr.hours.toFixed(1)}h`;
                        return (
                          <Link
                            href={`https://github.com/BAWES/studenthub-codex/pull/${pr.number}` as Route}
                            key={pr.number}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="flex-1 min-w-0">
                              <strong className="text-sm font-medium truncate block">#{pr.number}</strong>
                              <span className="text-xs text-muted-foreground truncate block">{pr.title}</span>
                            </div>
                            <div className="flex items-center gap-3 ml-4 shrink-0">
                              <span className="text-xs text-muted-foreground tabular-nums">{fmtHours}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-8">
                <EmptyState variant="idle" message="No PR merge data available" />
              </div>
            )}
          </div>
        </section>

        {/* ── Coder Agent Health Metrics ── */}
        <CoderHealthSection />

        {/* ── Recent Activity ── */}
        <section className="space-y-6" aria-label="Recent activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataList
              title="Candidates"
              href="/admin/candidates"
              items={dashboard.recentCandidates}
              emptyMessage="No recent candidates"
              entranceDelay={0}
            />
            <DataList
              title="Companies"
              href="/admin/companies"
              items={dashboard.recentCompanies}
              emptyMessage="No recent companies"
              entranceDelay={80}
            />
            <DataList
              title="Requests"
              href="/admin/requests"
              items={dashboard.recentRequests}
              emptyMessage="No recent requests"
              entranceDelay={160}
            />
            <DataList
              title="Transfers"
              href="/admin/transfers"
              items={dashboard.recentTransfers}
              emptyMessage="No recent transfers"
              entranceDelay={240}
            />
          </div>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}

/* ── DataListItem type ──────────────────────────────────────────── */

type DataListItem = {
  id: number | string;
  title: string;
  subtitle: string;
  meta: string;
  amount?: string;
  date?: string;
  count?: number;
};

/* ── DataList — card with rows ─────────────────────────────────── */

function DataList({
  title,
  href,
  items,
  emptyMessage,
  entranceDelay = 0,
}: {
  title: string;
  href: string;
  items: DataListItem[];
  emptyMessage?: string;
  entranceDelay?: number;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-card"
      style={{ animationDelay: `${entranceDelay}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Recent</span>
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{items.length}</span>
      </div>

      <div className="divide-y">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <Link
              href={`${href}/${item.id}` as Route}
              key={item.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              style={{ animationDelay: `${Math.min((idx + 1) * 40, 400)}ms` } as React.CSSProperties}
            >
              <div className="flex-1 min-w-0">
                <strong className="text-sm font-medium truncate block">{item.title}</strong>
                <span className="text-xs text-muted-foreground truncate block">{item.subtitle}</span>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <StatusBadge
                  variant={statusVariant(item.meta)}
                  size="sm"
                  label={item.meta}
                />
                <div className="flex items-center gap-2 text-right">
                  {item.amount != null && (
                    <span className="text-sm font-medium tabular-nums">{item.amount}</span>
                  )}
                  {item.count != null && (
                    <span className="text-xs text-muted-foreground">{item.count} seats</span>
                  )}
                  {item.date != null && (
                    <span className="text-xs text-muted-foreground tabular-nums">{item.date}</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-8">
            <EmptyState variant="idle" message={emptyMessage ?? "No records"} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Coder Agent Health Section ────────────────────────────────── */

async function CoderHealthSection() {
  let data;
  try {
    data = await getCoderHealthData();
  } catch {
    return (
      <section className="space-y-6" aria-label="Coder agent health">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Agent</span>
              <h2 className="text-lg font-semibold text-foreground">Coder Health</h2>
            </div>
          </div>
          <div className="py-8">
            <EmptyState variant="idle" message="Could not load Coder health data" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-label="Coder agent health metrics">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Agent</span>
            <h2 className="text-lg font-semibold text-foreground">Coder Health</h2>
          </div>
        </div>

        {data.heartbeatMetrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {data.heartbeatMetrics.map((metric, idx) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                accent={idx === 0 ? "info" : idx === 1 ? (metric.value.startsWith("8") || metric.value.startsWith("9") || metric.value === "100%" ? "success" : "warning") : "info"}
                entranceDelay={idx * 60}
              />
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState variant="idle" message="No heartbeat data yet" />
          </div>
        )}

        {/* Recent issues */}
        {data.recentIssues.length > 0 && (
          <>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mt-3">Recent issues</h3>
            <div className="divide-y rounded-md border border-border mt-2">
              {data.recentIssues.slice(0, 6).map((issue, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <strong className="text-sm font-medium truncate block">{issue.title}</strong>
                    <span className="text-xs text-muted-foreground truncate block">{issue.status}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">{issue.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent commits */}
        {data.recentCommits.length > 0 && (
          <>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mt-3">Recent commits</h3>
            <div className="divide-y rounded-md border border-border mt-2">
              {data.recentCommits.map((commit) => (
                <Link
                  key={commit.sha}
                  href={`https://github.com/BAWES/studenthub-codex/commit/${commit.sha}` as Route}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 min-w-0">
                    <strong className="text-sm font-medium truncate block">{commit.sha}</strong>
                    <span className="text-xs text-muted-foreground truncate block">{commit.message}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">{commit.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
