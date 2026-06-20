import { z } from "zod";

export const listCountriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createCountrySchema = z.object({
  countryNameEn: z.string().min(1, "English name is required").max(100),
  countryNameAr: z.string().max(100).optional(),
  nationalityNameEn: z.string().min(1, "English nationality is required").max(100),
  nationalityNameAr: z.string().max(100).optional(),
  iso: z.string().max(3).optional(),
  emoji: z.string().max(255).optional(),
  countryCode: z.coerce.number().int().optional(),
  currencyCode: z.string().max(3).optional(),
});

export const updateCountrySchema = z.object({
  countryId: z.coerce.number().int().positive("Country ID is required"),
  countryNameEn: z.string().min(1, "English name is required").max(100),
  countryNameAr: z.string().max(100).optional(),
  nationalityNameEn: z.string().min(1, "English nationality is required").max(100),
  nationalityNameAr: z.string().max(100).optional(),
  iso: z.string().max(3).optional(),
  emoji: z.string().max(255).optional(),
  countryCode: z.coerce.number().int().optional(),
  currencyCode: z.string().max(3).optional(),
});

export const deleteCountrySchema = z.object({
  countryId: z.coerce.number().int().positive("Country ID is required"),
});

export const countryItemSchema = z.object({
  country_id: z.number().int().positive(),
  country_name_en: z.string().min(1),
  country_name_ar: z.string().nullable(),
  country_nationality_name_en: z.string().min(1),
  country_nationality_name_ar: z.string().nullable(),
  iso: z.string().nullable(),
  emoji: z.string().nullable(),
  country_code: z.number().int().nullable(),
  currency_code: z.string().nullable(),
});

export const listCountriesResultSchema = z.object({
  countries: z.array(countryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const countryActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListCountriesInput = z.input<typeof listCountriesSchema>;
export type CreateCountryInput = z.input<typeof createCountrySchema>;
export type UpdateCountryInput = z.input<typeof updateCountrySchema>;
export type DeleteCountryInput = z.input<typeof deleteCountrySchema>;

export type CountryItem = z.output<typeof countryItemSchema>;
export type ListCountriesResult = z.output<typeof listCountriesResultSchema>;
export type CountryActionResponse = z.output<typeof countryActionResponseSchema>;
