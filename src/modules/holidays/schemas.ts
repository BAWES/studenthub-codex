import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listHolidaysSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const getHolidaySchema = z.object({
  uuid: z.string().min(1, "Holiday UUID is required"),
});

export const createHolidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  isRecurring: z.coerce.boolean().optional().default(false),
  description: z.string().optional(),
});

export const deleteHolidaySchema = z.object({
  uuid: z.string().min(1, "Holiday UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single holiday item returned from listHolidays / getHoliday / createHoliday.
 */
export const holidayItemSchema = z.object({
  holiday_uuid: z.string(),
  name: z.string(),
  date: z.string(),
  is_recurring: z.boolean(),
  description: z.string().nullable(),
  is_deleted: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for getHoliday result (item or null).
 */
export const holidayDetailSchema = holidayItemSchema.nullable();

/**
 * Schema for the listHolidays response.
 */
export const listHolidaysResultSchema = z.object({
  holidays: z.array(holidayItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the deleteHoliday response.
 */
export const deleteHolidayResultSchema = z.object({
  success: z.boolean(),
});

// ---------------------------------------------------------------------------
// Types derived from schemas
// ---------------------------------------------------------------------------

export type ListHolidaysParams = z.input<typeof listHolidaysSchema>;
export type GetHolidayParams = z.input<typeof getHolidaySchema>;
export type CreateHolidayParams = z.input<typeof createHolidaySchema>;
export type DeleteHolidayParams = z.input<typeof deleteHolidaySchema>;

export type HolidayItem = z.output<typeof holidayItemSchema>;
export type HolidayDetail = z.output<typeof holidayDetailSchema>;
export type ListHolidaysResult = z.output<typeof listHolidaysResultSchema>;
export type DeleteHolidayResult = z.output<typeof deleteHolidayResultSchema>;
