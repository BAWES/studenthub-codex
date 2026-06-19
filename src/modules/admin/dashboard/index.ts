// ---------------------------------------------------------------------------
// Admin Dashboard - barrel exports
// ---------------------------------------------------------------------------

export {
  getPrMergeMetrics,
  getDashboardData,
} from "./actions";

export type {
  DashboardMetric,
  DashboardStatusItem,
  DashboardDataListItem,
  PrMergeMetric,
  PrMergeItem,
  DashboardData,
  CoderHealthData,
  CoderHealthMetric,
  CoderHealthCommit,
} from "./schemas";

export {
  dashboardMetricSchema,
  dashboardStatusItemSchema,
  dashboardDataListItemSchema,
  prMergeMetricSchema,
  prMergeItemSchema,
  prMergeMetricsResultSchema,
  dashboardDataSchema,
  coderHealthMetricSchema,
  coderHealthCommitSchema,
  coderHealthIssueItemSchema,
  coderHealthDataSchema,
} from "./schemas";
