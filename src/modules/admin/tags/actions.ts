"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { listTagsSchema, createTagSchema, updateTagSchema, deleteTagSchema, listTagsResultSchema, tagActionResponseSchema } from "./schemas";
import type { ListTagsInput, ListTagsResult, TagActionResponse } from "./schemas";

export async function listTags(input: ListTagsInput = {}): Promise<ListTagsResult> {
  await requireCapability("admin.read");
  const parsed = listTagsSchema.safeParse(input);
  if (!parsed.success) return { tags: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.tag.findMany({ orderBy: { tag: "asc" }, skip, take: limit, select: { tag_id: true, tag: true, created_at: true, updated_at: true } }),
    prisma.tag.count(),
  ]);
  const tags = rows.map((row) => ({ tag_id: row.tag_id, tag: row.tag, created_at: row.created_at, updated_at: row.updated_at }));
  const result = { tags, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listTagsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/tags] listTags output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function createTag(name: string): Promise<TagActionResponse> {
  await requireCapability("admin.write");
  const parsed = createTagSchema.safeParse({ tag: name });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid tag name" };
  try {
    await prisma.tag.create({ data: { tag: parsed.data.tag } });
    revalidatePath("/admin/tags");
    const result = { operation: "success", message: "Tag created successfully" };
    const outputParsed = tagActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags] createTag output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem creating the tag, please contact us for assistance." };
    const outputParsed = tagActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags] createTag output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function updateTag(tagId: number, name: string): Promise<TagActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateTagSchema.safeParse({ tagId, tag: name });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.tag.findUnique({ where: { tag_id: parsed.data.tagId }, select: { tag_id: true } });
    if (!existing) return { operation: "error", message: "Tag not found" };
    await prisma.tag.update({ where: { tag_id: parsed.data.tagId }, data: { tag: parsed.data.tag } });
    revalidatePath("/admin/tags");
    const result = { operation: "success", message: "Tag successfully updated" };
    const outputParsed = tagActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags] updateTag output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem updating the tag, please contact us for assistance." };
    const outputParsed = tagActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags] updateTag output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function deleteTag(tagId: number): Promise<TagActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteTagSchema.safeParse({ tagId });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid tag ID" };
  try {
    const existing = await prisma.tag.findUnique({ where: { tag_id: parsed.data.tagId }, select: { tag_id: true } });
    if (!existing) return { operation: "error", message: "Tag not found" };
    await prisma.tag.delete({ where: { tag_id: parsed.data.tagId } });
    revalidatePath("/admin/tags");
    const result = { operation: "success", message: "Tag deleted successfully" };
    const outputParsed = tagActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags] deleteTag output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem deleting the tag, please contact us for assistance." };
    const outputParsed = tagActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tags] deleteTag output failed:", outputParsed.error.issues);
    }
    return result;
  }
}
