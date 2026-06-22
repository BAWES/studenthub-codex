import { z } from "zod";

// ---------------------------------------------------------------------------
// Get Workspace
// ---------------------------------------------------------------------------

/**
 * Schema for fetching a company workspace by contact UUID.
 * The UUID is required and must be a non-empty string.
 */
export const getWorkspaceSchema = z.object({
  contactUuid: z
    .string({ required_error: "Contact UUID is required" })
    .min(1, "Contact UUID is required"),
});

// ---------------------------------------------------------------------------
// Update Workspace [settings]
// ---------------------------------------------------------------------------

/**
 * Schema for updating workspace settings (contact profile info).
 * The UUID is required; all other fields are optional for partial updates.
 */
export const updateWorkspaceSchema = z.object({
  contactUuid: z
    .string({ required_error: "Contact UUID is required" })
    .min(1, "Contact UUID is required"),
  contact_name: z.string().min(1, "Name is required").max(255).optional(),
  contact_email: z.string().email("Invalid email").max(225).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetWorkspaceInput = z.input<typeof getWorkspaceSchema>;
export type UpdateWorkspaceInput = z.input<typeof updateWorkspaceSchema>;

export type WorkspaceMetric = {
  label: string;
  value: number;
  note: string;
};

export type WorkspaceListItem = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
};

export type WorkspaceData = {
  contact: {
    contact_name: string;
    contact_email: string;
  } | null;
  metrics: WorkspaceMetric[];
  companies: WorkspaceListItem[];
  requests: WorkspaceListItem[];
};

export type UpdateWorkspaceResult = {
  contactUuid: string;
};
