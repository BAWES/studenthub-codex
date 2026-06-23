"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { tagListItemSchema, listTagResultSchema, tagIdResultSchema } from "./schemas";
import type { TagListItem, ListTagResult, TagIdResult } from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function logOutputError(source: string, error: unknown): Promise<void> {
  console.error(`[modules/admin/tag] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

const getTagSchema = z.object({
  tag_id: z.coerce.number().int().positive("Tag ID must be a positive integer"),
});

const createTagSchema = z.object({
  tag: z
    .string()
    .min(1, "Tag name is required")
    .max(128, "Tag name must be at most 128 characters"),
});

const updateTagSchema = z.object({
  tag_id: z.coerce.number().int().positive(),
  tag: z.string().min(1).max(128).optional(),
});

const deleteTagSchema = z.object({
  tag_id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// listTags
// ---------------------------------------------------------------------------

/**
 * List tags with pagination and optional search.
 */
export async function listTags(
  params: FormData | z.input<typeof listTagsSchema> = {},
): Promise<ListTagResult> {
  await requireCapability("admin.system");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listTagsSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.tag = { contains: search };
  }

  const [records, total] = await Promise.all([
    prisma.tag.findMany({
      where: where as any,
      orderBy: [{ tag: "asc" }],
      skip,
      take: limit,
    }),
    prisma.tag.count({ where: where as any }),
  ]);

  const result: ListTagResult = {
    records: records.map((r: any): TagListItem => ({
      tag_id: r.tag_id,
      tag: r.tag,
      created_at: r.created_at?.toISOString() ?? null,
      updated_at: r.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listTagResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listTags", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getTag
// ---------------------------------------------------------------------------

/**
 * Get a single tag by ID.
 * Returns null if not found.
 */
export async function getTag(
  tagId: number,
): Promise<TagListItem | null> {
  await requireCapability("admin.system");

  const parsed = getTagSchema.safeParse({ tag_id: tagId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag ID");
  }

  const record = await prisma.tag.findFirst({
    where: { tag_id: parsed.data.tag_id },
  });

  if (!record) return null;

  const raw = record as any;
  const result: TagListItem = {
    tag_id: raw.tag_id,
    tag: raw.tag,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };

  const outputParsed = tagListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getTag", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// createTag
// ---------------------------------------------------------------------------

/**
 * Create a new tag record.
 */
export async function createTag(
  data: z.input<typeof createTagSchema>,
): Promise<TagIdResult> {
  await requireCapability("admin.system");

  const parsed = createTagSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag data");
  }

  const { tag } = parsed.data;

  const record = await prisma.tag.create({
    data: {
      tag,
    } as any,
  });

  revalidatePath("/admin/tag");
  const result: TagIdResult = { tag_id: record.tag_id };

  const outputParsed = tagIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createTag", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateTag
// ---------------------------------------------------------------------------

/**
 * Update an existing tag record.
 */
export async function updateTag(
  data: z.input<typeof updateTagSchema>,
): Promise<TagIdResult> {
  await requireCapability("admin.system");

  const parsed = updateTagSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag data");
  }

  const { tag_id, tag } = parsed.data;

  const existing = await prisma.tag.findFirst({
    where: { tag_id },
  });
  if (!existing) {
    throw new Error(`Tag record not found: ${tag_id}`);
  }

  const updateData: Record<string, unknown> = {};
  if (tag !== undefined) updateData.tag = tag;

  await prisma.tag.update({
    where: { tag_id },
    data: updateData as any,
  });

  revalidatePath("/admin/tag");
  const result: TagIdResult = { tag_id };

  const outputParsed = tagIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateTag", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteTag
// ---------------------------------------------------------------------------

/**
 * Delete a tag record.
 */
export async function deleteTag(
  tagId: number,
): Promise<TagIdResult> {
  await requireCapability("admin.system");

  const parsed = deleteTagSchema.safeParse({ tag_id: tagId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag ID");
  }

  const existing = await prisma.tag.findFirst({
    where: { tag_id: parsed.data.tag_id },
  });
  if (!existing) {
    throw new Error(`Tag record not found: ${parsed.data.tag_id}`);
  }

  await prisma.tag.delete({
    where: { tag_id: parsed.data.tag_id },
  });

  revalidatePath("/admin/tag");
  const result: TagIdResult = { tag_id: parsed.data.tag_id };

  const outputParsed = tagIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteTag", outputParsed.error.issues);
  }

  return result;
}
