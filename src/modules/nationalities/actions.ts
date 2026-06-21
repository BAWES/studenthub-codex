"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  nationalityItemSchema,
  listNationalitiesResultSchema,
  listNationalitiesSchema,
  getNationalitySchema,
  type NationalityItem,
  type ListNationalitiesResult,
  type ListNationalitiesInput,
  type GetNationalityParams,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List nationalities with optional name filter and pagination.
 * Reads from the country table which stores nationality names alongside
 * country data. Excludes Google Maps auto-added countries.
 * Mirrors the legacy Yii2 NationalityController::actionList().
 */
export async function listNationalities(
  params: ListNationalitiesInput = {},
): Promise<ListNationalitiesResult> {
  await requireCapability("candidate.read.own");

  const parsed = listNationalitiesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {
    country_from_google_map: false,
  };

  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { country_nationality_name_en: { contains: nameFilter, mode: "insensitive" } },
      { country_nationality_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [countries, total] = await Promise.all([
    prisma.country.findMany({
      where: where as any,
      orderBy: { country_nationality_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        country_id: true,
        country_nationality_name_en: true,
        country_nationality_name_ar: true,
        country_name_en: true,
        country_name_ar: true,
        iso: true,
        emoji: true,
      },
    }),
    prisma.country.count({ where: where as any }),
  ]);

  const result: ListNationalitiesResult = {
    nationalities: countries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listNationalitiesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/nationalities] listNationalities output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single nationality by country ID. Returns null if not found
 * or if the country was auto-added by Google Maps.
 * Mirrors the legacy Yii2 NationalityController::actionView().
 */
export async function getNationality(
  params: GetNationalityParams,
): Promise<NationalityItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getNationalitySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { id } = parsed.data;

  const country = await prisma.country.findFirst({
    where: {
      country_id: id,
      country_from_google_map: false,
    },
    select: {
      country_id: true,
      country_nationality_name_en: true,
      country_nationality_name_ar: true,
      country_name_en: true,
      country_name_ar: true,
      iso: true,
      emoji: true,
    },
  });

  if (!country) return null;

  const result: NationalityItem = country;

  const outputParsed = nationalityItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/nationalities] getNationality output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
