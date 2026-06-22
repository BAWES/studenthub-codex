import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const countryItemSchema = z.object({
  country_id: z.number(),
  country_name_en: z.string(),
  country_name_ar: z.string().nullable(),
  country_nationality_name_en: z.string(),
  country_nationality_name_ar: z.string().nullable(),
  country_from_google_map: z.boolean().nullable(),
  iso: z.string().nullable(),
  emoji: z.string().nullable(),
  country_code: z.number().nullable(),
  currency_code: z.string().nullable(),
});

export type CountryItem = z.output<typeof countryItemSchema>;

export const listCountriesResultSchema = z.object({
  countries: z.array(countryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListCountriesResult = z.output<typeof listCountriesResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listCountriesSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCountrySchema = z.object({
  id: z.number().int().positive(),
});

export type ListCountriesInput = z.input<typeof listCountriesSchema>;
export type GetCountryInput = z.input<typeof getCountrySchema>;
