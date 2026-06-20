"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  storeAssignmentRequestItemSchema,
  listStoreAssignmentRequestsResultSchema,
  createStoreAssignmentRequestResultSchema,
  type StoreAssignmentRequestItem,
  type ListStoreAssignmentRequestsResult,
  type CreateStoreAssignmentRequestResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStoreAssignmentRequestsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(255).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getStoreAssignmentRequestSchema = z.object({
  sarUuid: z.string().min(1, "SAR UUID is required"),
});

const createStoreAssignmentRequestSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  storeId: z.coerce.number().int().positive("Store ID is required"),
  currencyCode: z.string().length(3).optional().default("KWD"),
  status: z.coerce.number().int().min(0).max(255).optional().default(0),
});

// ---------------------------------------------------------------------------
// Types (input params)
// ---------------------------------------------------------------------------

export type ListStoreAssignmentRequestsParams = z.input<
  typeof listStoreAssignmentRequestsSchema
>;
export type GetStoreAssignmentRequestParams = z.input<
  typeof getStoreAssignmentRequestSchema
>;
export type CreateStoreAssignmentRequestParams = z.input<
  typeof createStoreAssignmentRequestSchema
>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma store_assignment_request row to the shared item shape. */
function toItem(row: PrismaSarRow): StoreAssignmentRequestItem {
  return {
    sar_uuid: row.sar_uuid,
    candidate_id: row.candidate_id ?? null,
    store_id: row.store_id ?? null,
    currency_code: row.currency_code ?? null,
    status: row.status ?? null,
    created_at: row.created_at?.toISOString() ?? null,
    updated_at: row.updated_at?.toISOString() ?? null,
  };
}

/** Non-null Prisma row shape for store_assignment_request. */
type PrismaSarRow = NonNullable<
  Awaited<ReturnType<typeof prisma.store_assignment_request.findFirst>>
>;

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List store assignment requests with pagination and optional filters.
 * Mirrors the legacy Yii2 StoreAssignmentRequestController::actionIndex.
 * Requires store.read capability.
 */
export async function listStoreAssignmentRequests(
  params: ListStoreAssignmentRequestsParams = {},
): Promise<ListStoreAssignmentRequestsResult> {
  await requireCapability("store.read");

  const parsed = listStoreAssignmentRequestsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const { candidateId, storeId, status, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (candidateId !== undefined) where.candidate_id = candidateId;
  if (storeId !== undefined) where.store_id = storeId;
  if (status !== undefined) where.status = status;

  const [rows, total] = await Promise.all([
    prisma.store_assignment_request.findMany({
      where: where as any,
      orderBy: [{ created_at: { sort: "desc", nulls: "last" } }],
      skip,
      take: limit,
    }),
    prisma.store_assignment_request.count({ where: where as any }),
  ]);

  const result = {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };

  // Validate output shape
  const outputParsed = listStoreAssignmentRequestsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/store-assignment-requests] listStoreAssignmentRequests output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single store assignment request by UUID.
 * Mirrors the legacy Yii2 StoreAssignmentRequestController::actionView.
 * Requires store.read capability.
 * Returns null if not found.
 */
export async function getStoreAssignmentRequest(
  params: GetStoreAssignmentRequestParams,
): Promise<StoreAssignmentRequestItem | null> {
  await requireCapability("store.read");

  const parsed = getStoreAssignmentRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid SAR UUID");
  }

  const { sarUuid } = parsed.data;

  const row = await prisma.store_assignment_request.findUnique({
    where: { sar_uuid: sarUuid },
  });

  if (!row) return null;

  const result = toItem(row);

  // Validate output shape
  const outputParsed = storeAssignmentRequestItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/store-assignment-requests] getStoreAssignmentRequest output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new store assignment request.
 * Mirrors the legacy Yii2 StoreAssignmentRequestController::actionCreate.
 * Requires store.create capability.
 */
export async function createStoreAssignmentRequest(
  params: CreateStoreAssignmentRequestParams,
): Promise<CreateStoreAssignmentRequestResult> {
  await requireCapability("store.create");

  const parsed = createStoreAssignmentRequestSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const { candidateId, storeId, currencyCode, status } = parsed.data;

  const sarUuid = crypto.randomUUID();

  await prisma.store_assignment_request.create({
    data: {
      sar_uuid: sarUuid,
      candidate_id: candidateId,
      store_id: storeId,
      currency_code: currencyCode,
      status,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/stores/assignments");

  return {
    operation: "success",
    message: "Store assignment request created successfully",
    sar_uuid: sarUuid,
  };
}
