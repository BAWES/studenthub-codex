import { requireRoleCapability } from "@/modules/auth/session";
import { getAllAgentsHealth, type AgentHealthData } from "./actions";
import { GlassPanel } from "@/components/ui/glass-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

/* ── Status badge variant for agent status ─────────────────────────── */

function statusVariant(status: string): "success" | "warning" | "error" | "info" | "neutral" {
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

/* ── Agent Card ─────────────────────────────────────────────────────── */

function AgentCard({ agent, index }: { agent: AgentHealthData; index: number }) {
  return (
    <GlassPanel variant="subtle" radius="lg" className="p-5">
      {/* Agent header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="shPipelineEyebrow">{agent.role}</span>
          <h2 className="shPipelineTitle text-lg">{agent.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={statusVariant(agent.status)} size="sm" label={agent.status} />
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
          } else if (metric.label === "Runs (24h)") {
            accent = "info";
          } else if (metric.label === "Issues done (7d)") {
            accent = "success";
          } else if (metric.label === "Open issues") {
            accent = "warning";
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
    </GlassPanel>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default async function AdminAgentsPage() {
  const session = await requireRoleCapability("admin", "admin.system");

  let agents: AgentHealthData[] = [];
  let error: string | null = null;

  try {
    const data = await getAllAgentsHealth();
    agents = data.agents;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error loading agent data";
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin Workspace"
      title="Agent Health Monitoring"
      metrics={[]}
    >
      {error ? (
        <section className="shDashboardSection" aria-label="Agent health error">
          <GlassPanel variant="subtle" radius="lg" className="p-5">
            <div className="shPipelineHeader">
              <div>
                <span className="shPipelineEyebrow">Error</span>
                <h2 className="shPipelineTitle">Could not load agent data</h2>
              </div>
            </div>
            <div className="shPipelineEmpty">
              <EmptyState variant="error" message={error} />
            </div>
          </GlassPanel>
        </section>
      ) : agents.length === 0 ? (
        <section className="shDashboardSection" aria-label="No agents found">
          <GlassPanel variant="subtle" radius="lg" className="p-5">
            <div className="shPipelineHeader">
              <div>
                <span className="shPipelineEyebrow">Agents</span>
                <h2 className="shPipelineTitle">No active agents</h2>
              </div>
            </div>
            <div className="shPipelineEmpty">
              <EmptyState variant="idle" message="No agents with running/idle/error status found" />
            </div>
          </GlassPanel>
        </section>
      ) : (
        // Agent cards in responsive grid
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
