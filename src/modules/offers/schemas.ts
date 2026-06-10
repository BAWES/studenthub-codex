import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/offers actions
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
export type OfferListItem = {
  job_uuid: string;
  position: string;
  position_ar: string | null;
  description: string | null;
  hours_per_day: number | null;
  days_per_week: boolean | null;
  status: boolean | null;
  area_uuid: string | null;
  request_uuid: string;
  created_at: Date | null;
  updated_at: Date | null;
};
export type OfferDetail = OfferListItem & {
  description_ar: string | null;
  compensation_type: string | null;
  compensation_amount: string | null;
  compensation_description: string | null;
  compensation_description_ar: string | null;
  min_age: number | null;
  max_age: number | null;
  gender: boolean | null;
  available_from: Date | null;
  available_to: Date | null;
};
export type ListOffersResult = {
  offers: OfferListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
