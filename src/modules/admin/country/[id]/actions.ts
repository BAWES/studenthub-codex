"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { CountryItem } from "@/modules/admin/country/schemas";
import { countryItemSchema } from "@/modules/admin/country/schemas";

export async function getCountry(countryId: number): Promise<{ country: CountryItem | null }> {
  await requireCapability("admin.read");
  const row = await prisma.country.findUnique({ where: { country_id: countryId } });
  if (!row) return { country: null };
  const parsed = countryItemSchema.safeParse(row);
  if (!parsed.success) {
    console.error("[admin/country] getCountry output failed:", parsed.error.issues);
    return { country: null };
  }
  return { country: parsed.data };
}
