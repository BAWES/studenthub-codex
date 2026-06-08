"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CountryListResult = {
  country_id: number;
  country_name_en: string;
  country_name_ar: string | null;
  iso: string | null;
  emoji: string | null;
  country_code: number | null;
  currency_code: string | null;
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const listCountriesSchema = z.object({
  nameFilter: z.string().optional(),
});

export type ListCountriesParams = z.input<typeof listCountriesSchema>;

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

/**
 * List countries filtered by name (case-insensitive), excluding Google Maps
 * auto-added countries. Mirrors the legacy Yii2 CountryController::actionList().
 *
 * @param params - Optional filter parameters
 * @returns Array of countries sorted alphabetically by English name
 */
export async function listCountries(params: ListCountriesParams = {}): Promise<CountryListResult[]> {
  await requireCapability("candidate.read.own");

  const { nameFilter } = listCountriesSchema.parse(params);

  const where: Record<string, unknown> = {
    country_from_google_map: false,
  };

  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { country_name_en: { contains: nameFilter } },
      { country_name_ar: { contains: nameFilter } },
    ];
  }

  const countries = await prisma.country.findMany({
    where,
    orderBy: { country_name_en: "asc" },
    select: {
      country_id: true,
      country_name_en: true,
      country_name_ar: true,
      iso: true,
      emoji: true,
      country_code: true,
      currency_code: true,
    },
  });

  return countries;
}
