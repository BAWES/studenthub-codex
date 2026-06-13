import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
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

export type ListBusinessDevelopmentParams = z.input<typeof listBusinessDevelopmentSchema>;
export type GetBusinessDevelopmentParams = z.input<typeof getBusinessDevelopmentSchema>;
export type CreateBusinessDevelopmentParams = z.input<typeof createBusinessDevelopmentSchema>;
export type UpdateBusinessDevelopmentParams = z.input<typeof updateBusinessDevelopmentSchema>;
export type DeleteBusinessDevelopmentParams = z.input<typeof deleteBusinessDevelopmentSchema>;

// Re-export types from module
export type {
  BusinessDevelopmentItem,
  ListBusinessDevelopmentsResult,
  BusinessDevelopmentActionResult,
} from "@/modules/business-development/schemas";

// Re-export output schemas from module with original names for compatibility
import {
  businessDevelopmentItemSchema as _bizItemSchema,
  listBusinessDevelopmentsResultSchema as _bizListResultSchema,
  businessDevelopmentActionResultSchema as _bizActionResultSchema,
} from "@/modules/business-development/schemas";

export const businessDevelopmentItemOutputSchema = _bizItemSchema;
export const listBusinessDevelopmentResultOutputSchema = _bizListResultSchema;
export const businessDevelopmentActionResultOutputSchema = _bizActionResultSchema;
