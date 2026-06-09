"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getTagSchema = z.object({
  tagId: z.coerce.number().int().positive(),
});

const createTagSchema = z.object({
  tag: z.string().min(1, "Tag name is required").max(128),
});

const updateTagSchema = z.object({
  tagId: z.coerce.number().int().positive(),
  tag: z.string().min(1, "Tag name is required").max(128),
});

const deleteTagSchema = z.object({
  tagId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TagItem = {
  tag_id: number;
  tag: string;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListTagsResult = {
  tags: TagItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------

export { listTagsSchema, getTagSchema, createTagSchema, updateTagSchema, deleteTagSchema };

// ---------------------------------------------------------------------------
// listTags
// ---------------------------------------------------------------------------

/**
 * List tags with pagination.
 *
 * Mirrors the legacy Yii2 TagController::actionList.
 */
export async function listTags(
  params: FormData | z.input<typeof listTagsSchema> = {},
): Promise<ListTagsResult> {
  await requireCapability("admin.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listTagsSchema.safeParse(raw);
  if (!parsed.success) {
    return { tags: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      orderBy: { tag: "asc" },
      skip,
      take: limit,
    }),
    prisma.tag.count(),
  ]);

  return {
    tags: tags.map((t: any): TagItem => ({
      tag_id: t.tag_id,
      tag: t.tag,
      created_at: t.created_at ?? null,
      updated_at: t.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getTag
// ---------------------------------------------------------------------------

/**
 * Get a single tag by ID.
 *
 * Mirrors the legacy Yii2 TagController::actionView.
 */
export async function getTag(
  params: z.input<typeof getTagSchema>,
): Promise<TagItem | null> {
  await requireCapability("admin.read");

  const parsed = getTagSchema.safeParse(params);
  if (!parsed.success) return null;

  const tag = await prisma.tag.findUnique({
    where: { tag_id: parsed.data.tagId },
  });

  if (!tag) return null;

  return {
    tag_id: tag.tag_id,
    tag: tag.tag,
    created_at: tag.created_at ?? null,
    updated_at: tag.updated_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// createTag
// ---------------------------------------------------------------------------

/**
 * Create a new tag.
 *
 * Mirrors the legacy Yii2 TagController::actionCreate.
 */
export async function createTag(
  data: z.input<typeof createTagSchema>,
): Promise<{ tag_id: number }> {
  await requireCapability("admin.write");

  const parsed = createTagSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag data");
  }

  const tag = await prisma.tag.create({
    data: {
      tag: parsed.data.tag,
    } as any,
  });

  revalidatePath("/admin/tags");
  revalidatePath("/staff/tags");
  return { tag_id: tag.tag_id };
}

// ---------------------------------------------------------------------------
// updateTag
// ---------------------------------------------------------------------------

/**
 * Update an existing tag.
 *
 * Mirrors the legacy Yii2 TagController::actionUpdate.
 */
export async function updateTag(
  data: z.input<typeof updateTagSchema>,
): Promise<{ tag_id: number }> {
  await requireCapability("admin.write");

  const parsed = updateTagSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag data");
  }

  const tag = await prisma.tag.update({
    where: { tag_id: parsed.data.tagId },
    data: {
      tag: parsed.data.tag,
    } as any,
  });

  revalidatePath("/admin/tags");
  revalidatePath("/staff/tags");
  return { tag_id: tag.tag_id };
}

// ---------------------------------------------------------------------------
// deleteTag
// ---------------------------------------------------------------------------

/**
 * Delete a tag by ID.
 *
 * Mirrors the legacy Yii2 TagController::actionDelete.
 */
export async function deleteTag(
  data: z.input<typeof deleteTagSchema>,
): Promise<{ success: boolean }> {
  await requireCapability("admin.write");

  const parsed = deleteTagSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid tag ID");
  }

  await prisma.tag.delete({
    where: { tag_id: parsed.data.tagId },
  });

  revalidatePath("/admin/tags");
  revalidatePath("/staff/tags");
  return { success: true };
}
