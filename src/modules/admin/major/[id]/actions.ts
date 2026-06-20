"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getMajorSchema, getMajorResultSchema } from "./schemas";
import type { GetMajorResult, GetMajorInput } from "./schemas";

export async function getMajor(input: GetMajorInput): Promise<GetMajorResult> {
  await requireCapability("admin.read");
  const parsed = getMajorSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid major UUID");
  const row = await prisma.major.findUnique({
    where: { major_uuid: parsed.data.majorUuid },
  });
  if (!row) {
    const result = { major: null };
    const outputParsed = getMajorResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major/[id]] getMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
  const result = {
    major: {
      major_uuid: row.major_uuid,
      major_name_en: row.major_name_en,
      major_name_ar: row.major_name_ar,
      data_source: row.data_source,
      major_created_at: row.major_created_at,
      major_updated_at: row.major_updated_at,
    },
  };
  const outputParsed = getMajorResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/major/[id]] getMajor output failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}
