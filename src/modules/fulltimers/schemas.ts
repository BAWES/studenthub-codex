import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (moved from actions.ts)
// ---------------------------------------------------------------------------

export const listFulltimersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  employed: z.enum(["true", "false"]).optional(),
});

export const getFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
});

export const createFulltimerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(255).optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  employed: z.boolean().optional(),
  gender: z.boolean().optional(),
  birthDate: z.string().optional(),
  drivingLicense: z.boolean().optional(),
  currentSalary: z.string().max(100).optional(),
  expectedSalary: z.string().max(100).optional(),
  currencyCode: z.string().length(3).optional().default("KWD"),
});

export const updateFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(255).optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  employed: z.boolean().optional(),
  gender: z.boolean().optional(),
  birthDate: z.string().optional(),
  drivingLicense: z.boolean().optional(),
  currentSalary: z.string().max(100).optional(),
  expectedSalary: z.string().max(100).optional(),
  currencyCode: z.string().length(3).optional(),
});

export const deleteFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single fulltimer list item returned from listFulltimers.
 */
export const fulltimerItemSchema = z.object({
  fulltimer_uuid: z.string(),
  fulltimer_name: z.string(),
  fulltimer_email: z.string(),
  fulltimer_phone: z.string().nullable(),
  fulltimer_employed: z.boolean().nullable(),
  nationality_id: z.number().nullable(),
  country_id: z.number().nullable(),
  university_id: z.number().nullable(),
  fulltimer_created_datetime: z.string().nullable(),
});

/**
 * Schema for a single fulltimer detail (returned from getFulltimer).
 */
export const fulltimerDetailSchema = z.object({
  fulltimer_uuid: z.string(),
  fulltimer_name: z.string(),
  fulltimer_email: z.string(),
  fulltimer_phone: z.string().nullable(),
  fulltimer_employed: z.boolean().nullable(),
  fulltimer_gender: z.boolean().nullable(),
  fulltimer_birth_date: z.string().nullable(),
  fulltimer_driving_license: z.boolean().nullable(),
  nationality_id: z.number().nullable(),
  country_id: z.number().nullable(),
  university_id: z.number().nullable(),
  fulltimer_area_uuid: z.string().nullable(),
  fulltimer_current_salary: z.string().nullable(),
  fulltimer_expected_salary: z.string().nullable(),
  fulltimer_pdf_cv: z.string().nullable(),
  currency_code: z.string().nullable(),
  fulltimer_created_datetime: z.string().nullable(),
  fulltimer_updated_datetime: z.string().nullable(),
});

/**
 * Schema for getFulltimer result (detail or null).
 */
export const fulltimerDetailOrNullSchema = fulltimerDetailSchema.nullable();

/**
 * Schema for the listFulltimers response.
 */
export const listFulltimersResultSchema = z.object({
  fulltimers: z.array(fulltimerItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types (derived from schemas)
// ---------------------------------------------------------------------------

export type FulltimerListItem = z.output<typeof fulltimerItemSchema>;
export type FulltimerDetail = z.output<typeof fulltimerDetailSchema>;
export type ListFulltimersResult = z.output<typeof listFulltimersResultSchema>;

export type ListFulltimersInput = z.input<typeof listFulltimersSchema>;
export type GetFulltimerInput = z.input<typeof getFulltimerSchema>;
export type CreateFulltimerInput = z.input<typeof createFulltimerSchema>;
export type UpdateFulltimerInput = z.input<typeof updateFulltimerSchema>;
export type DeleteFulltimerInput = z.input<typeof deleteFulltimerSchema>;
