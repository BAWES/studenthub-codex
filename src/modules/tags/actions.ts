"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  tagItemSchema,
  listTagsResultSchema,
  type TagItem,
  type ListTagsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

const getTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID must be a positive integer"),
});

const createTagSchema = z.object({
  tag: z.string().min(1, "Tag name is required").max(128),
});

const updateTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID must be a positive integer"),
  tag: z.string().min(1, "Tag name is required").max(128),
});

const deleteTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID must be a positive integer"),
});

// ---------------------------------------------------------------------------
// Types (input params)
// ---------------------------------------------------------------------------

export type ListTagsParams = z.input<typeof listTagsSchema>;
export type GetTagParams = z.input<typeof getTagSchema>;
export type CreateTagParams = z.input<typeof createTagSchema>;
export type UpdateTagParams = z.input<typeof updateTagSchema>;
export type DeleteTagParams = z.input<typeof deleteTagSchema>;

// ---------------------------------------------------------------------------
// listTags
// ---------------------------------------------------------------------------

/**
 * List tags with optional search and pagination.
 *
 * Maps to the legacy TagController::actionList().
 * - Filters by keyword search on tag name (case-insensitive contains)
 * - Paginated with configurable page/limit
 * - Ordered alphabetically by tag name ascending
 */
export async function listTags(
  params: FormData | z.input<typeof listTagsSchema> = {},
): Promise<ListTagsResult> {
  await requireCapability("candidate.read.own");

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
    return { tags: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Record<string, unknown> = {};

  if (search !== undefined && search.trim().length > 0) {
    where.tag = { contains: search.trim(), mode: "insensitive" };
  }

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where: where as any,
      orderBy: { tag: "asc" },
      skip,
      take: limit,
      select: {
        tag_id: true,
        tag: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.tag.count({ where: where as any }),
  ]);

  const result = {
    tags: tags as TagItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listTagsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/tags] listTags output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getTag
// ---------------------------------------------------------------------------

/**
 * Get a single tag by its ID.
 *
 * Maps to the legacy TagController::actionView().
 * Throws if the tag is not found.
 */
export async function getTag(params: GetTagParams): Promise<TagItem> {
  await requireCapability("candidate.read.own");

  const parsed = getTagSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { tagId } = parsed.data;

  const tag = await prisma.tag.findUnique({
    where: { tag_id: tagId },
    select: {
      tag_id: true,
      tag: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!tag) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }

  const result = tag as TagItem;

  // Validate output shape
  const outputParsed = tagItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/tags] getTag output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createTag
// ---------------------------------------------------------------------------

/**
 * Create a new tag.
 *
 * Maps to the legacy TagController::actionCreate().
 * Requires a unique tag name (string, max 128 chars).
 * Returns the created tag item.
 */
export async function createTag(params: CreateTagParams): Promise<TagItem> {
  await requireCapability("request.write");

  const parsed = createTagSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { tag: tagName } = parsed.data;
  const now = new Date();

  const tag = await prisma.tag.create({
    data: {
      tag: tagName,
      created_at: now,
      updated_at: now,
    },
    select: {
      tag_id: true,
      tag: true,
      created_at: true,
      updated_at: true,
    },
  });

  const result = tag as TagItem;

  // Validate output shape
  const outputParsed = tagItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/tags] createTag output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateTag
// ---------------------------------------------------------------------------

/**
 * Update an existing tag's name.
 *
 * Maps to the legacy TagController::actionUpdate().
 * Throws if the tag is not found.
 */
export async function updateTag(params: UpdateTagParams): Promise<TagItem> {
  await requireCapability("request.write");

  const parsed = updateTagSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { tagId, tag: tagName } = parsed.data;

  // Verify tag exists
  const existing = await prisma.tag.findUnique({
    where: { tag_id: tagId },
    select: { tag_id: true },
  });

  if (!existing) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }

  const updated = await prisma.tag.update({
    where: { tag_id: tagId },
    data: {
      tag: tagName,
      updated_at: new Date(),
    },
    select: {
      tag_id: true,
      tag: true,
      created_at: true,
      updated_at: true,
    },
  });

  const result = updated as TagItem;

  // Validate output shape
  const outputParsed = tagItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/tags] updateTag output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteTag
// ---------------------------------------------------------------------------

/**
 * Delete a tag by its ID.
 *
 * Maps to the legacy TagController::actionDelete().
 * Throws if the tag is not found.
 */
export async function deleteTag(params: DeleteTagParams): Promise<void> {
  await requireCapability("request.write");

  const parsed = deleteTagSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { tagId } = parsed.data;

  // Verify tag exists
  const existing = await prisma.tag.findUnique({
    where: { tag_id: tagId },
    select: { tag_id: true },
  });

  if (!existing) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }

  await prisma.tag.delete({
    where: { tag_id: tagId },
  });
}
