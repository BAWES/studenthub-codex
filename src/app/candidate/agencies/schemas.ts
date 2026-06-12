import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listAgenciesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export const getAgencySchema = z.object({
  companyId: z.coerce.number().int().positive("Company ID is required"),
});

export const createAgencySchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  companyWebsite: z.string().optional().or(z.literal("")),
  commercialLicence: z.string().optional().or(z.literal("")),
});

export const updateAgencySchema = z.object({
  companyId: z.coerce.number().int().positive("Company ID is required"),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  companyWebsite: z.string().optional().or(z.literal("")),
  commercialLicence: z.string().optional().or(z.literal("")),
});

export const deleteAgencySchema = z.object({
  companyId: z.coerce.number().int().positive("Company ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation — Zod schemas for server action return types
// ---------------------------------------------------------------------------

/**
 * Matches the AgencyItem type shape.
 */
export const agencyItemOutputSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  company_logo: z.string().nullable(),
  commercial_licence: z.string().nullable(),
  total_candidate: z.number().int().nullable(),
  no_of_active_requests: z.number().int().nullable(),
  country_id: z.number().int().nullable(),
  company_created_at: z.date().nullable(),
  company_updated_at: z.date().nullable(),
});

/**
 * Matches the AgencyActionResult discriminated union.
 */
export const agencyActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), companyId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

/**
 * Paginated agencies list output.
 */
export const listAgenciesOutputSchema = z.object({
  items: z.array(agencyItemOutputSchema),
  total: z.number().nonnegative(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

/**
 * Slim list result as returned by the route-level listAgencies action.
 */
export const listAgenciesResultOutputSchema = z.object({
  items: z.array(agencyItemOutputSchema),
  total: z.number().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAgenciesInput = z.input<typeof listAgenciesSchema>;
export type GetAgencyInput = z.input<typeof getAgencySchema>;
export type CreateAgencyInput = z.input<typeof createAgencySchema>;
export type UpdateAgencyInput = z.input<typeof updateAgencySchema>;
export type DeleteAgencyInput = z.input<typeof deleteAgencySchema>;

export type AgencyItem = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_email: string | null;
  company_website: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  total_candidate: number | null;
  no_of_active_requests: number | null;
  country_id: number | null;
  company_created_at: Date | null;
  company_updated_at: Date | null;
};

export type AgencyActionResult =
  | { success: true; companyId: number }
  | { success: false; error: string };
