import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/company-requests actions
// ---------------------------------------------------------------------------
// DB table: company_request
// PK:       company_request_uuid (String @db.Char(60))
// Fields:   company_name, company_email, contact_name, contact_position,
//           phone_number, requesting_for, currency_code, country_id,
//           status (Boolean 0=pending, 1=approved), created_at, updated_at
//
// Prisma model: company_request (auto-generated from schema)
// Relations:
//   - contact?: contact    @relation(fields: [contact_uuid], references: [contact_uuid])
//   - country?: country    @relation(fields: [country_id], references: [country_id])
//   - campaign?: campaign  @relation(fields: [utm_uuid], references: [utm_uuid])
// ---------------------------------------------------------------------------

export const listCompanyRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  countryId: z.coerce.number().int().positive().optional(),
  status: z.enum(["pending", "approved"]).optional(),
});

export const getCompanyRequestSchema = z.object({
  companyRequestUuid: z.string().min(1, "Company request UUID is required"),
});

export const updateCompanyRequestStatusSchema = z.object({
  companyRequestUuid: z.string().min(1, "Company request UUID is required"),
  status: z.enum(["pending", "approved"]),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single company request row in the listing.
 */
export const companyRequestRowSchema = z.object({
  company_request_uuid: z.string().min(1),
  company_name: z.string().nullable(),
  company_email: z.string().nullable(),
  contact_name: z.string().nullable(),
  contact_position: z.string().nullable(),
  phone_number: z.string().nullable(),
  requesting_for: z.string().nullable(),
  currency_code: z.string().nullable(),
  country_id: z.number().int().nullable(),
  country_name_en: z.string().nullable(),
  status: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for the full list response from listCompanyRequests.
 */
export const listCompanyRequestsOutputSchema = z.object({
  items: z.array(companyRequestRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListCompanyRequestsOutput = z.output<typeof listCompanyRequestsOutputSchema>;

/**
 * Schema for a single company request detail (same shape as row).
 */
export const getCompanyRequestOutputSchema = z.object({
  request: companyRequestRowSchema.nullable(),
});

export type GetCompanyRequestOutput = z.output<typeof getCompanyRequestOutputSchema>;

/**
 * Schema for status update action response.
 */
const companyRequestActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
});

export const updateCompanyRequestStatusOutputSchema = companyRequestActionResponseSchema;

export type UpdateCompanyRequestStatusOutput = z.output<typeof updateCompanyRequestStatusOutputSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyRequestsInput = z.input<typeof listCompanyRequestsSchema>;
export type GetCompanyRequestInput = z.input<typeof getCompanyRequestSchema>;
export type UpdateCompanyRequestStatusInput = z.input<typeof updateCompanyRequestStatusSchema>;

export type CompanyRequestRow = {
  company_request_uuid: string;
  company_name: string | null;
  company_email: string | null;
  contact_name: string | null;
  contact_position: string | null;
  phone_number: string | null;
  requesting_for: string | null;
  currency_code: string | null;
  country_id: number | null;
  country_name_en: string | null;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CompanyRequestDetail = {
  request: CompanyRequestRow | null;
};

export type UpdateCompanyRequestStatusResult = {
  operation: "success" | "error";
  message: string;
};
