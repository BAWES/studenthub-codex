"use server";

// ---------------------------------------------------------------------------
// Coder Health Metrics — admin dashboard
// ---------------------------------------------------------------------------
// Queries the Paperclip PostgreSQL database (port 54329) for Coder agent
// heartbeat runs and issue completion statistics.
//
// Coder agent UUID: eaa3c21b-a27e-40a5-a5bb-d392e5f53d95
// StudentHub company UUID: f56ea475-d349-431c-9a40-3111f1a49819
// ---------------------------------------------------------------------------

// @ts-ignore - pg is a system-level module, not in project deps
import { Pool } from "pg";
import {
  coderHealthDataSchema,
  coderHealthMetricSchema,
  coderHealthCommitSchema,
} from "./schemas";
import type { CoderHealthData, CoderHealthMetric, CoderHealthCommit } from "./schemas";

const CODER_AGENT_ID = "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95";
const COMPANY_ID = "f56ea475-d349-431c-9a40-3111f1a49819";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5433,
  user: "paperclip",
  password: "paperclip",
  database: "paperclip",
  max: 2,
  idleTimeoutMillis: 5000,
});

/**
 * Fetch Coder agent health metrics from the Paperclip DB and GitHub.
 */
export async function getCoderHealthData(): Promise<CoderHealthData> {
  const client = await pool.connect();

  try {
    // ── Heartbeat runs (24h) ──
    const hbResult = await client.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'succeeded')::int AS succeeded,
         COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
       FROM heartbeat_runs
       WHERE agent_id = $1
         AND started_at >= NOW() - INTERVAL '24 hours'`,
      [CODER_AGENT_ID],
    );
    const { total, succeeded, failed } = hbResult.rows[0] ?? { total: 0, succeeded: 0, failed: 0 };

    // ── Last heartbeat ──
    const lastResult = await client.query(
      `SELECT started_at, status
       FROM heartbeat_runs
       WHERE agent_id = $1
         AND started_at IS NOT NULL
       ORDER BY started_at DESC
       LIMIT 1`,
      [CODER_AGENT_ID],
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

    // ── Issues completed (7d) ──
    const issuesResult = await client.query(
      `SELECT title, status, updated_at::text
       FROM issues
       WHERE company_id = $1
         AND assignee_agent_id = $2
         AND status = 'done'
         AND completed_at >= NOW() - INTERVAL '7 days'
       ORDER BY completed_at DESC
       LIMIT 10`,
      [COMPANY_ID, CODER_AGENT_ID],
    );

    // ── Issues in progress ──
    const inProgressResult = await client.query(
      `SELECT title, status, updated_at::text
       FROM issues
       WHERE company_id = $1
         AND assignee_agent_id = $2
         AND status IN ('in_progress', 'in_review', 'blocked')
       ORDER BY updated_at DESC
       LIMIT 5`,
      [COMPANY_ID, CODER_AGENT_ID],
    );

    const issuesDone = issuesResult.rows.length;

    // ── Compute success rate ──
    const successRate = total > 0 ? Math.round((succeeded / total) * 100) : 0;
    const successLabel =
      successRate >= 80 ? "Good" : successRate >= 50 ? "Degraded" : "Critical";
    const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

    const heartbeatMetrics: CoderHealthMetric[] = [
      {
        label: "Heartbeat runs (24h)",
        value: fmt(total),
        note: `${fmt(succeeded)} succeeded, ${fmt(failed)} failed`,
      },
      {
        label: "Success rate (24h)",
        value: `${successRate}%`,
        note: successLabel,
      },
      {
        label: "Issues done (7d)",
        value: fmt(issuesDone),
        note: "Completed issues",
      },
      {
        label: "Last heartbeat",
        value: lastHeartbeat ?? "Never",
        note: lastRun?.status ?? "—",
      },
    ];

    // ── Recent commits via GitHub API ──
    let recentCommits: CoderHealthCommit[] = [];
    try {
      const token = process.env.GITHUB_TOKEN || "";
      if (token) {
        const url =
          "https://api.github.com/search/commits?" +
          new URLSearchParams({
            q: "repo:BAWES/studenthub-codex author:Coder+agent+committer-date:>7d",
            sort: "committer-date",
            order: "desc",
            per_page: "5",
          });

        const res = await fetch(url, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json,application/vnd.github.cloak-preview",
          },
          next: { revalidate: 300 },
        });

        if (res.ok) {
          const body = (await res.json()) as {
            items?: Array<{
              sha: string;
              commit: { message: string; committer: { date: string } };
            }>;
          };
          recentCommits = (body.items ?? []).map((item) => ({
            sha: item.sha.slice(0, 7),
            message: item.commit.message.split("\n")[0],
            date: new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
            }).format(new Date(item.commit.committer.date)),
          }));
        }
      }
    } catch {
      // Non-critical — GitHub API is optional for this dashboard section
    }

    // Combine done + in_progress into a single recent issues list
    const recentIssues = [
      ...issuesResult.rows.map((r: { title: string; status: string; updated_at: string }) => ({
        title: r.title,
        status: r.status,
        updatedAt: r.updated_at
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
            }).format(new Date(r.updated_at))
          : "",
      })),
      ...inProgressResult.rows.map((r: { title: string; status: string; updated_at: string }) => ({
        title: r.title,
        status: r.status,
        updatedAt: r.updated_at
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
            }).format(new Date(r.updated_at))
          : "",
      })),
    ];

    // Validate output shape
    const result: CoderHealthData = {
      heartbeatMetrics,
      recentIssues,
      recentCommits,
      lastHeartbeat,
    };
    const validated = coderHealthDataSchema.safeParse(result);
    if (!validated.success) {
      console.error(
        "[coder-health] getCoderHealthData output validation failed:",
        validated.error.issues,
      );
    }

    return result;
  } finally {
    client.release();
  }
}
