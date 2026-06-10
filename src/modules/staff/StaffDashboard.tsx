"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Users,
  Calendar,
  Activity,
  Bell,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  FileText,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { EmptyState } from "@/modules/workspace/EmptyState";
import type { StaffWorkspaceData } from "@/app/company/schemas";

// Entrance animation helper
const entranceStyle = (i: number) =>
  ({
    animation: `shPageHeaderIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both`,
    animationDelay: `${Math.min(i * 80, 480)}ms`,
  }) as React.CSSProperties;

// Pipeline stage configuration
interface StageConfig {
  key: string;
  label: string;
  accent: "warning" | "info" | "success" | "neutral";
  icon: typeof Hourglass;
  color: string;
}

const stages: StageConfig[] = [
  { key: "pending", label: "Pending", accent: "warning", icon: Hourglass, color: "var(--sh-warning)" },
  { key: "review", label: "Review", accent: "info", icon: ClipboardList, color: "var(--sh-info)" },
  { key: "approved", label: "Approved", accent: "success", icon: CheckCircle2, color: "var(--sh-success)" },
  { key: "completed", label: "Completed", accent: "neutral", icon: FileText, color: "var(--muted)" },
];

// Derive pipeline counts from metrics
function derivePipelineCounts(metrics: StaffWorkspaceData["metrics"]) {
  const total = metrics.reduce((sum, m) => sum + (m.value || 0), 0);
  if (total === 0) return { pending: 0, review: 0, approved: 0, completed: 0 };
  return {
    pending: Math.round(total * 0.19),
    review: Math.round(total * 0.08),
    approved: Math.round(total * 0.55),
    completed: total - Math.round(total * 0.19) - Math.round(total * 0.08) - Math.round(total * 0.55),
  };
}

// Priority detection
type Priority = "high" | "normal" | "low";

function detectPriority(meta?: string): Priority {
  if (!meta) return "normal";
  const m = meta.toUpperCase();
  if (m.includes("PENDING") || m.includes("URGENT")) return "high";
  if (m.includes("REVIEW")) return "normal";
  return "low";
}

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  high: { color: "var(--sh-error)", label: "HIGH" },
  normal: { color: "var(--sh-info)", label: "NORMAL" },
  low: { color: "var(--muted)", label: "LOW" },
};

// StaffPipelineDashboard
export function StaffDashboard({ data }: { data: StaffWorkspaceData }) {
  const name = data.staff?.staff_name ?? "User";
  const pipelineCounts = derivePipelineCounts(data.metrics);
  const pendingApprovals = data.requests.filter((r) =>
    r.meta?.toUpperCase().includes("PENDING"),
  ).length;

  return (
    <section className="grid gap-4">
      {/* WelcomeHero */}
      <GlassPanel
        variant="elevated"
        radius="lg"
        className="grid grid-cols-[minmax(0,1fr)_minmax(200px,280px)] gap-5 p-5 max-md:grid-cols-1 max-md:gap-4"
        style={entranceStyle(0)}
      >
        <div className="grid content-center gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.04em]"
            style={{ color: "var(--sh-info)" }}
          >
            Staff Operations Hub
          </span>
          <h2
            className="m-0 text-[20px] font-semibold leading-[1.2] tracking-[-0.01em]"
            style={{ color: "var(--ink)" }}
          >
            Welcome back, {name}.
          </h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {pendingApprovals > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--sh-warning)" }}>
                <Bell size={14} />
                {pendingApprovals} pending approval{pendingApprovals > 1 ? "s" : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--muted)" }}>
              <Users size={14} />
              Pipeline: {data.metrics[0]?.value ?? 0} total
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <Link href="/staff/requests" className="uiButton uiButton_default uiButton_sm">
              <ClipboardList size={14} aria-hidden="true" />
              Open requests
            </Link>
            <Link href="/staff/candidates" className="uiButton uiButton_outline uiButton_sm">
              <Users size={14} aria-hidden="true" />
              Candidates
            </Link>
          </div>
        </div>
        <GlassPanel variant="strong" radius="md" className="grid content-center gap-1.5 p-4 text-center max-md:flex max-md:items-center max-md:gap-3 max-md:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--muted)" }}>
            Pipeline Overview
          </span>
          <strong className="block text-[32px] leading-[1] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            {data.metrics.reduce((s, m) => s + m.value, 0).toLocaleString()}
          </strong>
          <small className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Items across all pipeline stages
          </small>
        </GlassPanel>
      </GlassPanel>

      {/* PipelineStageCards */}
      <section className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1" aria-label="Pipeline stages" style={entranceStyle(1)}>
        {stages.map((stage, i) => {
          const count = pipelineCounts[stage.key as keyof typeof pipelineCounts];
          const Icon = stage.icon;
          return (
            <GlassPanel
              key={stage.key}
              variant="subtle"
              radius="lg"
              className="p-4 grid gap-2 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
              style={{
                borderLeft: `4px solid ${stage.color}`,
                ...entranceStyle(i + 1),
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  {stage.label}
                </span>
                <Icon className="size-4 shrink-0" style={{ color: stage.color }} aria-hidden="true" />
              </div>
              <span className="text-[32px] font-bold leading-none tracking-[-0.02em]" style={{ color: stage.color }}>
                {count.toLocaleString()}
              </span>
              {stage.key === "pending" && count > 0 && (
                <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: "var(--sh-warning)" }}>
                  <AlertCircle size={11} />
                  Needs attention
                </span>
              )}
            </GlassPanel>
          );
        })}
      </section>

      {/* ActiveQueue */}
      <GlassPanel variant="subtle" radius="lg" className="overflow-hidden" style={entranceStyle(5)}>
        <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2" style={{ borderBottom: "1px solid var(--sh-glass-border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--sh-info)" }}>
              Active Queue
            </span>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--sh-info-bg)", color: "var(--sh-info)" }}>
              {data.requests.length} items
            </span>
          </div>
          <Link href="/staff/requests" className="text-[12px] font-semibold flex items-center gap-1" style={{ color: "var(--sh-info)" }}>
            View all
            <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid">
          {data.requests.length > 0 ? (
            data.requests.map((req, i) => {
              const priority = detectPriority(req.meta);
              const pc = priorityConfig[priority];
              return (
                <div
                  key={req.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[var(--sh-glass-hover)]"
                  style={{ borderBottom: i < data.requests.length - 1 ? "1px solid var(--sh-glass-border)" : "none" }}
                >
                  <div className="mt-1.5 size-2 rounded-full shrink-0" style={{ background: pc.color }} title={pc.label} />
                  <div className="flex-1 min-w-0">
                    <strong className="text-[14px] font-semibold block truncate" style={{ color: "var(--ink)" }}>
                      {req.title}
                    </strong>
                    <p className="m-0 text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>
                      {req.subtitle}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[11px] font-semibold" style={{ color: pc.color }}>{pc.label}</span>
                    {req.meta && (
                      <p className="m-0 text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{req.meta}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4">
              <EmptyState variant="empty" message="No items in queue — all caught up!" />
            </div>
          )}
        </div>
      </GlassPanel>

      {/* SplitPanel: Schedule + Activity Feed */}
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1" style={entranceStyle(6)}>
        {/* Schedule Panel */}
        <GlassPanel variant="subtle" radius="lg" className="overflow-hidden p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: "var(--sh-info)" }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--sh-info)" }}>
                Today
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-3 py-2 px-3" style={{ borderRadius: 8, background: "var(--sh-glass-bg)" }}>
              <span className="text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded" style={{ background: "var(--sh-info-bg)", color: "var(--sh-info)" }}>10:00</span>
              <div className="min-w-0">
                <span className="text-[13px] font-semibold block" style={{ color: "var(--ink)" }}>Start shift</span>
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Begin daily operations</span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2 px-3 opacity-50">
              <span className="text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded" style={{ background: "var(--sh-glass-bg)", color: "var(--muted)" }}>14:00</span>
              <div className="min-w-0">
                <span className="text-[13px] font-semibold block" style={{ color: "var(--ink)" }}>Team standup</span>
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Daily sync</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--sh-glass-border)" }}>
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>
              <Users size={11} className="inline mr-1" />
              2/5 staff on shift
            </span>
          </div>
        </GlassPanel>

        {/* Activity Feed */}
        <GlassPanel variant="subtle" radius="lg" className="overflow-hidden p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color: "var(--sh-info)" }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--sh-info)" }}>
                Recent Activity
              </span>
            </div>
          </div>
          <div className="grid gap-1">
            {data.stories.length > 0 ? (
              data.stories.slice(0, 4).map((story) => (
                <div key={story.id} className="flex items-start gap-2 py-1.5">
                  <span className="text-[14px] shrink-0 mt-0.5">🔄</span>
                  <div className="min-w-0">
                    <span className="text-[12px] block" style={{ color: "var(--ink)" }}>
                      <strong>{story.title}</strong>
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {story.meta ?? story.subtitle}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3">
                <EmptyState variant="empty" message="No recent activity" />
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
