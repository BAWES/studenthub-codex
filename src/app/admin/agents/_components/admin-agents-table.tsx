"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { AgentHealthData } from "../schemas";

/* ── Status badge variant for agent status ─────────────────────────── */

function statusVariant(
  status: string,
): "success" | "warning" | "error" | "info" | "neutral" {
  const s = status.toLowerCase();
  if (s === "running") return "success";
  if (s === "idle") return "warning";
  if (s === "error") return "error";
  return "neutral";
}

/* ── Success rate accent for MetricCard ─────────────────────────────── */

function successAccent(rate: string): "success" | "warning" | "error" | "info" {
  const num = parseInt(rate.replace("%", ""), 10);
  if (isNaN(num)) return "info";
  if (num >= 80) return "success";
  if (num >= 50) return "warning";
  return "error";
}

/* ── Metric accent helpers ──────────────────────────────────────────── */

function metricAccent(
  label: string,
  _value: string,
): "success" | "warning" | "error" | "info" {
  // Dynamically set accent based on label and value
  // For StatusBadge companion — success rate and open issues get semantic accents
  if (label === "Success rate") return "info"; // handled by successAccent
  if (label === "Runs (24h)") return "info";
  if (label === "Issues done (7d)") return "success";
  if (label === "Open issues") return "warning";
  return "info";
}

/* ── Agent Card ─────────────────────────────────────────────────────── */

function AgentCard({
  agent,
  index,
}: {
  agent: AgentHealthData;
  index: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
      {/* Agent header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">{agent.role}</span>
          <h2 className="m-0 text-base font-semibold text-foreground leading-tight">{agent.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            variant={statusVariant(agent.status)}
            size="sm"
            label={agent.status}
          />
        </div>
      </div>

      {/* Last heartbeat */}
      {agent.lastHeartbeat && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Last heartbeat: {agent.lastHeartbeat}
        </p>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {agent.heartbeatMetrics.map((metric, idx) => {
          let accent: "success" | "warning" | "error" | "info" = "info";
          if (metric.label === "Success rate") {
            accent = successAccent(metric.value);
          } else {
            accent = metricAccent(metric.label, metric.value);
          }
          return (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              accent={accent}
              entranceDelay={(index * 120) + (idx * 40)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────────── */

interface AdminAgentsTableProps {
  session: any;
  agents: AgentHealthData[];
  loading?: boolean;
  error?: string | null;
}

/* ── Loading Skeleton ───────────────────────────────────────────────── */

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className || ""}`}
      aria-hidden="true"
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--border)] bg-white p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-5 w-32" />
            </div>
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="h-3 w-48 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <SkeletonBlock key={j} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────────────── */

function EmptyAgentsState() {
  return (
    <section aria-label="No agents found" className="mb-6">
      <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">Agents</span>
            <h2 className="m-0 text-base font-semibold text-foreground leading-tight">No active agents</h2>
          </div>
        </div>
        <div className="py-6">
          <EmptyState
            variant="idle"
            message="No agents with running/idle/error status found"
          />
        </div>
      </div>
    </section>
  );
}

/* ── Error State ────────────────────────────────────────────────────── */

function ErrorAgentsState({ message }: { message: string }) {
  return (
    <section aria-label="Agent health error" className="mb-6">
      <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-[0.05em] mb-0.5">Error</span>
            <h2 className="m-0 text-base font-semibold text-foreground leading-tight">Could not load agent data</h2>
          </div>
        </div>
        <div className="py-6">
          <EmptyState variant="error" message={message} />
        </div>
      </div>
    </section>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */

export function AdminAgentsTable({
  session,
  agents,
  loading = false,
  error = null,
}: AdminAgentsTableProps) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin Workspace"
      title="Agent Health Monitoring"
      metrics={[]}
    >
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorAgentsState message={error} />
      ) : agents.length === 0 ? (
        <EmptyAgentsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
