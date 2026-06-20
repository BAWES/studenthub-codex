"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getTagSchema, getTagResultSchema } from "./schemas";
import type { GetTagResult, GetTagInput } from "./schemas";

export async function getTag(input: GetTagInput): Promise<GetTagResult> {
  await requireCapability("admin.read");
  const parsed = getTagSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag ID");
  const row = await prisma.tag.findUnique({ where: { tag_id: parsed.data.tagId } });
  if (!row) {
    const result = { tag: null };
    const outputParsed = getTagResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags/[id]] getTag output failed:", outputParsed.error.issues);
    }
    return result;
  }
  const result = { tag: { tag_id: row.tag_id, tag: row.tag, created_at: row.created_at, updated_at: row.updated_at } };
  const outputParsed = getTagResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/tags/[id]] getTag output failed:", outputParsed.error.issues);
  }
  return result;
}
