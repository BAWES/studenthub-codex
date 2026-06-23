// ---------------------------------------------------------------------------
// Employer Dashboard — module-level barrel export
// ---------------------------------------------------------------------------

export { getEmployerDashboardData } from "./actions";
export {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
} from "./schemas";
export type {
  EmployerDashboardMetric,
  RecentApplication,
  JobStatusBreakdown,
  EmployerDashboardData,
} from "./schemas";
