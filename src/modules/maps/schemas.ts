import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
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

/**
 * Schema for a single geocode result item.
 */
export const geocodeResultItemSchema = z.object({
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

/**
 * Schema for the geocode response (array of results).
 */
export const geocodeResultSchema = z.array(geocodeResultItemSchema);

/**
 * Schema for a single reverse-geocode result item.
 */
export const reverseGeocodeResultItemSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  type: z.literal("area"),
  countryName: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  distance: z.number(),
});

/**
 * Schema for the reverseGeocode response (array of results).
 */
export const reverseGeocodeResultSchema = z.array(reverseGeocodeResultItemSchema);

// ---------------------------------------------------------------------------
// Types derived from schemas
// ---------------------------------------------------------------------------

export type GeocodeParams = z.input<typeof geocodeSchema>;
export type ReverseGeocodeParams = z.input<typeof reverseGeocodeSchema>;

export type GeocodeResult = z.output<typeof geocodeResultItemSchema>;
export type ReverseGeocodeResult = z.output<typeof reverseGeocodeResultItemSchema>;
