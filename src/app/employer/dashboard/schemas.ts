// ---------------------------------------------------------------------------
// Employer Dashboard — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/employer/dashboard/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
  type EmployerDashboardMetric,
  type RecentApplication,
  type JobStatusBreakdown,
  type EmployerDashboardData,
} from "@/modules/employer/dashboard/schemas";
