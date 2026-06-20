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
// Exported types
// ---------------------------------------------------------------------------

export type AgentHealthMetric = z.output<typeof agentHealthMetricSchema>;
export type AgentHealthData = z.output<typeof agentHealthDataSchema>;
export type AgentsHealthData = z.output<typeof agentsHealthDataSchema>;
