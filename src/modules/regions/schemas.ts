import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (moved from actions.ts)
// ---------------------------------------------------------------------------

export const listAreasSchema = z.object({
  nameFilter: z.string().optional(),
  countryId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListAreasInput = z.input<typeof listAreasSchema>;

export const getAreaSchema = z.object({
  areaUuid: z.string().min(1),
});

export type GetAreaInput = z.input<typeof getAreaSchema>;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const areaItemSchema = z.object({
  area_uuid: z.string(),
  country_id: z.number().int(),
  area_name_en: z.string(),
  area_name_ar: z.string().nullable(),
  area_latitude: z.number().nullable(),
  area_longitude: z.number().nullable(),
});

export type AreaItem = z.output<typeof areaItemSchema>;

export const listAreasResultSchema = z.object({
  areas: z.array(areaItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListAreasResult = z.output<typeof listAreasResultSchema>;
