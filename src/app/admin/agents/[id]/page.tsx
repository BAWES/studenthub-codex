import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getAgentById } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  running: "#22c55e",
  idle: "#6b7280",
  error: "#ef4444",
  terminated: "#9ca3af",
  paused: "#f59e0b",
};

const SUCCESS_LABELS: Record<string, string> = {
  succeeded: "Succeeded",
  failed: "Failed",
  cancelled: "Cancelled",
  queued: "Queued",
  running: "Running",
};

export default async function AdminAgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  // Validate UUID format before calling the action
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const data = await getAgentById({ agentId: id });

  if (!data.agent) {
    notFound();
  }

  const agent = data.agent;

  const statusColor = STATUS_COLORS[agent.status] ?? "#6b7280";

  const hbSuccessLabel =
    agent.heartbeatSuccessRate >= 80
      ? "Good"
      : agent.heartbeatSuccessRate >= 50
        ? "Degraded"
        : "Critical";

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Agents"
        title={agent.name}
        metrics={[
          {
            label: "Status",
            value: agent.status,
            note: "",
          },
          {
            label: "Heartbeat Runs (24h)",
            value: String(agent.heartbeatRuns24h),
            note: `${agent.heartbeatRunsSucceeded} ok, ${agent.heartbeatRunsFailed} fail`,
          },
          {
            label: "Success Rate",
            value: `${agent.heartbeatSuccessRate}%`,
            note: hbSuccessLabel,
          },
          {
            label: "Issues Done (7d)",
            value: String(agent.issuesDone7d),
            note: `${agent.issuesInProgress} in progress`,
          },
        ]}
      >
        <DetailSection
          title="Agent Details"
          facts={[
            { label: "Name", value: agent.name },
            { label: "Role", value: agent.role },
            {
              label: "Status",
              value: (
                <span className="font-semibold" style={{ color: statusColor } as React.CSSProperties}>
                  {agent.status}
                </span>
              ),
            },
            { label: "Title", value: agent.title ?? "—" },
            { label: "Icon", value: agent.icon ?? "—" },
            { label: "Reports To", value: agent.reportsTo ?? "—" },
            {
              label: "Last Heartbeat",
              value: agent.lastHeartbeatAt
                ? formatDate(new Date(agent.lastHeartbeatAt))
                : "—",
            },
            {
              label: "Created",
              value: formatDate(new Date(agent.createdAt)),
            },
            {
              label: "Updated",
              value: formatDate(new Date(agent.updatedAt)),
            },
            ...(agent.pauseReason
              ? [{ label: "Pause Reason", value: agent.pauseReason }]
              : []),
          ]}
        />

        <DetailSection
          title="Heartbeat Performance"
          facts={[
            { label: "Runs (24h)", value: String(agent.heartbeatRuns24h) },
            {
              label: "Succeeded",
              value: String(agent.heartbeatRunsSucceeded),
            },
            { label: "Failed", value: String(agent.heartbeatRunsFailed) },
            { label: "Success Rate", value: `${agent.heartbeatSuccessRate}%` },
            {
              label: "Last Run Status",
              value: agent.lastRunStatus
                ? (SUCCESS_LABELS[agent.lastRunStatus] ?? agent.lastRunStatus)
                : "—",
            },
            {
              label: "Last Run Start",
              value: agent.lastRunStartedAt
                ? formatDate(new Date(agent.lastRunStartedAt))
                : "—",
            },
            {
              label: "Last Run Error",
              value: agent.lastRunError ?? "—",
            },
          ]}
        />

        <DetailSection
          title="Issue Performance"
          facts={[
            { label: "Done (7d)", value: String(agent.issuesDone7d) },
            {
              label: "In Progress",
              value: String(agent.issuesInProgress),
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/agents" as Route}>
            <Button variant="outline">Back to Agents</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
