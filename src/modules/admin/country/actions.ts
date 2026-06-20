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
import type { ListCountriesInput, ListCountriesResult, CountryActionResponse, CreateCountryInput, UpdateCountryInput } from "./schemas";

export async function listCountries(input: ListCountriesInput = {}): Promise<ListCountriesResult> {
  await requireCapability("admin.read");
  const parsed = listCountriesSchema.safeParse(input);
  if (!parsed.success) return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.country.findMany({
      orderBy: { country_name_en: "asc" },
      skip,
      take: limit,
    }),
    prisma.country.count(),
  ]);
  const items = rows.map((row) => ({
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
  const result = { items, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listCountriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/country] listCountries output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function createCountry(input: CreateCountryInput): Promise<CountryActionResponse> {
  await requireCapability("admin.write");
  const parsed = createCountrySchema.safeParse(input);
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    await prisma.country.create({ data: parsed.data });
    revalidatePath("/admin/country");
    return { operation: "success", message: "Country created successfully" };
  } catch (_e) {
    return { operation: "error", message: "We've faced a problem creating the country, please contact us for assistance." };
  }
}

export async function updateCountry(input: UpdateCountryInput): Promise<CountryActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateCountrySchema.safeParse(input);
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.country.findUnique({ where: { country_id: parsed.data.country_id }, select: { country_id: true } });
    if (!existing) return { operation: "error", message: "Country not found" };
    await prisma.country.update({
      where: { country_id: parsed.data.country_id },
      data: parsed.data,
    });
    revalidatePath("/admin/country");
    return { operation: "success", message: "Country successfully updated" };
  } catch (_e) {
    return { operation: "error", message: "We've faced a problem updating the country, please contact us for assistance." };
  }
}

export async function deleteCountry(country_id: number): Promise<CountryActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteCountrySchema.safeParse({ country_id });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.country.findUnique({ where: { country_id: parsed.data.country_id }, select: { country_id: true } });
    if (!existing) return { operation: "error", message: "Country not found" };
    await prisma.country.delete({ where: { country_id: parsed.data.country_id } });
    revalidatePath("/admin/country");
    return { operation: "success", message: "Country successfully deleted" };
  } catch (_e) {
    return { operation: "error", message: "We've faced a problem deleting the country, please contact us for assistance." };
  }
}
