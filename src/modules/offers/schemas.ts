import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

/**
 * Coerce a boolean-like string/enum value to a real boolean.
 * Handles "true"/"false"/"1"/"0" — mirrors the job/contract action pattern.
 */
const coerceBool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

export const listOffersSchema = z.object({
  status: coerceBool.optional(),
  companyId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getOfferSchema = z.object({
  offerUuid: z.string().min(1, "Offer UUID is required"),
});
export const createOfferSchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  requestUuid: z.string().min(1, "Request UUID is required"),
  areaUuid: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  positionAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  hoursPerDay: z.number().int().positive().optional(),
  daysPerWeek: z.boolean().optional(),
  compensationType: z.enum(["FIXED_PRICE", "HOURLY", "MONTHLY_SALARY"]).optional(),
  compensationAmount: z.string().optional(),
  compensationDescription: z.string().optional(),
  compensationDescriptionAr: z.string().optional(),
  minAge: z.number().int().positive().optional(),
  maxAge: z.number().int().positive().optional(),
  gender: z.boolean().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
});
export type ListOffersParams = z.input<typeof listOffersSchema>;
export type GetOfferParams = z.input<typeof getOfferSchema>;
export type CreateOfferParams = z.input<typeof createOfferSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single offer item in the list response.
 */
export const offerListItemSchema = z.object({
  job_uuid: z.string(),
  position: z.string(),
  position_ar: z.string().nullable(),
  description: z.string().nullable(),
  hours_per_day: z.number().nullable(),
  days_per_week: z.boolean().nullable(),
  status: z.boolean().nullable(),
  area_uuid: z.string().nullable(),
  request_uuid: z.string(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Schema for a full offer detail (includes compensation fields).
 */
export const offerDetailSchema = offerListItemSchema.extend({
  description_ar: z.string().nullable(),
  compensation_type: z.string().nullable(),
  compensation_amount: z.string().nullable(),
  compensation_description: z.string().nullable(),
  compensation_description_ar: z.string().nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  gender: z.boolean().nullable(),
  available_from: z.date().nullable(),
  available_to: z.date().nullable(),
});

/**
 * Schema for the listOffers response.
 */
export const listOffersResultSchema = z.object({
  offers: z.array(offerListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OfferListItem = z.output<typeof offerListItemSchema>;
export type OfferDetail = z.output<typeof offerDetailSchema>;
export type ListOffersResult = z.output<typeof listOffersResultSchema>;
