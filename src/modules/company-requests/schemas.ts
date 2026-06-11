import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const companyRequestItemSchema = z.object({
  company_request_uuid: z.string(),
  company_name: z.string(),
  company_email: z.string(),
  contact_name: z.string(),
  contact_position: z.string().nullable(),
  phone_number: z.string().nullable(),
  requesting_for: z.string().nullable(),
  status: z.boolean().nullable(),
  currency_code: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type CompanyRequestItem = z.output<typeof companyRequestItemSchema>;

export const listCompanyRequestsResultSchema = z.object({
  requests: z.array(companyRequestItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListCompanyRequestsResult = z.output<typeof listCompanyRequestsResultSchema>;

export const companyRequestMutationResultSchema = z.object({
  operation: z.string(),
  message: z.string().optional(),
});

export type CompanyRequestMutationResult = z.output<typeof companyRequestMutationResultSchema>;
