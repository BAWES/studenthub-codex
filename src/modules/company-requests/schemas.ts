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

export const listCompanyRequestsSchema = z.object({
  status: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
});
export const approveCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
});
export const rejectCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
});
export const createCompanyRequestSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_email: z.string().email("Invalid email format"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_position: z.string().optional(),
  phone_number: z.string().optional(),
  requesting_for: z.string().optional(),
  currency_code: z.string().length(3, "Currency code must be 3 characters").optional(),
  country_id: z.coerce.number().int().positive().optional(),
  contact_receive_email: z.boolean().optional(),
});
export const updateCompanyRequestSchema = z.object({
  uuid: z.string().min(1, "Company request UUID is required"),
  company_name: z.string().min(1).optional(),
  company_email: z.string().email("Invalid email format").optional(),
  contact_name: z.string().min(1).optional(),
  contact_position: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  requesting_for: z.string().optional().nullable(),
  currency_code: z.string().length(3).optional(),
  country_id: z.coerce.number().int().positive().optional().nullable(),
  contact_receive_email: z.boolean().optional(),
  status: z.boolean().optional(),
});