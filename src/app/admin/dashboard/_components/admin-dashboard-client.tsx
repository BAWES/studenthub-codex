"use client";

import { useState } from "react";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { EmptyState } from "@/modules/workspace/EmptyState";
import Link from "next/link";
import type { Route } from "next";
import type { SessionUser } from "@/modules/auth/types";
import type { DashboardData } from "../schemas";

type Props = {
  session: SessionUser;
  dashboard: DashboardData;
};

/* ── Status badge variant map ─────────────────────────────────────── */

function statusVariant(
  label: string,
): "success" | "warning" | "error" | "info" | "neutral" {
  const l = label.toLowerCase();
  if (
    l.includes("approved") ||
    l.includes("completed") ||
    l.includes("active") ||
    l.includes("live")
  )
    return "success";
  if (
    l.includes("pending") ||
    l.includes("review") ||
    l.includes("draft")
  )
    return "warning";
  if (
    l.includes("rejected") ||
    l.includes("denied") ||
    l.includes("archived") ||
    l.includes("cancelled")
  )
    return "error";
  if (l.includes("submitted") || l.includes("processing")) return "info";
  return "neutral";
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

/* ── Client Component ──────────────────────────────────────────── */

export function AdminDashboardClient({ session, dashboard }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin Workspace"
      title="Command center for the whole operation."
      metrics={[]}
    >
      {/* ── Metric cards ── */}
      <section
        className="mb-6"
        aria-label="StudentHub health metrics"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Candidates"
            value={dashboard.metrics[0]?.value ?? 0}
            note={dashboard.metrics[0]?.note}
            accent="info"
            sparklineData={[
              12, 19, 15, 22, 28, 24, dashboard.metrics[0]?.value ?? 0,
            ]}
            entranceDelay={0}
          />
          <MetricCard
            label="Companies"
            value={dashboard.metrics[1]?.value ?? 0}
            note={dashboard.metrics[1]?.note}
            accent="success"
            sparklineData={[
              8, 12, 10, 14, 18, 16, dashboard.metrics[1]?.value ?? 0,
            ]}
            entranceDelay={60}
          />
          <MetricCard
            label="Requests"
            value={dashboard.metrics[2]?.value ?? 0}
            note={dashboard.metrics[2]?.note}
            accent="warning"
            sparklineData={[
              5, 9, 7, 11, 15, 13, dashboard.metrics[2]?.value ?? 0,
            ]}
            entranceDelay={120}
          />
          <MetricCard
            label="Transfers"
            value={dashboard.metrics[3]?.value ?? 0}
            note={dashboard.metrics[3]?.note}
            accent="primary"
            sparklineData={[
              3, 6, 5, 8, 10, 9, dashboard.metrics[3]?.value ?? 0,
            ]}
            entranceDelay={180}
          />
        </div>
      </section>

      {/* ── Request Pipeline ── */}
      <section className="mb-6" aria-label="Request pipeline status">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Request Pipeline
          </h2>

          {dashboard.statusMix.length > 0 ? (
            <div className="space-y-4">
              {/* Visual bar */}
              <div
                className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                {dashboard.statusMix.map((status) => {
                  const total = dashboard.statusMix.reduce(
                    (s, a) => s + a.value,
                    0,
                  );
                  const pct = total > 0 ? (status.value / total) * 100 : 0;
                  return (
                    <div
                      key={status.label}
                      className="h-full transition-all duration-500"
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
                  <div
                    key={status.label}
                    className="flex items-center justify-between"
                  >
                    <StatusBadge
                      variant={statusVariant(status.label)}
                      size="sm"
                      label={status.label}
                    />
                    <strong
                      className="text-sm tabular-nums text-foreground"
                    >
                      {status.value.toLocaleString("en-US")}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState variant="idle" message="No requests in pipeline" />
          )}
        </div>
      </section>

      {/* ── PR Merge Metrics ── */}
      <section className="mb-6" aria-label="PR merge time-to-merge metrics">
        <div className="rounded-lg border border-[var(--border)] bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              PR Time-to-Merge
            </h2>
            <Link
              href="https://github.com/BAWES/studenthub-codex/pulls"
              className="text-xs font-medium hover:underline text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open GitHub →
            </Link>
          </div>

          {dashboard.prMergeMetrics.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {dashboard.prMergeMetrics.map((metric, idx) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={
                      typeof metric.value === "number"
                        ? metric.value
                        : (metric.value as string)
                    }
                    note={metric.note}
                    accent={
                      idx === 3
                        ? "warning"
                        : idx === 2
                          ? "success"
                          : "info"
                    }
                    entranceDelay={idx * 60}
                  />
                ))}
              </div>

              {dashboard.recentPrMergeTimes.length > 0 && (
                <>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Recent merges
                  </h3>
                  <div className="divide-y divide-[var(--border)]">
                    {dashboard.recentPrMergeTimes.map((pr) => {
                      const fmtHours =
                        pr.hours < 1
                          ? `${Math.round(pr.hours * 60)}m`
                          : `${pr.hours.toFixed(1)}h`;
                      return (
                        <Link
                          href={`https://github.com/BAWES/studenthub-codex/pull/${pr.number}` as Route}
                          key={pr.number}
                          className="flex items-center justify-between px-2 py-3 hover:bg-[var(--hover)] transition-colors -mx-2 rounded"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="min-w-0">
                            <strong
                              className="text-sm text-foreground"
                            >
                              #{pr.number}
                            </strong>
                            <span
                              className="ml-2 text-sm text-muted-foreground"
                            >
                              {pr.title}
                            </span>
                          </div>
                          <span
                            className="text-xs whitespace-nowrap ml-3 text-muted-foreground"
                          >
                            {fmtHours}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <EmptyState variant="idle" message="No PR merge data available" />
          )}
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section aria-label="Recent activity">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DataListCard
            title="Candidates"
            href="/admin/candidates"
            items={dashboard.recentCandidates}
            emptyMessage="No recent candidates"
          />
          <DataListCard
            title="Companies"
            href="/admin/companies"
            items={dashboard.recentCompanies}
            emptyMessage="No recent companies"
          />
          <DataListCard
            title="Requests"
            href="/admin/requests"
            items={dashboard.recentRequests}
            emptyMessage="No recent requests"
          />
          <DataListCard
            title="Transfers"
            href="/admin/transfers"
            items={dashboard.recentTransfers}
            emptyMessage="No recent transfers"
          />
        </div>
      </section>
    </WorkspaceShell>
  );
}

/* ── DataListCard sub-component ────────────────────────────────── */

function DataListCard({
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
    <div className="rounded-lg border border-[var(--border)] bg-card">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <span
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Recent
          </span>
          <h3 className="text-sm font-semibold text-foreground">
            {title}
          </h3>
        </div>
        <span
          className="text-xs tabular-nums bg-[var(--surface)] rounded-full px-2 py-0.5 text-muted-foreground"
        >
          {items.length}
        </span>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              href={`${href}/${item.id}` as Route}
              key={item.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-[var(--hover)] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <strong
                  className="block truncate text-sm text-foreground"
                >
                  {item.title}
                </strong>
                <span
                  className="block truncate text-xs text-muted-foreground"
                >
                  {item.subtitle}
                </span>
              </div>
              <div className="ml-3 flex items-center gap-2 text-right">
                <StatusBadge
                  variant={statusVariant(item.meta)}
                  size="sm"
                  label={item.meta}
                />
                <div className="text-right">
                  {item.amount != null && (
                    <span
                      className="block text-xs font-medium tabular-nums text-foreground"
                    >
                      {item.amount}
                    </span>
                  )}
                  {item.date != null && (
                    <span
                      className="block text-xs text-muted-foreground"
                    >
                      {item.date}
                    </span>
                  )}
                  {item.count != null && item.count > 0 && (
                    <span
                      className="block text-xs text-muted-foreground"
                    >
                      {item.count} seats
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-8">
            <EmptyState
              variant="idle"
              message={emptyMessage ?? "No records"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
