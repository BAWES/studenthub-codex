"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCountriesSchema,
  createCountrySchema,
  updateCountrySchema,
  deleteCountrySchema,
  listCountriesResultSchema,
  countryActionResponseSchema,
} from "./schemas";
import type {
  ListCountriesInput,
  ListCountriesResult,
  CountryItem,
  CountryActionResponse,
} from "./schemas";

export async function listCountries(input: ListCountriesInput = {}): Promise<ListCountriesResult> {
  await requireCapability("admin.read");
  const parsed = listCountriesSchema.safeParse(input);
  if (!parsed.success) return { countries: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.country.findMany({
      orderBy: { country_name_en: "asc" },
      skip,
      take: limit,
      select: {
        country_id: true,
        country_name_en: true,
        country_name_ar: true,
        country_nationality_name_en: true,
        country_nationality_name_ar: true,
        iso: true,
        emoji: true,
        country_code: true,
        currency_code: true,
      },
    }),
    prisma.country.count(),
  ]);
  const countries = rows.map((row) => ({
    country_id: row.country_id,
    country_name_en: row.country_name_en,
    country_name_ar: row.country_name_ar,
    country_nationality_name_en: row.country_nationality_name_en,
    country_nationality_name_ar: row.country_nationality_name_ar,
    iso: row.iso,
    emoji: row.emoji,
    country_code: row.country_code,
    currency_code: row.currency_code,
  }));
  const result = { countries, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listCountriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/country] listCountries output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function getCountry(countryId: number): Promise<{ country: CountryItem | null }> {
  await requireCapability("admin.read");
  const row = await prisma.country.findUnique({
    where: { country_id: countryId },
    select: {
      country_id: true,
      country_name_en: true,
      country_name_ar: true,
      country_nationality_name_en: true,
      country_nationality_name_ar: true,
      iso: true,
      emoji: true,
      country_code: true,
      currency_code: true,
    },
  });
  if (!row) return { country: null };
  return { country: row };
}

export async function createCountry(
  nameEn: string,
  nationalityEn: string,
  nameAr?: string,
  nationalityAr?: string,
  iso?: string,
  emoji?: string,
  countryCode?: number,
  currencyCode?: string,
): Promise<CountryActionResponse> {
  await requireCapability("admin.write");
  const parsed = createCountrySchema.safeParse({
    countryNameEn: nameEn,
    countryNameAr: nameAr,
    nationalityNameEn: nationalityEn,
    nationalityNameAr: nationalityAr,
    iso,
    emoji,
    countryCode,
    currencyCode,
  });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid country data" };
  }
  try {
    await prisma.country.create({
      data: {
        country_name_en: parsed.data.countryNameEn,
        country_name_ar: parsed.data.countryNameAr ?? null,
        country_nationality_name_en: parsed.data.nationalityNameEn,
        country_nationality_name_ar: parsed.data.nationalityNameAr ?? null,
        iso: parsed.data.iso ?? null,
        emoji: parsed.data.emoji ?? null,
        country_code: parsed.data.countryCode ?? null,
        currency_code: parsed.data.currencyCode ?? null,
      },
    });
    revalidatePath("/admin/country");
    const result = { operation: "success", message: "Country created successfully" };
    const outputParsed = countryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/country] createCountry output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem creating the country, please contact us for assistance." };
    const outputParsed = countryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/country] createCountry output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function updateCountry(
  countryId: number,
  nameEn: string,
  nationalityEn: string,
  nameAr?: string,
  nationalityAr?: string,
  iso?: string,
  emoji?: string,
  countryCode?: number,
  currencyCode?: string,
): Promise<CountryActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateCountrySchema.safeParse({
    countryId,
    countryNameEn: nameEn,
    countryNameAr: nameAr,
    nationalityNameEn: nationalityEn,
    nationalityNameAr: nationalityAr,
    iso,
    emoji,
    countryCode,
    currencyCode,
  });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  }
  try {
    const existing = await prisma.country.findUnique({ where: { country_id: parsed.data.countryId }, select: { country_id: true } });
    if (!existing) return { operation: "error", message: "Country not found" };
    await prisma.country.update({
      where: { country_id: parsed.data.countryId },
      data: {
        country_name_en: parsed.data.countryNameEn,
        country_name_ar: parsed.data.countryNameAr ?? null,
        country_nationality_name_en: parsed.data.nationalityNameEn,
        country_nationality_name_ar: parsed.data.nationalityNameAr ?? null,
        iso: parsed.data.iso ?? null,
        emoji: parsed.data.emoji ?? null,
        country_code: parsed.data.countryCode ?? null,
        currency_code: parsed.data.currencyCode ?? null,
      },
    });
    revalidatePath("/admin/country");
    const result = { operation: "success", message: "Country updated successfully" };
    const outputParsed = countryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/country] updateCountry output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem updating the country, please contact us for assistance." };
    const outputParsed = countryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/country] updateCountry output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function deleteCountry(countryId: number): Promise<CountryActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteCountrySchema.safeParse({ countryId });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid country ID" };
  try {
    const existing = await prisma.country.findUnique({ where: { country_id: parsed.data.countryId }, select: { country_id: true } });
    if (!existing) return { operation: "error", message: "Country not found" };
    await prisma.country.delete({ where: { country_id: parsed.data.countryId } });
    revalidatePath("/admin/country");
    const result = { operation: "success", message: "Country deleted successfully" };
    const outputParsed = countryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/country] deleteCountry output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem deleting the country, please contact us for assistance." };
    const outputParsed = countryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/country] deleteCountry output failed:", outputParsed.error.issues);
    }
    return result;
  }
}
