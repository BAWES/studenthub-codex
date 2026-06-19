"use server";

// ---------------------------------------------------------------------------
// Admin Agents [id] — server actions for the agent detail page
// ---------------------------------------------------------------------------
// Queries the Paperclip PostgreSQL database for a single agent's heartbeat
// and issue statistics.
// ---------------------------------------------------------------------------

import { Pool } from "pg";
import {
  getAgentByIdSchema,
  agentDetailSchema,
  type AgentDetail,
  type GetAgentByIdInput,
} from "./schemas";

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
 * Get a single agent's detail by UUID, including heartbeat and issue stats.
 */
export async function getAgentById(
  input: GetAgentByIdInput,
): Promise<AgentDetail> {
  const parsed = getAgentByIdSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { agentId } = parsed.data;
  const client = await pool.connect();

  try {
    // Get agent row
    const agentResult = await client.query(
      `SELECT id, name, role, status, title, icon, last_heartbeat_at,
              created_at, updated_at, reports_to, pause_reason, paused_at
       FROM agents
       WHERE id = $1 AND company_id = $2`,
      [agentId, COMPANY_ID],
    );

    if (agentResult.rows.length === 0) {
      const result = { agent: null };

      const outputParsed = agentDetailSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error(
          "[admin/agents] getAgentById output validation failed (not found):",
          outputParsed.error.issues,
        );
      }

      return result;
    }

    const a = agentResult.rows[0];

    // Heartbeat runs in last 24h
    const hbResult = await client.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'succeeded')::int AS succeeded,
         COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
       FROM heartbeat_runs
       WHERE agent_id = $1
         AND started_at >= NOW() - INTERVAL '24 hours'`,
      [agentId],
    );

    const { total, succeeded, failed } = hbResult.rows[0] ?? {
      total: 0,
      succeeded: 0,
      failed: 0,
    };

    const successRate = total > 0
      ? Math.round((succeeded / total) * 100)
      : 0;

    // Issues done (7d)
    const issuesDoneResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM issues
       WHERE company_id = $1
         AND assignee_agent_id = $2
         AND status = 'done'
         AND (completed_at >= NOW() - INTERVAL '7 days' OR completed_at IS NULL)`,
      [COMPANY_ID, agentId],
    );
    const issuesDone = issuesDoneResult.rows[0]?.count ?? 0;

    // Issues in progress
    const inProgressResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM issues
       WHERE company_id = $1
         AND assignee_agent_id = $2
         AND status IN ('in_progress', 'in_review', 'todo')`,
      [COMPANY_ID, agentId],
    );
    const issuesInProgress = inProgressResult.rows[0]?.count ?? 0;

    // Last run
    const lastRunResult = await client.query(
      `SELECT status, started_at, error
       FROM heartbeat_runs
       WHERE agent_id = $1
         AND started_at IS NOT NULL
       ORDER BY started_at DESC
       LIMIT 1`,
      [agentId],
    );

    const lastRun = lastRunResult.rows[0] ?? null;

    const fmtDate = (d: Date | string | null): string | null => {
      if (!d) return null;
      return new Date(d).toISOString();
    };

    const result = {
      agent: {
        id: a.id,
        name: a.name,
        role: a.role,
        status: a.status,
        title: a.title ?? null,
        icon: a.icon ?? null,
        lastHeartbeatAt: fmtDate(a.last_heartbeat_at),
        createdAt: fmtDate(a.created_at) ?? new Date().toISOString(),
        updatedAt: fmtDate(a.updated_at) ?? new Date().toISOString(),
        reportsTo: a.reports_to ?? null,
        pauseReason: a.pause_reason ?? null,
        pausedAt: fmtDate(a.paused_at),
        heartbeatRuns24h: total,
        heartbeatRunsSucceeded: succeeded,
        heartbeatRunsFailed: failed,
        heartbeatSuccessRate: successRate,
        issuesDone7d: issuesDone,
        issuesInProgress,
        lastRunStatus: lastRun?.status ?? null,
        lastRunStartedAt: fmtDate(lastRun?.started_at),
        lastRunError: lastRun?.error ?? null,
      },
    };

    // Output validation
    const outputParsed = agentDetailSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/agents] getAgentById output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } finally {
    client.release();
  }
}
