"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listIdCardsSchema = z.object({
  candidateId: z.number().int().positive().optional(),
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

const verifyIdCardSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListIdCardsParams = z.input<typeof listIdCardsSchema>;
export type GetIdCardParams = z.input<typeof getIdCardSchema>;
export type CreateIdCardParams = z.input<typeof createIdCardSchema>;
export type VerifyIdCardParams = z.input<typeof verifyIdCardSchema>;

export type IdCardItem = {
  id: number;
  candidate_id: number | null;
  expiry_date: Date | null;
  deleted: number;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListIdCardsResult = {
  idCards: IdCardItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateIdCardResult = {
  operation: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Exported schemas
// ---------------------------------------------------------------------------

export {
  listIdCardsSchema,
  getIdCardSchema,
  createIdCardSchema,
  verifyIdCardSchema,
};

// ---------------------------------------------------------------------------
// listCandidateIdCards
// ---------------------------------------------------------------------------

/**
 * List candidate ID cards with pagination and optional candidate filter.
 * Excludes soft-deleted ID cards.
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

  const { candidateId, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
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

  return {
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

  return {
    id: idCard.id,
    candidate_id: idCard.candidate_id,
    expiry_date: idCard.expiry_date,
    deleted: idCard.deleted,
    created_at: idCard.created_at,
    updated_at: idCard.updated_at,
  };
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
): Promise<CreateIdCardResult> {
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
// verifyCandidateIdCard
// ---------------------------------------------------------------------------

/**
 * Verify a candidate ID card exists and is not soft-deleted.
 * Marks the card as verified by updating its updated_at timestamp.
 * Requires the "candidate_id_card.write" capability.
 */
export async function verifyCandidateIdCard(
  params: VerifyIdCardParams,
): Promise<{ verified: boolean; message: string }> {
  await requireCapability("candidate_id_card.write");

  const parsed = verifyIdCardSchema.safeParse(params);
  if (!parsed.success) {
    return {
      verified: false,
      message: parsed.error.issues[0]?.message ?? "Invalid ID card ID",
    };
  }

  const { id } = parsed.data;

  const idCard = await prisma.candidate_id_card.findFirst({
    where: { id, deleted: 0 },
  });

  if (!idCard) {
    return {
      verified: false,
      message: "ID card not found or has been deleted",
    };
  }

  // Mark as verified by updating the timestamp
  await prisma.candidate_id_card.update({
    where: { id },
    data: { updated_at: new Date() },
  });

  return {
    verified: true,
    message: "ID card verified successfully",
  };
}
