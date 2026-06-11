"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  checklistItemSchema,
  listChecklistsResultSchema,
  deleteChecklistResultSchema,
} from "./schemas";
import type { ChecklistListItem, ListChecklistsResult, DeleteChecklistResult } from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listChecklistsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getChecklistSchema = z.object({
  uuid: z.string().length(60, "UUID must be 60 characters"),
});

const createChecklistSchema = z.object({
  statusName: z.string().min(1, "Status name is required").max(100),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateChecklistSchema = z.object({
  uuid: z.string().length(60, "UUID must be 60 characters"),
  statusName: z.string().min(1).max(100).optional(),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteChecklistSchema = z.object({
  uuid: z.string().length(60, "UUID must be 60 characters"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListChecklistsParams = z.input<typeof listChecklistsSchema>;
export type GetChecklistParams = z.input<typeof getChecklistSchema>;
export type CreateChecklistParams = z.input<typeof createChecklistSchema>;
export type UpdateChecklistParams = z.input<typeof updateChecklistSchema>;
export type DeleteChecklistParams = z.input<typeof deleteChecklistSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List request checklists with pagination.
 * Mirrors the legacy Yii2 RequestChecklistController::actionList pattern.
 */
export async function listChecklists(
  params: ListChecklistsParams = {},
): Promise<ListChecklistsResult> {
  await requireCapability("admin.read");

  const parsed = listChecklistsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20 } = parsed.data;

  const [items, total] = await Promise.all([
    prisma.request_checklist.findMany({
      orderBy: { sort_order: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.request_checklist.count(),
  ]);

  const result: ListChecklistsResult = {
    items: items as ChecklistListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listChecklistsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/requests/checklist] listChecklists output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single request checklist by UUID.
 * Mirrors the legacy Yii2 RequestChecklistController::actionView pattern.
 */
export async function getChecklist(
  params: GetChecklistParams,
): Promise<ChecklistListItem | null> {
  await requireCapability("admin.read");

  const parsed = getChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { uuid } = parsed.data;

  const item = await prisma.request_checklist.findUnique({
    where: { request_checklist_uuid: uuid },
  });

  const result = item as ChecklistListItem | null;

  // Validate output shape (only when not null)
  if (result !== null) {
    const outputParsed = checklistItemSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/requests/checklist] getChecklist output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Create a new request checklist.
 * Mirrors the legacy Yii2 RequestChecklistController::actionCreate pattern.
 */
export async function createChecklist(
  params: CreateChecklistParams,
): Promise<ChecklistListItem> {
  await requireCapability("admin.write");

  const parsed = createChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { statusName, statusNameAr, isRequire, sortOrder } = parsed.data;

  const item = await prisma.request_checklist.create({
    data: {
      request_checklist_uuid: crypto.randomUUID(),
      status_name: statusName,
      status_name_ar: statusNameAr ?? null,
      is_require: isRequire ?? null,
      sort_order: sortOrder ?? null,
    },
  });

  revalidatePath("/admin/requests");

  const createResult = item as ChecklistListItem;

  // Validate output shape
  const createOutputParsed = checklistItemSchema.safeParse(createResult);
  if (!createOutputParsed.success) {
    console.error(
      "[modules/requests/checklist] createChecklist output validation failed:",
      createOutputParsed.error.issues,
    );
  }

  return createResult;
}

/**
 * Update an existing request checklist.
 * Mirrors the legacy Yii2 RequestChecklistController::actionUpdate pattern.
 */
export async function updateChecklist(
  params: UpdateChecklistParams,
): Promise<ChecklistListItem> {
  await requireCapability("admin.write");

  const parsed = updateChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { uuid, ...fields } = parsed.data;

  // Verify the record exists
  const existing = await prisma.request_checklist.findUnique({
    where: { request_checklist_uuid: uuid },
  });
  if (!existing) {
    throw new Error("Request checklist not found");
  }

  const item = await prisma.request_checklist.update({
    where: { request_checklist_uuid: uuid },
    data: {
      ...(fields.statusName !== undefined && { status_name: fields.statusName }),
      ...(fields.statusNameAr !== undefined && { status_name_ar: fields.statusNameAr }),
      ...(fields.isRequire !== undefined && { is_require: fields.isRequire }),
      ...(fields.sortOrder !== undefined && { sort_order: fields.sortOrder }),
    },
  });

  revalidatePath("/admin/requests");

  const updateResult = item as ChecklistListItem;

  // Validate output shape
  const updateOutputParsed = checklistItemSchema.safeParse(updateResult);
  if (!updateOutputParsed.success) {
    console.error(
      "[modules/requests/checklist] updateChecklist output validation failed:",
      updateOutputParsed.error.issues,
    );
  }

  return updateResult;
}

/**
 * Delete a request checklist.
 * Mirrors the legacy Yii2 RequestChecklistController::actionDelete pattern.
 */
export async function deleteChecklist(
  params: DeleteChecklistParams,
): Promise<{ success: boolean }> {
  await requireCapability("admin.write");

  const parsed = deleteChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { uuid } = parsed.data;

  // Verify the record exists
  const existing = await prisma.request_checklist.findUnique({
    where: { request_checklist_uuid: uuid },
  });
  if (!existing) {
    throw new Error("Request checklist not found");
  }

  await prisma.request_checklist.delete({
    where: { request_checklist_uuid: uuid },
  });

  revalidatePath("/admin/requests");

  const deleteResult: DeleteChecklistResult = { success: true };

  // Validate output shape
  const deleteOutputParsed = deleteChecklistResultSchema.safeParse(deleteResult);
  if (!deleteOutputParsed.success) {
    console.error(
      "[modules/requests/checklist] deleteChecklist output validation failed:",
      deleteOutputParsed.error.issues,
    );
  }

  return deleteResult;
}
