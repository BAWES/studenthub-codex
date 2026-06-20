// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All schemas and types live in src/modules/company/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  workspaceMetricSchema,
  workspaceContactSchema,
  getCompanyWorkspaceSchema as getWorkspaceDataSchema,
  workspaceListItemSchema as workspaceCompanyItemSchema,
  workspaceListItemSchema as workspaceRequestItemSchema,
  workspaceOverviewOutputSchema as workspaceOverviewDataSchema,
} from "@/modules/company/schemas";

export type {
  WorkspaceDataMetric,
  WorkspaceDataCompany,
  WorkspaceDataRequest,
  GetWorkspaceDataInput,
  WorkspaceOverviewData,
} from "@/modules/company/schemas";
