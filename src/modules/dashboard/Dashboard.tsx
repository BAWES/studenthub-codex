import { getDashboardData } from "@/modules/dashboard/data";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { MetricCard } from "@/components/ui/metric-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import Link from "next/link";
import type { Route } from "next";

/* ── Status badge variant map ─────────────────────────────────────── */

function statusVariant(label: string): "success" | "warning" | "error" | "info" | "neutral" {
  const l = label.toLowerCase();
  if (l.includes("approved") || l.includes("completed") || l.includes("active") || l.includes("live")) return "success";
  if (l.includes("pending") || l.includes("review") || l.includes("draft")) return "warning";
  if (l.includes("rejected") || l.includes("denied") || l.includes("archived") || l.includes("cancelled")) return "error";
  if (l.includes("submitted") || l.includes("processing")) return "info";
  return "neutral";
}

/* ── Dashboard ────────────────────────────────────────────────────── */

export async function Dashboard() {
  const dashboard = await getDashboardData();

  return (
    <>
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
        <GlassPanel variant="subtle" radius="lg" className="p-5">
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
        </GlassPanel>
      </section>

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
    </>
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

/* ── DataList — glass card with rows ───────────────────────────── */

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
    <GlassPanel
      variant="subtle"
      radius="lg"
      className="shDashboardDataList"
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
    </GlassPanel>
  );
}
