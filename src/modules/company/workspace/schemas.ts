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
// Output validation schemas
// ---------------------------------------------------------------------------

/** Schema for a single contact result (findContactByUuid) */
export const contactResultOutputSchema = z.object({
  contact_name: z.string(),
  contact_email: z.string().nullable(),
}).nullable();

/** Schema for a company link with nested company data */
export const companyLinkWithCompanyOutputSchema = z.object({
  company_contact_uuid: z.string(),
  contact_position: z.string().nullable(),
  allow_access: z.boolean().nullable(),
  company: z.object({
    company_id: z.number().int(),
    company_name: z.string().nullable(),
    company_email: z.string().nullable(),
    no_of_active_requests: z.number().int().nullable(),
    company_approved_to_hire: z.boolean().nullable(),
  }).nullable(),
});

/** Schema for workspace statistics */
export const workspaceStatsOutputSchema = z.object({
  requestCount: z.number().int(),
  storeCount: z.number().int(),
  noteCount: z.number().int(),
  recentRequests: z.array(z.unknown()),
});

/** Schema for a contact update result */
export const contactUpdateResultOutputSchema = z.object({
  contact_uuid: z.string(),
});

// ---------------------------------------------------------------------------
// Output types (inferred from schemas)
// ---------------------------------------------------------------------------

export type ContactResult = z.output<typeof contactResultOutputSchema>;
export type CompanyLinkWithCompany = z.output<typeof companyLinkWithCompanyOutputSchema>;
export type WorkspaceStats = z.output<typeof workspaceStatsOutputSchema>;
export type ContactUpdateResult = z.output<typeof contactUpdateResultOutputSchema>;

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type FindContactByUuidInput = z.input<typeof findContactByUuidSchema>;
export type GetCompanyLinksForWorkspaceInput = z.input<typeof getCompanyLinksForWorkspaceSchema>;
export type GetWorkspaceStatsTxInput = z.input<typeof getWorkspaceStatsTxSchema>;
export type UpdateContactInput = z.input<typeof updateContactSchema>;
