import { z } from "zod";

// ---------------------------------------------------------------------------
// Get Workspace Data
// ---------------------------------------------------------------------------

export const getWorkspaceDataSchema = z.object({
  contactUuid: z
    .string({ required_error: "Contact UUID is required" })
    .min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkspaceDataMetric = {
  label: string;
  value: number;
  note: string;
};

export type WorkspaceDataCompany = {
  id: number | string;
  title: string;
  subtitle: string;
  meta?: string;
};

export type WorkspaceDataRequest = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
};

export type GetWorkspaceDataInput = z.input<typeof getWorkspaceDataSchema>;

/**
 * Data returned by the top-level company workspace page.
 * Mirrors the shape of getCompanyWorkspace from @/modules/workspace/data/company.
 */
export type WorkspaceOverviewData = {
  contact: { contact_name: string; contact_email: string } | null;
  metrics: WorkspaceDataMetric[];
  companies: WorkspaceDataCompany[];
  requests: WorkspaceDataRequest[];
};
