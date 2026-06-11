import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const nationalityItemSchema = z.object({
  country_id: z.number(),
  country_nationality_name_en: z.string(),
  country_nationality_name_ar: z.string().nullable(),
  country_name_en: z.string(),
  country_name_ar: z.string().nullable(),
  iso: z.string().nullable(),
  emoji: z.string().nullable(),
});

export type NationalityItem = z.output<typeof nationalityItemSchema>;

export const listNationalitiesResultSchema = z.object({
  nationalities: z.array(nationalityItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListNationalitiesResult = z.output<typeof listNationalitiesResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listNationalitiesSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListNationalitiesInput = z.input<typeof listNationalitiesSchema>;

export const getNationalitySchema = z.object({
  id: z.number().int().positive(),
});

export type GetNationalityParams = z.input<typeof getNationalitySchema>;
