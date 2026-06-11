"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

import {
  listRequestChecklistsSchema,
  createRequestChecklistSchema,
  updateRequestChecklistSchema,
  deleteRequestChecklistSchema,
  listRequestChecklistsResultSchema,
  requestChecklistItemSchema,
  requestChecklistItemNullableSchema,
  deleteRequestChecklistResultSchema,
  type ListRequestChecklistsParams,
  type CreateRequestChecklistParams,
  type UpdateRequestChecklistParams,
  type DeleteRequestChecklistParams,
  type RequestChecklistItem,
  type ListRequestChecklistsResult,
  type DeleteRequestChecklistResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List request checklists with pagination and optional search filter.
 */
export async function listRequestChecklists(
  params: ListRequestChecklistsParams = {},
): Promise<ListRequestChecklistsResult> {
  await requireCapability("admin.read");

  const parsed = listRequestChecklistsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, search } = parsed.data;

  const where: { status_name?: { contains: string } } = {};
  if (search !== undefined && search.length > 0) {
    where.status_name = { contains: search };
  }

  const [items, total] = await Promise.all([
    prisma.request_checklist.findMany({
      where,
      orderBy: { sort_order: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.request_checklist.count({ where }),
  ]);

  const result = {
    items: items as RequestChecklistItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listRequestChecklistsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/request-checklists] listRequestChecklists output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single request checklist by UUID.
 */
export async function getRequestChecklist(
  requestChecklistUuid: string,
): Promise<RequestChecklistItem | null> {
  await requireCapability("admin.read");

  if (!requestChecklistUuid) {
    throw new Error("Request checklist UUID is required");
  }

  const item = await prisma.request_checklist.findUnique({
    where: { request_checklist_uuid: requestChecklistUuid },
  });

  // Validate output shape
  const outputParsed = requestChecklistItemNullableSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/request-checklists] getRequestChecklist output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item as RequestChecklistItem | null;
}

/**
 * Create a new request checklist entry.
 */
export async function createRequestChecklist(
  params: CreateRequestChecklistParams,
): Promise<RequestChecklistItem> {
  await requireCapability("admin.write");

  const parsed = createRequestChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { statusName, statusNameAr, isRequire, sortOrder } = parsed.data;
  const now = new Date();

  const item = await prisma.request_checklist.create({
    data: {
      request_checklist_uuid: `request_checklis_${crypto.randomUUID()}`,
      status_name: statusName,
      status_name_ar: statusNameAr ?? null,
      is_require: isRequire ?? null,
      sort_order: sortOrder ?? null,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/admin/requests");

  // Validate output shape
  const outputParsed = requestChecklistItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/request-checklists] createRequestChecklist output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item as RequestChecklistItem;
}

/**
 * Update an existing request checklist entry.
 */
export async function updateRequestChecklist(
  params: UpdateRequestChecklistParams,
): Promise<RequestChecklistItem> {
  await requireCapability("admin.write");

  const parsed = updateRequestChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { requestChecklistUuid, ...fields } = parsed.data;

  // Verify the record exists
  const existing = await prisma.request_checklist.findUnique({
    where: { request_checklist_uuid: requestChecklistUuid },
  });
  if (!existing) {
    throw new Error("Request checklist not found");
  }

  const item = await prisma.request_checklist.update({
    where: { request_checklist_uuid: requestChecklistUuid },
    data: {
      ...(fields.statusName !== undefined && { status_name: fields.statusName }),
      ...(fields.statusNameAr !== undefined && { status_name_ar: fields.statusNameAr }),
      ...(fields.isRequire !== undefined && { is_require: fields.isRequire }),
      ...(fields.sortOrder !== undefined && { sort_order: fields.sortOrder }),
      updated_at: new Date(),
    },
  });

  revalidatePath("/admin/requests");

  // Validate output shape
  const outputParsed = requestChecklistItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/request-checklists] updateRequestChecklist output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item as RequestChecklistItem;
}

/**
 * Delete a request checklist entry.
 */
export async function deleteRequestChecklist(
  params: DeleteRequestChecklistParams,
): Promise<{ success: boolean }> {
  await requireCapability("admin.write");

  const parsed = deleteRequestChecklistSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { requestChecklistUuid } = parsed.data;

  // Verify the record exists
  const existing = await prisma.request_checklist.findUnique({
    where: { request_checklist_uuid: requestChecklistUuid },
  });
  if (!existing) {
    throw new Error("Request checklist not found");
  }

  await prisma.request_checklist.delete({
    where: { request_checklist_uuid: requestChecklistUuid },
  });

  revalidatePath("/admin/requests");

  // Validate output shape
  const outputParsed = deleteRequestChecklistResultSchema.safeParse({
    success: true,
  });
  if (!outputParsed.success) {
    console.error(
      "[modules/request-checklists] deleteRequestChecklist output validation failed:",
      outputParsed.error.issues,
    );
  }

  return { success: true };
}
