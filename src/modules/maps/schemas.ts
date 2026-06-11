import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (moved from actions.ts)
// ---------------------------------------------------------------------------

export const geocodeSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.enum(["country", "area"]).optional().default("area"),
});

export const reverseGeocodeSchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  radius: z.coerce.number().int().positive().optional().default(10),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const geocodeResultSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  type: z.enum(["country", "area"]),
  countryId: z.number().int().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  iso: z.string().nullable(),
  emoji: z.string().nullable(),
});

export const reverseGeocodeResultSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  type: z.literal("area"),
  countryName: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  distance: z.number(),
});

// ---------------------------------------------------------------------------
// Types (derived from schemas)
// ---------------------------------------------------------------------------

export type GeocodeResult = z.output<typeof geocodeResultSchema>;
export type ReverseGeocodeResult = z.output<typeof reverseGeocodeResultSchema>;
export type GeocodeParams = z.input<typeof geocodeSchema>;
export type ReverseGeocodeParams = z.input<typeof reverseGeocodeSchema>;
