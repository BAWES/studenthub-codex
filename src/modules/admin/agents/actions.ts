"use server";

// ---------------------------------------------------------------------------
// Admin Agents Monitoring — health metrics for all Paperclip agents
// ---------------------------------------------------------------------------
// Queries the Paperclip PostgreSQL database for all active agent heartbeat
// runs, issue completion statistics, and status.
// ---------------------------------------------------------------------------

import { Pool } from "pg";
import {
  agentHealthMetricSchema,
  agentHealthDataSchema,
  agentsHealthDataSchema,
  type AgentHealthMetric,
  type AgentHealthData,
  type AgentsHealthData,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/agents] ${source} output failed:`, error);
}

const COMPANY_ID = "f56ea475-d349-431c-9a40-3111f1a49819";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "paperclip",
  password: "paperclip",
  database: "paperclip",
  max: 2,
  idleTimeoutMillis: 5000,
});

/* ── Queries ─────────────────────────────────────────────────────────── */

/**
 * Fetch health metrics for ALL active agents from the Paperclip DB.
 */
export async function getAllAgentsHealth(): Promise<AgentsHealthData> {
  const client = await pool.connect();

  try {
    // Get all active agents
    const agentsResult = await client.query(
      `SELECT id, name, status, role
       FROM agents
       WHERE status IN ('running', 'idle', 'error')
       ORDER BY name`,
    );

    const agents: AgentHealthData[] = [];

    for (const agent of agentsResult.rows) {
      const { id, name, status, role } = agent;

      // Heartbeat runs in last 24h
      const hbResult = await client.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE status = 'succeeded')::int AS succeeded,
           COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
         FROM heartbeat_runs
         WHERE agent_id = $1
           AND started_at >= NOW() - INTERVAL '24 hours'`,
        [id],
      );

      const { total, succeeded, failed } = hbResult.rows[0] ?? {
        total: 0,
        succeeded: 0,
        failed: 0,
      };

      // Last heartbeat
      const lastResult = await client.query(
        `SELECT started_at, status
         FROM heartbeat_runs
         WHERE agent_id = $1
           AND started_at IS NOT NULL
         ORDER BY started_at DESC
         LIMIT 1`,
        [id],
      );

      const lastRun = lastResult.rows[0] ?? null;
      const lastHeartbeat = lastRun
        ? new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(lastRun.started_at))
        : null;

      // Issues done (7d)
      const issuesDoneResult = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM issues
         WHERE company_id = $1
           AND assignee_agent_id = $2
           AND status = 'done'
           AND (completed_at >= NOW() - INTERVAL '7 days' OR completed_at IS NULL)`,
        [COMPANY_ID, id],
      );

      const issuesDone = issuesDoneResult.rows[0]?.count ?? 0;

      // Issues in progress
      const inProgressResult = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM issues
         WHERE company_id = $1
           AND assignee_agent_id = $2
           AND status IN ('in_progress', 'in_review', 'todo')`,
        [COMPANY_ID, id],
      );

      const issuesInProgress = inProgressResult.rows[0]?.count ?? 0;

      // Compute success rate
      const successRate = total > 0
        ? Math.round((succeeded / total) * 100)
        : 0;
      const successLabel =
        successRate >= 80
          ? "Good"
          : successRate >= 50
            ? "Degraded"
            : "Critical";

      const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

      const heartbeatMetrics: AgentHealthMetric[] = [
        {
          label: "Runs (24h)",
          value: fmt(total),
          note: `${fmt(succeeded)} ok, ${fmt(failed)} fail`,
        },
        {
          label: "Success rate",
          value: `${successRate}%`,
          note: successLabel,
        },
        {
          label: "Issues done (7d)",
          value: fmt(issuesDone),
          note: "Completed issues",
        },
        {
          label: "Open issues",
          value: fmt(issuesInProgress),
          note: "In todo/in_progress/in_review",
        },
      ];

      agents.push({
        id,
        name,
        status,
        role,
        heartbeatMetrics,
        lastHeartbeat,
        issuesDone,
        issuesInProgress,
      });
    }

    const result = { agents };

    // Output validation — log mismatches without throwing
    const agentsParsed = agentsHealthDataSchema.safeParse(result);
    if (!agentsParsed.success) {
      logOutputError("getAllAgentsHealth", agentsParsed.error.issues);
    }

    return result;
  } finally {
    client.release();
  }
}

// Re-export types for backward compatibility
export type { AgentHealthData, AgentHealthMetric, AgentsHealthData } from "./schemas";
