import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listAgenciesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
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

// Input types
export type ListAgenciesInput = z.input<typeof listAgenciesSchema>;
export type GetAgencyInput = z.input<typeof getAgencySchema>;
export type CreateAgencyInput = z.input<typeof createAgencySchema>;
export type UpdateAgencyInput = z.input<typeof updateAgencySchema>;
export type DeleteAgencyInput = z.input<typeof deleteAgencySchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const agencyItemSchema = z.object({
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
  company_created_at: z.coerce.date().nullable(),
  company_updated_at: z.coerce.date().nullable(),
});

export const listAgenciesResultSchema = z.object({
  items: z.array(agencyItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const agencyActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), companyId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type AgencyItem = z.output<typeof agencyItemSchema>;
export type ListAgenciesResult = z.output<typeof listAgenciesResultSchema>;
export type AgencyActionResult = z.output<typeof agencyActionResultSchema>;
