import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas — Agents Health
// ---------------------------------------------------------------------------

/**
 * Schema for a single agent health metric entry.
 */
export const agentHealthMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  note: z.string(),
});

/**
 * Schema for a single agent's health data.
 */
export const agentHealthDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  status: z.string().min(1),
  role: z.string().min(1),
  heartbeatMetrics: z.array(agentHealthMetricSchema),
  lastHeartbeat: z.string().nullable(),
  issuesDone: z.number().int().nonnegative(),
  issuesInProgress: z.number().int().nonnegative(),
});

/**
 * Schema for the top-level getAllAgentsHealth response.
 */
export const agentsHealthDataSchema = z.object({
  agents: z.array(agentHealthDataSchema),
});

// ---------------------------------------------------------------------------
// getAgentById schemas
// ---------------------------------------------------------------------------

/**
 * Input schema for getAgentById.
 */
export const getAgentByIdSchema = z.object({
  agentId: z.string().uuid("Agent ID must be a valid UUID"),
});

/**
 * Schema for a single agent detail response.
 */
export const agentDetailSchema = z.object({
  agent: z
    .object({
      id: z.string().uuid(),
      name: z.string().min(1),
      role: z.string().min(1),
      status: z.string().min(1),
      title: z.string().nullable(),
      icon: z.string().nullable(),
      lastHeartbeatAt: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      reportsTo: z.string().uuid().nullable(),
      pauseReason: z.string().nullable(),
      pausedAt: z.string().nullable(),
      // Heartbeat stats
      heartbeatRuns24h: z.number().int().nonnegative(),
      heartbeatRunsSucceeded: z.number().int().nonnegative(),
      heartbeatRunsFailed: z.number().int().nonnegative(),
      heartbeatSuccessRate: z.number().int().min(0).max(100),
      issuesDone7d: z.number().int().nonnegative(),
      issuesInProgress: z.number().int().nonnegative(),
      lastRunStatus: z.string().nullable(),
      lastRunStartedAt: z.string().nullable(),
      lastRunError: z.string().nullable(),
    })
    .nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type AgentHealthMetric = z.infer<typeof agentHealthMetricSchema>;
export type AgentHealthData = z.infer<typeof agentHealthDataSchema>;
export type AgentsHealthData = z.infer<typeof agentsHealthDataSchema>;
export type AgentDetail = z.infer<typeof agentDetailSchema>;
export type GetAgentByIdInput = z.input<typeof getAgentByIdSchema>;
