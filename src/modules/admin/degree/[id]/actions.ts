"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getDegreeSchema, getDegreeResultSchema } from "./schemas";
import type { GetDegreeResult, GetDegreeInput } from "./schemas";

export async function getDegree(input: GetDegreeInput): Promise<GetDegreeResult> {
  await requireCapability("admin.read");
  const parsed = getDegreeSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid degree UUID");

  const row = await prisma.degree.findUnique({
    where: { degree_uuid: parsed.data.degreeUuid },
    include: { degree_group: true },
  });

  if (!row) {
    const result = { degree: null };
    const outputParsed = getDegreeResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree/[id]] getDegree output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const result = {
    degree: {
      degree_uuid: row.degree_uuid,
      degree_group_uuid: row.degree_group_uuid ?? null,
      degree_name_en: row.degree_name_en,
      degree_name_ar: row.degree_name_ar ?? null,
      degree_sort_order: row.degree_sort_order ?? null,
      degree_created_at: row.degree_created_at,
      degree_updated_at: row.degree_updated_at,
      degree_group: row.degree_group
        ? {
            degree_group_uuid: row.degree_group.degree_group_uuid,
            degree_group_name_en: row.degree_group.degree_group_name_en,
          }
        : null,
    },
  };

  const outputParsed = getDegreeResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/degree/[id]] getDegree output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
