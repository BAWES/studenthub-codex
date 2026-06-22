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

        {/* ── Glass metric cards with sparklines ── */}
        <section
          className="shDashboardSection"
          aria-label="StudentHub health metrics"
        >
          <div className="shDashboardGrid4">
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

        {/* ── Request Pipeline — glass overview + status breakdown ── */}
        <section
          className="shDashboardSection"
          aria-label="Request pipeline status"
        >
          <div className="rounded-lg border border-[var(--border)] bg-card p-5">
            <div className="shPipelineHeader">
              <div>
                <span className="shPipelineEyebrow">Pipeline</span>
                <h2 className="shPipelineTitle">Request Pipeline</h2>
              </div>
              <Link
                href="/admin/requests"
                className="shPipelineLink"
              >
                View all
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {dashboard.statusMix.length > 0 ? (
              <div className="shPipelineGrid">
                {/* Visual bar showing proportional breakdown */}
                <div className="shPipelineBar" aria-hidden="true">
                  {dashboard.statusMix.map((status) => {
                    const total = dashboard.statusMix.reduce((s, a) => s + a.value, 0);
                    const pct = total > 0 ? (status.value / total) * 100 : 0;
                    return (
                      <div
                        key={status.label}
                        className="shPipelineBarSegment"
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
                <div className="shPipelineList">
                  {dashboard.statusMix.map((status) => (
                    <div key={status.label} className="shPipelineRow">
                      <StatusBadge
                        variant={statusVariant(status.label)}
                        size="sm"
                        label={status.label}
                      />
                      <strong className="shPipelineCount">
                        {status.value.toLocaleString("en-US")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="shPipelineEmpty">
                <EmptyState variant="idle" message="No requests in pipeline" />
              </div>
            )}
          </div>
        </section>

        {/* ── PR Merge Time-to-Merge Metrics ── */}
        <section
          className="shDashboardSection"
          aria-label="PR merge time-to-merge metrics"
        >
          <div className="rounded-lg border border-[var(--border)] bg-card p-5">
            <div className="shPipelineHeader">
              <div>
                <span className="shPipelineEyebrow">Engineering</span>
                <h2 className="shPipelineTitle">PR Time-to-Merge</h2>
              </div>
              <Link
                href="https://github.com/BAWES/studenthub-codex/pulls"
                className="shPipelineLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open GitHub
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {dashboard.prMergeMetrics.length > 0 ? (
              <div className="shPipelineGrid">
                <div className="shDashboardGrid4 shMt2">
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
                    <h3 className="shDataListEyebrow shMt3">Recent merges</h3>
                    <div className="shDataListBody">
                      {dashboard.recentPrMergeTimes.map((pr) => {
                        const fmtHours = pr.hours < 1
                          ? `${Math.round(pr.hours * 60)}m`
                          : `${pr.hours.toFixed(1)}h`;
                        return (
                          <Link
                            href={`https://github.com/BAWES/studenthub-codex/pull/${pr.number}` as Route}
                            key={pr.number}
                            className="shDataListRow"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="shDataListRowMain">
                              <strong className="shDataListRowTitle">#{pr.number}</strong>
                              <span className="shDataListRowSub">{pr.title}</span>
                            </div>
                            <div className="shDataListRowMeta">
                              <span className="shDataListRowDate">{fmtHours}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="shPipelineEmpty">
                <EmptyState variant="idle" message="No PR merge data available" />
              </div>
            )}
          </div>
        </section>

        {/* ── Coder Agent Health Metrics ── */}
        <CoderHealthSection />

        {/* ── Recent Activity ── */}
        <section
          className="shDashboardSection"
          aria-label="Recent activity"
        >
          <div className="shDashboardGrid2">
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

/* ── DataList — glass card with rows ────────────────────────────── */

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
      className="rounded-lg border border-[var(--border)] bg-card shDashboardDataList"
      style={{ animationDelay: `${entranceDelay}ms` } as React.CSSProperties}
    >
      <div className="shDataListHeader">
        <div>
          <span className="shDataListEyebrow">Recent</span>
          <h3 className="shDataListTitle">{title}</h3>
        </div>
        <span className="shDataListCount">{items.length}</span>
      </div>

      <div className="shDataListBody">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <Link
              href={`${href}/${item.id}` as Route}
              key={item.id}
              className="shDataListRow"
              style={{ animationDelay: `${Math.min((idx + 1) * 40, 400)}ms` } as React.CSSProperties}
            >
              <div className="shDataListRowMain">
                <strong className="shDataListRowTitle">{item.title}</strong>
                <span className="shDataListRowSub">{item.subtitle}</span>
              </div>
              <div className="shDataListRowMeta">
                <StatusBadge
                  variant={statusVariant(item.meta)}
                  size="sm"
                  label={item.meta}
                />
                <div className="shDataListRowMetaRight">
                  {item.amount != null && (
                    <span className="shDataListRowAmount">{item.amount}</span>
                  )}
                  {item.count != null && (
                    <span className="shDataListRowCount">{item.count} seats</span>
                  )}
                  {item.date != null && (
                    <span className="shDataListRowDate">{item.date}</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="shDataListEmpty">
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
      <section className="shDashboardSection" aria-label="Coder agent health">
        <div className="rounded-lg border border-[var(--border)] bg-card p-5">
          <div className="shPipelineHeader">
            <div>
              <span className="shPipelineEyebrow">Agent</span>
              <h2 className="shPipelineTitle">Coder Health</h2>
            </div>
          </div>
          <div className="shPipelineEmpty">
            <EmptyState variant="idle" message="Could not load Coder health data" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shDashboardSection" aria-label="Coder agent health metrics">
      <div className="rounded-lg border border-[var(--border)] bg-card p-5">
        <div className="shPipelineHeader">
          <div>
            <span className="shPipelineEyebrow">Agent</span>
            <h2 className="shPipelineTitle">Coder Health</h2>
          </div>
        </div>

        {data.heartbeatMetrics.length > 0 ? (
          <div className="shDashboardGrid4 shMt2">
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
          <div className="shPipelineEmpty">
            <EmptyState variant="idle" message="No heartbeat data yet" />
          </div>
        )}

        {/* Recent issues */}
        {data.recentIssues.length > 0 && (
          <>
            <h3 className="shDataListEyebrow shMt3">Recent issues</h3>
            <div className="shDataListBody">
              {data.recentIssues.slice(0, 6).map((issue, idx) => (
                <div key={idx} className="shDataListRow">
                  <div className="shDataListRowMain">
                    <strong className="shDataListRowTitle">{issue.title}</strong>
                    <span className="shDataListRowSub">{issue.status}</span>
                  </div>
                  <div className="shDataListRowMeta">
                    <span className="shDataListRowDate">{issue.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent commits */}
        {data.recentCommits.length > 0 && (
          <>
            <h3 className="shDataListEyebrow shMt3">Recent commits</h3>
            <div className="shDataListBody">
              {data.recentCommits.map((commit) => (
                <Link
                  key={commit.sha}
                  href={`https://github.com/BAWES/studenthub-codex/commit/${commit.sha}` as Route}
                  className="shDataListRow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="shDataListRowMain">
                    <strong className="shDataListRowTitle">{commit.sha}</strong>
                    <span className="shDataListRowSub">{commit.message}</span>
                  </div>
                  <div className="shDataListRowMeta">
                    <span className="shDataListRowDate">{commit.date}</span>
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
