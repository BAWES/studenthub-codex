import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/dashboard actions
// ---------------------------------------------------------------------------

/**
 * A single metric card shown at the top of the dashboard.
 */
export const dashboardMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.number().int().nonnegative(),
  note: z.string().optional().default(""),
});

/**
 * A status breakdown item for the pipeline section.
 */
export const dashboardStatusItemSchema = z.object({
  label: z.string().min(1, "Status label is required"),
  value: z.number().int().nonnegative(),
});

/**
 * A single row in a data list (recent candidates, companies, etc.).
 */
export const dashboardDataListItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  meta: z.string().min(1, "Meta is required"),
  amount: z.string().optional(),
  date: z.string().optional(),
  count: z.number().optional(),
});

/**
 * A single PR time-to-merge metric item.
 */
export const prMergeMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Value is required"),
  note: z.string().optional().default(""),
});

/**
 * A recent PR row in the merge-time list.
 */
export const prMergeItemSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  hours: z.number().nonnegative(),
});

/**
 * Result shape from getPrMergeMetrics.
 */
export const prMergeMetricsResultSchema = z.object({
  metrics: z.array(prMergeMetricSchema),
  recent: z.array(prMergeItemSchema),
});

/**
 * Full dashboard data payload.
 */
export const dashboardDataSchema = z.object({
  metrics: z.array(dashboardMetricSchema),
  statusMix: z.array(dashboardStatusItemSchema),
  recentCandidates: z.array(dashboardDataListItemSchema),
  recentCompanies: z.array(dashboardDataListItemSchema),
  recentRequests: z.array(dashboardDataListItemSchema),
  recentTransfers: z.array(dashboardDataListItemSchema),
  prMergeMetrics: z.array(prMergeMetricSchema),
  recentPrMergeTimes: z.array(prMergeItemSchema),
});

// ---------------------------------------------------------------------------
// Coder Health — schemas for admin dashboard Coder agent health section
// ---------------------------------------------------------------------------

/**
 * A single Coder health metric card.
 */
export const coderHealthMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
  note: z.string(),
});

/**
 * A single commit row in the Coder health section.
 */
export const coderHealthCommitSchema = z.object({
  sha: z.string().min(1, "Commit SHA is required"),
  message: z.string().min(1, "Commit message is required"),
  date: z.string().min(1, "Commit date is required"),
});

/**
 * A recent issue displayed in the Coder health section.
 */
export const coderHealthIssueItemSchema = z.object({
  title: z.string().min(1, "Issue title is required"),
  status: z.string().min(1, "Issue status is required"),
  updatedAt: z.string(),
});

/**
 * Full Coder health data payload from getCoderHealthData.
 */
export const coderHealthDataSchema = z.object({
  heartbeatMetrics: z.array(coderHealthMetricSchema),
  recentIssues: z.array(coderHealthIssueItemSchema),
  recentCommits: z.array(coderHealthCommitSchema),
  lastHeartbeat: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DashboardMetric = z.input<typeof dashboardMetricSchema>;
export type DashboardStatusItem = z.input<typeof dashboardStatusItemSchema>;
export type DashboardDataListItem = z.input<typeof dashboardDataListItemSchema>;
export type PrMergeMetric = z.input<typeof prMergeMetricSchema>;
export type PrMergeItem = z.input<typeof prMergeItemSchema>;
export type DashboardData = z.input<typeof dashboardDataSchema>;
export type CoderHealthData = z.input<typeof coderHealthDataSchema>;
export type CoderHealthMetric = z.input<typeof coderHealthMetricSchema>;
export type CoderHealthCommit = z.input<typeof coderHealthCommitSchema>;
