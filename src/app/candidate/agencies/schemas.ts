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
