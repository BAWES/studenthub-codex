"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  countryItemSchema,
  listCountriesResultSchema,
  listCountriesSchema,
  getCountrySchema,
  type CountryItem,
  type ListCountriesResult,
  type ListCountriesInput,
  type GetCountryInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List countries with optional name search and pagination.
 * Countries are reference data used across the platform for candidate
 * onboarding, company registration, and form dropdowns.
 */
export async function listCountries(
  params: ListCountriesInput = {},
): Promise<ListCountriesResult> {
  await requireCapability("app.access");

  const parsed = listCountriesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, page = 1, limit = 20 } = parsed.data;

  // Exclude Google Maps auto-generated countries; filter by name if provided
  const where: Record<string, unknown> = {
    country_from_google_map: false,
  };
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { country_name_en: { contains: nameFilter } },
      { country_name_ar: { contains: nameFilter } },
    ];
  }

  const [countries, total] = await Promise.all([
    prisma.country.findMany({
      where: where as any,
      orderBy: { country_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.country.count({ where: where as any }),
  ]);

  const result: ListCountriesResult = {
    countries: countries.map((c) => ({
      country_id: c.country_id,
      country_name_en: c.country_name_en,
      country_name_ar: c.country_name_ar ?? null,
      country_nationality_name_en: c.country_nationality_name_en,
      country_nationality_name_ar: c.country_nationality_name_ar ?? null,
      country_from_google_map: c.country_from_google_map ?? null,
      iso: c.iso ?? null,
      emoji: c.emoji ?? null,
      country_code: c.country_code ?? null,
      currency_code: c.currency_code ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listCountriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/countries] listCountries output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single country by its integer ID.
 * Mirrors the legacy Yii2 CountryController::actionView($id).
 */
export async function getCountry(
  params: GetCountryInput,
): Promise<CountryItem> {
  await requireCapability("app.access");

  const parsed = getCountrySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { id } = parsed.data;

  const country = await prisma.country.findUnique({
    where: { country_id: id },
  });

  if (!country) {
    throw new Error("Country not found");
  }

  const result: CountryItem = {
    country_id: country.country_id,
    country_name_en: country.country_name_en,
    country_name_ar: country.country_name_ar ?? null,
    country_nationality_name_en: country.country_nationality_name_en,
    country_nationality_name_ar: country.country_nationality_name_ar ?? null,
    country_from_google_map: country.country_from_google_map ?? null,
    iso: country.iso ?? null,
    emoji: country.emoji ?? null,
    country_code: country.country_code ?? null,
    currency_code: country.currency_code ?? null,
  };

  const outputParsed = countryItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/countries] getCountry output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
