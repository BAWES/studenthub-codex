"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  idCardItemSchema,
  listIdCardsResultSchema,
  idCardActionResultSchema,
  type IdCardItem,
  type ListIdCardsResult,
  type IdCardActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listIdCardsSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  status: z.number().int().min(0).max(1).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const getIdCardSchema = z.object({
  id: z.number().int().positive(),
});

const createIdCardSchema = z.object({
  candidateId: z.number().int().positive(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

const updateIdCardStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.number().int().min(0).max(1),
});

// ---------------------------------------------------------------------------
// Types (input params)
// ---------------------------------------------------------------------------

export type ListIdCardsParams = z.input<typeof listIdCardsSchema>;
export type GetIdCardParams = z.input<typeof getIdCardSchema>;
export type CreateIdCardParams = z.input<typeof createIdCardSchema>;
export type UpdateIdCardStatusParams = z.input<typeof updateIdCardStatusSchema>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// listCandidateIdCards
// ---------------------------------------------------------------------------

/**
 * List candidate ID cards with pagination and optional filters.
 * Excludes soft-deleted ID cards by default unless a status filter is provided.
 * Mirrors the legacy Yii2 CandidateIdCardController::actionList().
 */
export async function listCandidateIdCards(
  params: ListIdCardsParams = {},
): Promise<ListIdCardsResult> {
  await requireCapability("candidate_id_card.read");

  const parsed = listIdCardsSchema.safeParse(params);
  if (!parsed.success) {
    return { idCards: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { candidateId, status, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status !== undefined) {
    // Map status to the `deleted` field: 0 = active, 1 = deleted
    where.deleted = status;
  } else {
    // Default: exclude soft-deleted records
    where.deleted = 0;
  }
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [idCards, total] = await Promise.all([
    prisma.candidate_id_card.findMany({
      where: where as any,
      orderBy: { id: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidate_id_card.count({ where: where as any }),
  ]);

  const result = {
    idCards: idCards.map((c) => ({
      id: c.id,
      candidate_id: c.candidate_id,
      expiry_date: c.expiry_date,
      deleted: c.deleted,
      created_at: c.created_at,
      updated_at: c.updated_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listIdCardsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-id-cards] listCandidateIdCards output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateIdCard
// ---------------------------------------------------------------------------

/**
 * Get a single candidate ID card by its auto-increment ID.
 * Returns null if not found or soft-deleted.
 * Mirrors the legacy Yii2 CandidateIdCardController::actionView().
 */
export async function getCandidateIdCard(
  params: GetIdCardParams,
): Promise<IdCardItem | null> {
  await requireCapability("candidate_id_card.read");

  const parsed = getIdCardSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid ID card ID");
  }

  const { id } = parsed.data;

  const idCard = await prisma.candidate_id_card.findFirst({
    where: { id, deleted: 0 },
  });

  if (!idCard) return null;

  const result = {
    id: idCard.id,
    candidate_id: idCard.candidate_id,
    expiry_date: idCard.expiry_date,
    deleted: idCard.deleted,
    created_at: idCard.created_at,
    updated_at: idCard.updated_at,
  };

  // Validate output shape
  const outputParsed = idCardItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-id-cards] getCandidateIdCard output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createCandidateIdCard
// ---------------------------------------------------------------------------

/**
 * Create a new candidate ID card record.
 * Requires the "candidate_id_card.write" capability.
 * Returns { operation, message } on success or error.
 */
export async function createCandidateIdCard(
  params: CreateIdCardParams,
): Promise<IdCardActionResult> {
  await requireCapability("candidate_id_card.write");

  const parsed = createIdCardSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ID card data",
    };
  }

  const { candidateId, expiryDate } = parsed.data;
  const now = new Date();

  try {
    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
    });

    if (!candidate) {
      return {
        operation: "error",
        message: "Candidate not found",
      };
    }

    await prisma.candidate_id_card.create({
      data: {
        candidate_id: candidateId,
        expiry_date: new Date(expiryDate),
        deleted: 0,
        created_at: now,
        updated_at: now,
      },
    });

    return {
      operation: "success",
      message: "ID card created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create ID card record",
    };
  }
}

// ---------------------------------------------------------------------------
// updateCandidateIdCardStatus
// ---------------------------------------------------------------------------

/**
 * Update the status (deleted flag) of a candidate ID card.
 * Status values: 0 = active, 1 = deleted (soft-delete).
 * Requires the "candidate_id_card.write" capability.
 * Returns { operation, message } on success or error.
 */
export async function updateCandidateIdCardStatus(
  params: UpdateIdCardStatusParams,
): Promise<IdCardActionResult> {
  await requireCapability("candidate_id_card.write");

  const parsed = updateIdCardStatusSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ID card status data",
    };
  }

  const { id, status } = parsed.data;

  try {
    // Verify the ID card exists
    const idCard = await prisma.candidate_id_card.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!idCard) {
      return {
        operation: "error",
        message: "ID card not found",
      };
    }

    await prisma.candidate_id_card.update({
      where: { id },
      data: {
        deleted: status,
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message:
        status === 0
          ? "ID card restored successfully"
          : "ID card deleted successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error
          ? err.message
          : "Failed to update ID card status",
    };
  }
}
