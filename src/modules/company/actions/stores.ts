"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { companyActionResultSchema } from "../schemas";

const addStoreSchema = z.object({
  companyId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("Company is required")),
  storeName: z.string().min(1, "Store name is required").max(255),
  storeLocation: z.string().max(255).optional(),
  mallUuid: z.string().max(60).optional(),
  brandUuid: z.string().max(60).optional(),
});

export async function addCompanyStore(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");

  const parsed = addStoreSchema.safeParse({
    companyId: formData.get("companyId"),
    storeName: formData.get("storeName"),
    storeLocation: formData.get("storeLocation"),
    mallUuid: formData.get("mallUuid"),
    brandUuid: formData.get("brandUuid"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.store.create({
    data: {
      company_id: parsed.data.companyId,
      store_name: parsed.data.storeName,
      store_location: parsed.data.storeLocation || "",
      mall_uuid: parsed.data.mallUuid || null,
      brand_uuid: parsed.data.brandUuid || null,
      store_created_at: new Date(),
      store_updated_at: new Date(),
    },
  });

  revalidatePath("/company/stores");
  const result = { error: "" };
  const outputParsed = companyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("addCompanyStore output validation failed:", outputParsed.error);
  }
  return result;
}

export async function removeCompanyStore(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");
  const storeIdRaw = formData.get("storeId");
  const storeId = Number(storeIdRaw);

  if (!Number.isInteger(storeId) || storeId <= 0) {
    return { error: "Invalid store." };
  }

  await prisma.store.update({
    where: { store_id: storeId },
    data: { deleted: 1, store_updated_at: new Date() },
  });

  revalidatePath("/company/stores");
  const result = { error: "" };
  const outputParsed = companyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("removeCompanyStore output validation failed:", outputParsed.error);
  }
  return result;
}