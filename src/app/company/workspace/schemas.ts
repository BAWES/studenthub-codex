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
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single workspace metric row.
 */
export const workspaceMetricSchema = z.object({
  label: z.string().min(1),
  value: z.number().int().nonnegative(),
  note: z.string(),
});

/**
 * Validates a company item in the workspace overview.
 */
export const workspaceCompanyItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().min(1),
  subtitle: z.string(),
  meta: z.string().optional(),
});

/**
 * Validates a request item in the workspace overview.
 */
export const workspaceRequestItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  subtitle: z.string(),
  meta: z.string().optional(),
});

/**
 * Validates the contact object inside workspace response.
 */
export const workspaceContactSchema = z.object({
  contact_name: z.string(),
  contact_email: z.string(),
});

/**
 * Validates the full getCompanyWorkspace return shape.
 */
export const workspaceOverviewDataSchema = z.object({
  contact: workspaceContactSchema.nullable(),
  metrics: z.array(workspaceMetricSchema).length(4),
  companies: z.array(workspaceCompanyItemSchema),
  requests: z.array(workspaceRequestItemSchema),
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
