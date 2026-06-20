"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getDesignationSchema, getDesignationResultSchema } from "./schemas";
import type { GetDesignationResult, GetDesignationInput } from "./schemas";

/**
 * Get a single designation by UUID.
 * Extracted from src/modules/admin/designations/actions.ts.
 */
export async function getDesignation(input: GetDesignationInput): Promise<GetDesignationResult> {
  await requireCapability("admin.read");

  const parsed = getDesignationSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid designation UUID");
  }

  const row = await prisma.designation.findUnique({
    where: { designation_uuid: parsed.data.designationUuid },
  });

  const result: GetDesignationResult = {
    designation: row
      ? {
          designation_uuid: row.designation_uuid,
          designation_name_en: row.designation_name_en,
          designation_name_ar: row.designation_name_ar,
          designation_created_at: row.designation_created_at,
          designation_updated_at: row.designation_updated_at,
        }
      : null,
  };

  const outputParsed = getDesignationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/designations/[id]] getDesignation output failed:", outputParsed.error.issues);
  }

  return result;
}
