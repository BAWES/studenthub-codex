import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/clients actions
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
export type ListClientsInput = z.input<typeof listClientsSchema>;
export type CreateClientInput = z.input<typeof createClientSchema>;
export type UpdateClientInput = z.input<typeof updateClientSchema>;
export type ClientListItem = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_email: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_approved_to_hire: boolean;
  company_status_override: boolean;
  company_created_at: Date;
  company_updated_at: Date;
  country_id: number | null;
  currency_code: string | null;
  staff_id: number | null;
  parent_company_id: number | null;
  deleted: number;
};
export type ClientDetail = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_description_en: string | null;
  company_description_ar: string | null;
  company_website: string | null;
  company_email: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_approved_to_hire: boolean;
  company_status_override: boolean;
  company_followup: boolean;
  company_followup_interval_weeks: number | null;
  company_created_at: Date;
  company_updated_at: Date;
  last_request_datetime: Date | null;
  last_payment_datetime: Date | null;
  country_id: number | null;
  currency_code: string | null;
  staff_id: number | null;
  parent_company_id: number | null;
  total_candidate: bigint | null;
  no_of_active_requests: number | null;
  deleted: number;
};
export type ListClientsResult = {
  clients: ClientListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
