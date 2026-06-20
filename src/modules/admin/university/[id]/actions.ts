"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import type { UniversityItem } from "@/modules/admin/university/schemas";
import { universityItemSchema } from "@/modules/admin/university/schemas";

export async function getUniversity(universityId: number): Promise<{ university: UniversityItem | null }> {
  await requireCapability("admin.read");
  const row = await prisma.university.findUnique({ where: { university_id: universityId } });
  if (!row) return { university: null };
  const parsed = universityItemSchema.safeParse(row);
  if (!parsed.success) {
    console.error("[admin/university] getUniversity output failed:", parsed.error.issues);
    return { university: null };
  }
  return { university: parsed.data };
}
