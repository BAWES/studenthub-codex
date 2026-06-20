import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listClientsSchema = z.object({
  name: z.string().optional(),
  staff_id: z.number().int().positive().optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getClientSchema = z.object({
  id: z.number().int().positive(),
});
export const createClientSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(255),
  common_name_en: z.string().max(255).optional(),
  common_name_ar: z.string().max(255).optional(),
  description_en: z.string().max(65535).optional(),
  description_ar: z.string().max(65535).optional(),
  website: z.string().max(65535).optional(),
  email: z.string().max(225).optional(),
  hourly_rate: z.number().positive().optional(),
  bonus_commission: z.number().min(0).optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().length(3).optional(),
});
export const updateClientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  common_name_en: z.string().max(255).optional(),
  common_name_ar: z.string().max(255).optional(),
  description_en: z.string().max(65535).optional(),
  description_ar: z.string().max(65535).optional(),
  website: z.string().max(65535).optional(),
  email: z.string().max(225).optional(),
  hourly_rate: z.number().positive().optional(),
  bonus_commission: z.number().min(0).optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().length(3).optional(),
  staff_id: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single client list item.
 */
export const clientListItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_approved_to_hire: z.boolean(),
  company_status_override: z.boolean(),
  company_created_at: z.date(),
  company_updated_at: z.date(),
  country_id: z.number().int().nullable(),
  currency_code: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  parent_company_id: z.number().int().nullable(),
  deleted: z.number().int(),
});

/**
 * Schema for the listClients response.
 */
export const listClientsResultSchema = z.object({
  clients: z.array(clientListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for a single client detail (includes extended fields).
 */
export const clientDetailSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_description_en: z.string().nullable(),
  company_description_ar: z.string().nullable(),
  company_website: z.string().nullable(),
  company_email: z.string().nullable(),
  company_logo: z.string().nullable(),
  commercial_licence: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_approved_to_hire: z.boolean(),
  company_status_override: z.boolean(),
  company_followup: z.boolean(),
  company_followup_interval_weeks: z.number().int().nullable(),
  company_created_at: z.date(),
  company_updated_at: z.date(),
  last_request_datetime: z.date().nullable(),
  last_payment_datetime: z.date().nullable(),
  country_id: z.number().int().nullable(),
  currency_code: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  parent_company_id: z.number().int().nullable(),
  total_candidate: z.union([z.number().int(), z.bigint()]).nullable(),
  no_of_active_requests: z.number().int().nullable(),
  deleted: z.number().int(),
});

/**
 * Schema for the getClient response — a single client detail or null.
 */
export const getClientResultSchema = clientDetailSchema.nullable();

/**
 * Schema for the createClient and updateClient response.
 */
export const clientMutationResultSchema = z.object({
  company_id: z.number().int(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListClientsInput = z.input<typeof listClientsSchema>;
export type CreateClientInput = z.input<typeof createClientSchema>;
export type UpdateClientInput = z.input<typeof updateClientSchema>;

export type ClientListItem = z.output<typeof clientListItemSchema>;
export type ClientDetail = z.output<typeof clientDetailSchema>;
export type ListClientsResult = z.output<typeof listClientsResultSchema>;
