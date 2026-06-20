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
import { ChevronRight } from "lucide-react";
import type { Route } from "next";

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

        {/* ── Health metric cards ── */}
        <section aria-label="StudentHub health metrics" className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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

        {/* ── Request Pipeline — overview + status breakdown ── */}
        <section aria-label="Request pipeline status" className="mb-6">
          <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">
                  Pipeline
                </span>
                <h2 className="m-0 text-base font-semibold text-foreground leading-tight">
                  Request Pipeline
                </h2>
              </div>
              <Link
                href="/admin/requests"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 no-underline px-2 py-1 rounded-md hover:bg-blue-50 shrink-0 transition-colors"
              >
                View all
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {dashboard.statusMix.length > 0 ? (
              <div className="grid gap-3">
                {/* Visual bar showing proportional breakdown */}
                <div className="flex h-1.5 rounded-full overflow-hidden bg-muted" aria-hidden="true">
                  {dashboard.statusMix.map((status) => {
                    const total = dashboard.statusMix.reduce((s, a) => s + a.value, 0);
                    const pct = total > 0 ? (status.value / total) * 100 : 0;
                    return (
                      <div
                        key={status.label}
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
                      <strong className="text-base font-bold text-foreground">
                        {status.value.toLocaleString("en-US")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6">
                <EmptyState variant="idle" message="No requests in pipeline" />
              </div>
            )}
          </div>
        </section>

        {/* ── PR Merge Time-to-Merge Metrics ── */}
        <section aria-label="PR merge time-to-merge metrics" className="mb-6">
          <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">
                  Engineering
                </span>
                <h2 className="m-0 text-base font-semibold text-foreground leading-tight">
                  PR Time-to-Merge
                </h2>
              </div>
              <Link
                href="https://github.com/BAWES/studenthub-codex/pulls"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 no-underline px-2 py-1 rounded-md hover:bg-blue-50 shrink-0 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open GitHub
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {dashboard.prMergeMetrics.length > 0 ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
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
                    <h3 className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5 mt-3">
                      Recent merges
                    </h3>
                    <div className="grid gap-0.5">
                      {dashboard.recentPrMergeTimes.map((pr) => {
                        const fmtHours = pr.hours < 1
                          ? `${Math.round(pr.hours * 60)}m`
                          : `${pr.hours.toFixed(1)}h`;
                        return (
                          <Link
                            href={`https://github.com/BAWES/studenthub-codex/pull/${pr.number}` as Route}
                            key={pr.number}
                            className="grid grid-cols-[1fr_auto] gap-2.5 items-center p-2.5 rounded-md no-underline text-foreground transition-colors hover:bg-muted/40"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="min-w-0 grid gap-px">
                              <strong className="text-[13px] font-medium text-foreground truncate">
                                #{pr.number}
                              </strong>
                              <span className="text-[11px] text-muted-foreground truncate">
                                {pr.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {fmtHours}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-6">
                <EmptyState variant="idle" message="No PR merge data available" />
              </div>
            )}
          </div>
        </section>

        {/* ── Coder Agent Health Metrics ── */}
        <CoderHealthSection />

        {/* ── Recent Activity ── */}
        <section aria-label="Recent activity" className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <DataList
              title="Candidates"
              href="/admin/candidates"
              items={dashboard.recentCandidates}
              emptyMessage="No recent candidates"
            />
            <DataList
              title="Companies"
              href="/admin/companies"
              items={dashboard.recentCompanies}
              emptyMessage="No recent companies"
            />
            <DataList
              title="Requests"
              href="/admin/requests"
              items={dashboard.recentRequests}
              emptyMessage="No recent requests"
            />
            <DataList
              title="Transfers"
              href="/admin/transfers"
              items={dashboard.recentTransfers}
              emptyMessage="No recent transfers"
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

/* ── DataList — card with rows ────────────────────────────────── */

function DataList({
  title,
  href,
  items,
  emptyMessage,
}: {
  title: string;
  href: string;
  items: DataListItem[];
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-border mb-2">
        <div>
          <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">
            Recent
          </span>
          <h3 className="m-0 text-[15px] font-semibold text-foreground leading-tight">{title}</h3>
        </div>
        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-semibold text-muted-foreground bg-muted/50 shrink-0">
          {items.length}
        </span>
      </div>

      <div className="grid gap-0.5">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              href={`${href}/${item.id}` as Route}
              key={item.id}
              className="grid grid-cols-[1fr_auto] gap-2.5 items-center p-2.5 rounded-md no-underline text-foreground transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 grid gap-px">
                <strong className="text-[13px] font-medium text-foreground truncate">{item.title}</strong>
                <span className="text-[11px] text-muted-foreground truncate">{item.subtitle}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge
                  variant={statusVariant(item.meta)}
                  size="sm"
                  label={item.meta}
                />
                <div className="flex items-center gap-2">
                  {item.amount != null && (
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">{item.amount}</span>
                  )}
                  {item.count != null && (
                    <span className="text-[11px] text-blue-600 whitespace-nowrap">{item.count} seats</span>
                  )}
                  {item.date != null && (
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{item.date}</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-4">
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
      <section aria-label="Coder agent health" className="mb-6">
        <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">
                Agent
              </span>
              <h2 className="m-0 text-base font-semibold text-foreground leading-tight">
                Coder Health
              </h2>
            </div>
          </div>
          <div className="py-6">
            <EmptyState variant="idle" message="Could not load Coder health data" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Coder agent health metrics" className="mb-6">
      <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">
              Agent
            </span>
            <h2 className="m-0 text-base font-semibold text-foreground leading-tight">
              Coder Health
            </h2>
          </div>
        </div>

        {data.heartbeatMetrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
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
          <div className="py-6">
            <EmptyState variant="idle" message="No heartbeat data yet" />
          </div>
        )}

        {/* Recent issues */}
        {data.recentIssues.length > 0 && (
          <>
            <h3 className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5 mt-3">
              Recent issues
            </h3>
            <div className="grid gap-0.5">
              {data.recentIssues.slice(0, 6).map((issue, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto] gap-2.5 items-center p-2.5 rounded-md text-foreground">
                  <div className="min-w-0 grid gap-px">
                    <strong className="text-[13px] font-medium text-foreground truncate">{issue.title}</strong>
                    <span className="text-[11px] text-muted-foreground truncate">{issue.status}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{issue.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent commits */}
        {data.recentCommits.length > 0 && (
          <>
            <h3 className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5 mt-3">
              Recent commits
            </h3>
            <div className="grid gap-0.5">
              {data.recentCommits.map((commit) => (
                <Link
                  key={commit.sha}
                  href={`https://github.com/BAWES/studenthub-codex/commit/${commit.sha}` as Route}
                  className="grid grid-cols-[1fr_auto] gap-2.5 items-center p-2.5 rounded-md no-underline text-foreground transition-colors hover:bg-muted/40"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="min-w-0 grid gap-px">
                    <strong className="text-[13px] font-medium text-foreground truncate">{commit.sha}</strong>
                    <span className="text-[11px] text-muted-foreground truncate">{commit.message}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{commit.date}</span>
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
