"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  tagListItemSchema,
  listTagsResultSchema,
  tagIdResultSchema,
} from "./schemas";
import type {
  TagListItem,
  ListTagsResult,
  TagIdResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function logOutputError(source: string, error: unknown): Promise<void> {
  console.error(`[modules/admin/tag] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Input schemas (exported for tests)
// ---------------------------------------------------------------------------

export const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

export const createTagSchema = z.object({
  tag: z
    .string()
    .min(1, "Tag name is required")
    .max(128, "Tag name must be at most 128 characters"),
});

export const deleteTagSchema = z.object({
  tagId: z.coerce.number().int().positive(),
});

const getTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID is required"),
});

// ---------------------------------------------------------------------------
// listTags
// ---------------------------------------------------------------------------

/**
 * List tags with pagination and optional search.
 */
export async function listTags(
  params: FormData | z.input<typeof listTagsSchema> = {},
): Promise<ListTagsResult> {
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
    where.OR = [
      { tag: { contains: search } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.tag.findMany({
      where: where as any,
      orderBy: { tag: "asc" },
      skip,
      take: limit,
    }),
    prisma.tag.count({ where: where as any }),
  ]);

  const result: ListTagsResult = {
    records: records.map((r: any): TagListItem => ({
      tag_id: r.tag_id,
      tag: r.tag,
      created_at: r.created_at ?? null,
      updated_at: r.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listTagsResultSchema.safeParse(result);
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

  const parsed = getTagSchema.safeParse({ tagId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag ID");
  }

  const record = await prisma.tag.findFirst({
    where: { tag_id: parsed.data.tagId },
  });

  if (!record) return null;

  const raw = record as any;
  const result: TagListItem = {
    tag_id: raw.tag_id,
    tag: raw.tag,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  };

  // Validate output shape
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
// deleteTag
// ---------------------------------------------------------------------------

/**
 * Delete a tag record.
 * Throws an error if the record does not exist.
 */
export async function deleteTag(
  tagId: number,
): Promise<TagIdResult> {
  await requireCapability("admin.system");

  const parsed = deleteTagSchema.safeParse({ tagId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag ID");
  }

  // Verify the record exists
  const existing = await prisma.tag.findFirst({
    where: { tag_id: parsed.data.tagId },
  });
  if (!existing) {
    throw new Error(`Tag record not found: ${parsed.data.tagId}`);
  }

  await prisma.tag.delete({
    where: { tag_id: parsed.data.tagId },
  });

  revalidatePath("/admin/tag");
  const result: TagIdResult = { tag_id: parsed.data.tagId };

  const outputParsed = tagIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteTag", outputParsed.error.issues);
  }

  return result;
}
