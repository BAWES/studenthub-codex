import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/companies/[id] actions
// ---------------------------------------------------------------------------

export const updateAdminCompanySchema = z.object({
  companyId: z.coerce.number().int().positive("Company ID is required"),
  companyName: z.string().max(255).optional(),
  companyCommonNameEn: z.string().max(255).optional().nullable(),
  companyEmail: z.string().email().max(255).optional().nullable(),
  companyWebsite: z.string().url().max(255).optional().nullable(),
  companyHourlyRate: z.coerce.number().min(0).optional().nullable(),
  currencyCode: z.string().length(3).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateAdminCompanyInput = z.input<typeof updateAdminCompanySchema>;

export type AdminCompanyActionResponse = {
  operation: "success" | "error";
  message: string;
};
