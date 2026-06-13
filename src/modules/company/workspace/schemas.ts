import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas — used by the module Prisma wrapper functions
// ---------------------------------------------------------------------------

/** Schema for findContactByUuid */
export const findContactByUuidSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

/** Schema for getCompanyLinksForWorkspace */
export const getCompanyLinksForWorkspaceSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

/** Schema for getWorkspaceStatsTx */
export const getWorkspaceStatsTxSchema = z.object({
  companyIds: z.array(z.number().int().positive()),
});

/** Schema for updateContact */
export const updateContactSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
  data: z.record(z.string(), z.unknown()),
});

// ---------------------------------------------------------------------------
// Types — raw Prisma return shapes (no formatting)
// ---------------------------------------------------------------------------

export type ContactResult = {
  contact_name: string;
  contact_email: string | null;
} | null;

export type CompanyLinkWithCompany = {
  company_contact_uuid: string;
  contact_position: string | null;
  allow_access: boolean | null;
  company?: {
    company_id: number;
    company_name: string | null;
    company_email: string | null;
    no_of_active_requests: number | null;
    company_approved_to_hire: boolean | null;
  } | null;
};

export type WorkspaceStats = {
  requestCount: number;
  storeCount: number;
  noteCount: number;
  recentRequests: unknown[];
};

export type ContactUpdateResult = {
  contact_uuid: string;
};

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type FindContactByUuidInput = z.input<typeof findContactByUuidSchema>;
export type GetCompanyLinksForWorkspaceInput = z.input<typeof getCompanyLinksForWorkspaceSchema>;
export type GetWorkspaceStatsTxInput = z.input<typeof getWorkspaceStatsTxSchema>;
export type UpdateContactInput = z.input<typeof updateContactSchema>;
