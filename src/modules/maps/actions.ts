"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const geocodeSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.enum(["country", "area"]).optional().default("area"),
});

const reverseGeocodeSchema = z.object({
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
// Types
// ---------------------------------------------------------------------------

export type GeocodeResult = {
  uuid: string;
  name: string;
  nameAr: string | null;
  type: "country" | "area";
  countryId: number | null;
  latitude: number | null;
  longitude: number | null;
  iso: string | null;
  emoji: string | null;
};

export type ReverseGeocodeResult = {
  uuid: string;
  name: string;
  nameAr: string | null;
  type: "area";
  countryName: string | null;
  latitude: number;
  longitude: number;
  distance: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate approximate distance in km between two lat/lng points
 * using the Haversine formula.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toGeocodeResult(
  raw: any,
  type: "country" | "area",
): GeocodeResult {
  if (type === "country") {
    return {
      uuid: String(raw.country_id),
      name: raw.country_name_en ?? "",
      nameAr: raw.country_name_ar ?? null,
      type,
      countryId: raw.country_id,
      latitude: null, // countries don't have lat/lng in this schema
      longitude: null,
      iso: raw.iso ?? null,
      emoji: raw.emoji ?? null,
    };
  }

  // Area
  return {
    uuid: raw.area_uuid ?? "",
    name: raw.area_name_en ?? "",
    nameAr: raw.area_name_ar ?? null,
    type,
    countryId: raw.country_id ?? null,
    latitude: raw.area_latitude ? Number(raw.area_latitude) : null,
    longitude: raw.area_longitude ? Number(raw.area_longitude) : null,
    iso: null,
    emoji: null,
  };
}

// ---------------------------------------------------------------------------
// geocode
// ---------------------------------------------------------------------------

/**
 * Search for countries or areas by name (forward geocoding).
 * Mirrors legacy Yii2 GoogleMapController::actionGeocode().
 */
export async function geocode(
  params: FormData | z.input<typeof geocodeSchema>,
): Promise<GeocodeResult[]> {
  await requireCapability("candidate.search");

  const raw =
    params instanceof FormData
      ? {
          query: params.get("query"),
          limit: params.get("limit"),
          type: params.get("type"),
        }
      : params;

  const parsed = geocodeSchema.safeParse(raw);
  if (!parsed.success) {
    return [];
  }

  const { query, limit, type } = parsed.data;

  if (type === "country") {
    const countries = await prisma.country.findMany({
      where: {
        OR: [
          { country_name_en: { contains: query } },
          { country_name_ar: { contains: query } },
          { iso: { contains: query } },
        ],
      },
      take: limit,
      orderBy: { country_name_en: "asc" },
    });

    return countries.map((c) => toGeocodeResult(c, "country"));
  }

  // Search areas
  const areas = await prisma.area.findMany({
    where: {
      OR: [
        { area_name_en: { contains: query } },
        { area_name_ar: { contains: query } },
      ],
    },
    take: limit,
    orderBy: { area_name_en: "asc" },
  });

  return areas.map((a) => toGeocodeResult(a, "area"));
}

// ---------------------------------------------------------------------------
// reverseGeocode
// ---------------------------------------------------------------------------

/**
 * Find the nearest areas to a given coordinate (reverse geocoding).
 * Uses Haversine distance calculation.
 * Mirrors legacy Yii2 GoogleMapController::actionReverseGeocode().
 */
export async function reverseGeocode(
  params: FormData | z.input<typeof reverseGeocodeSchema>,
): Promise<ReverseGeocodeResult[]> {
  await requireCapability("candidate.search");

  const raw =
    params instanceof FormData
      ? {
          latitude: params.get("latitude"),
          longitude: params.get("longitude"),
          radius: params.get("radius"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = reverseGeocodeSchema.safeParse(raw);
  if (!parsed.success) {
    return [];
  }

  const { latitude, longitude, radius, limit } = parsed.data;

  // Fetch all areas with coordinates — the DB is small enough for in-memory calc
  // In production with 50K+ areas, consider PostGIS or a spatial index.
  const areas = await prisma.area.findMany({
    where: {
      area_latitude: { not: null },
      area_longitude: { not: null },
    },
    include: {
      country: { select: { country_name_en: true } },
    },
  });

  // Calculate distance and filter by radius
  const nearby: ReverseGeocodeResult[] = [];

  for (const area of areas) {
    const dist = haversineDistance(
      latitude,
      longitude,
      Number(area.area_latitude),
      Number(area.area_longitude),
    );

    if (dist <= radius) {
      nearby.push({
        uuid: area.area_uuid,
        name: area.area_name_en,
        nameAr: area.area_name_ar ?? null,
        type: "area",
        countryName: area.country?.country_name_en ?? null,
        latitude: Number(area.area_latitude),
        longitude: Number(area.area_longitude),
        distance: Math.round(dist * 100) / 100,
      });
    }
  }

  // Sort by distance ascending, limit results
  return nearby.sort((a, b) => a.distance - b.distance).slice(0, limit);
}
