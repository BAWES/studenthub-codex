import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const fulltimerListItemSchema = z.object({
  fulltimer_uuid: z.string(),
  fulltimer_name: z.string(),
  fulltimer_email: z.string(),
  fulltimer_phone: z.string().nullable(),
  fulltimer_employed: z.boolean().nullable(),
  fulltimer_current_salary: z.string().nullable(),
  fulltimer_expected_salary: z.string().nullable(),
  fulltimer_created_datetime: z.string(),
  country_name: z.string().nullable(),
  nationality_name: z.string().nullable(),
  university_name: z.string().nullable(),
});

export type FulltimerListItem = z.output<typeof fulltimerListItemSchema>;

export const listFulltimersResultSchema = z.object({
  records: z.array(fulltimerListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListFulltimersResult = z.output<typeof listFulltimersResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listFulltimersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(255).optional(),
});

export const getFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
});
