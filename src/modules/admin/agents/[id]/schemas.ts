import { z } from "zod";

// ---------------------------------------------------------------------------
// Agent Detail schemas — single-agent detail page
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

export type AgentDetail = z.output<typeof agentDetailSchema>;
export type GetAgentByIdInput = z.input<typeof getAgentByIdSchema>;
