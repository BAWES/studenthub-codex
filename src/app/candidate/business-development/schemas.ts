import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listBusinessDevelopmentSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getBusinessDevelopmentSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

export const createBusinessDevelopmentSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_email: z.string().email("Invalid email format"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_position: z.string().optional().default(""),
  phone_number: z.string().optional().default(""),
  requesting_for: z.string().optional().default(""),
  country_id: z.coerce.number().int().positive().optional(),
  currency_code: z.string().length(3).optional().default("KWD"),
  notes: z.string().optional().default(""),
});

export const updateBusinessDevelopmentSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  company_name: z.string().min(1).optional(),
  company_email: z.string().email("Invalid email format").optional(),
  contact_name: z.string().min(1).optional(),
  contact_position: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  requesting_for: z.string().optional().nullable(),
  country_id: z.coerce.number().int().positive().optional().nullable(),
  currency_code: z.string().length(3).optional(),
  notes: z.string().optional().nullable(),
});

export const deleteBusinessDevelopmentSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListBusinessDevelopmentParams = z.input<
  typeof listBusinessDevelopmentSchema
>;
export type GetBusinessDevelopmentParams = z.input<
  typeof getBusinessDevelopmentSchema
>;
export type CreateBusinessDevelopmentParams = z.input<
  typeof createBusinessDevelopmentSchema
>;
export type UpdateBusinessDevelopmentParams = z.input<
  typeof updateBusinessDevelopmentSchema
>;
export type DeleteBusinessDevelopmentParams = z.input<
  typeof deleteBusinessDevelopmentSchema
>;

export type BusinessDevelopmentItem = {
  company_request_uuid: string;
  company_name: string;
  company_email: string;
  contact_name: string;
  contact_position: string | null;
  phone_number: string | null;
  requesting_for: string | null;
  status: boolean | null;
  country_id: number | null;
  currency_code: string | null;
  country_name_en: string | null;
  country_name_ar: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListBusinessDevelopmentResult = {
  items: BusinessDevelopmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BusinessDevelopmentActionResult =
  | { success: true; uuid: string }
  | { success: false; error: string };
