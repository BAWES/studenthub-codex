"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------
// This module uses the `offer` table which is not in the Prisma schema.
// All database operations use raw SQL via prisma.$queryRawUnsafe /
// prisma.$executeRawUnsafe.

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OFFER_STATUS_PENDING = 0;
const OFFER_STATUS_ACCEPTED = 1;
const OFFER_STATUS_REJECTED = 2;
const OFFER_STATUS_CANCELLED = 3;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listOffersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.coerce.number().int().min(0).max(3).optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().max(60).optional(),
});

const getOfferSchema = z.object({
  offerUuid: z.string().min(1, "Offer UUID is required"),
});

const createOfferSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive(),
  offerAmount: z.coerce.number().positive().optional(),
  currencyCode: z.string().length(3).optional().default("KWD"),
  notes: z.string().max(2000).optional(),
  validUntil: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListOffersParams = z.input<typeof listOffersSchema>;
export type GetOfferParams = z.input<typeof getOfferSchema>;
export type CreateOfferParams = z.input<typeof createOfferSchema>;

export type OfferListItem = {
  offer_uuid: string;
  request_uuid: string;
  candidate_id: number | null;
  company_id: number;
  offer_amount: number | null;
  currency_code: string | null;
  status: number | null;
  notes: string | null;
  valid_until: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListOffersResult = {
  offers: OfferListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateOfferResult = {
  success: boolean;
  message: string;
  offerUuid?: string;
};

// ---------------------------------------------------------------------------
// listOffers
// ---------------------------------------------------------------------------

/**
 * List offers with optional filters and pagination.
 *
 * Mirrors the pattern from listJobs / listContracts.
 * Supports filtering by status, candidate, company, and request.
 * Uses raw SQL because the offer table is not in the Prisma schema.
 *
 * @param params - Optional filters and pagination
 * @returns Paginated offer list with total count
 */
export async function listOffers(
  params: FormData | z.input<typeof listOffersSchema> = {},
): Promise<ListOffersResult> {
  await requireCapability("offer.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          status: params.get("status"),
          candidateId: params.get("candidateId"),
          companyId: params.get("companyId"),
          requestUuid: params.get("requestUuid"),
        }
      : params;

  const parsed = listOffersSchema.safeParse(raw);
  if (!parsed.success) {
    return { offers: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, candidateId, companyId, requestUuid } =
    parsed.data;
  const skip = (page - 1) * limit;

  // Build WHERE clause dynamically
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (status !== undefined) {
    conditions.push("status = ?");
    values.push(status);
  }
  if (candidateId !== undefined) {
    conditions.push("candidate_id = ?");
    values.push(candidateId);
  }
  if (companyId !== undefined) {
    conditions.push("company_id = ?");
    values.push(companyId);
  }
  if (requestUuid !== undefined && requestUuid.trim()) {
    conditions.push("request_uuid = ?");
    values.push(requestUuid);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  try {
    // Count total
    const countSql = `SELECT COUNT(*) as cnt FROM offer ${whereClause}`;
    const countResult = await prisma.$queryRawUnsafe<
      { cnt: bigint }[]
    >(countSql, ...values);
    const total = Number(countResult[0]?.cnt ?? 0);

    // Fetch paginated rows
    const dataSql = `SELECT * FROM offer ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const rows = await prisma.$queryRawUnsafe<OfferListItem[]>(
      dataSql,
      ...values,
      limit,
      skip,
    );

    return {
      offers: rows.map((r) => ({
        ...r,
        offer_amount: r.offer_amount ? Number(r.offer_amount) : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("listOffers error:", error);
    return { offers: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

// ---------------------------------------------------------------------------
// getOffer
// ---------------------------------------------------------------------------

/**
 * Get a single offer by UUID.
 * Uses raw SQL because the offer table is not in the Prisma schema.
 * Throws if the offer is not found.
 *
 * @param params - Object with offerUuid
 * @returns The offer record
 */
export async function getOffer(
  params: GetOfferParams,
): Promise<OfferListItem> {
  await requireCapability("offer.read");

  const parsed = getOfferSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { offerUuid } = parsed.data;

  const rows = await prisma.$queryRawUnsafe<OfferListItem[]>(
    "SELECT * FROM offer WHERE offer_uuid = ? LIMIT 1",
    offerUuid,
  );

  if (!rows || rows.length === 0) {
    throw new Error("Offer not found");
  }

  return {
    ...rows[0],
    offer_amount: rows[0].offer_amount
      ? Number(rows[0].offer_amount)
      : null,
  };
}

// ---------------------------------------------------------------------------
// createOffer
// ---------------------------------------------------------------------------

/**
 * Create a new offer.
 * Uses raw SQL because the offer table is not in the Prisma schema.
 * Generates a UUID and inserts with the configured status (pending).
 *
 * @param params - Offer creation params
 * @returns Result with success flag, message, and new offer UUID
 */
export async function createOffer(
  params: FormData | z.input<typeof createOfferSchema>,
): Promise<CreateOfferResult> {
  await requireCapability("offer.write");

  const raw =
    params instanceof FormData
      ? {
          requestUuid: params.get("requestUuid"),
          candidateId: params.get("candidateId"),
          companyId: params.get("companyId"),
          offerAmount: params.get("offerAmount"),
          currencyCode: params.get("currencyCode"),
          notes: params.get("notes"),
          validUntil: params.get("validUntil"),
        }
      : params;

  const parsed = createOfferSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const {
    requestUuid,
    candidateId,
    companyId,
    offerAmount,
    currencyCode,
    notes,
    validUntil,
  } = parsed.data;

  const offerUuid = `offer_${crypto.randomUUID()}`;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO offer (offer_uuid, request_uuid, candidate_id, company_id, 
        offer_amount, currency_code, status, notes, valid_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      offerUuid,
      requestUuid,
      candidateId ?? null,
      companyId,
      offerAmount ?? null,
      currencyCode,
      OFFER_STATUS_PENDING,
      notes ?? null,
      validUntil ?? null,
      now,
      now,
    );

    revalidatePath("/staff/requests");
    revalidatePath("/admin/requests");
    revalidatePath("/candidate/offers");

    return {
      success: true,
      message: "Offer created successfully",
      offerUuid,
    };
  } catch (error) {
    console.error("createOffer error:", error);
    return {
      success: false,
      message: "Failed to create offer. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// getValidOfferStatuses (utility)
// ---------------------------------------------------------------------------

export function getValidOfferStatuses(): Record<string, number> {
  return {
    pending: OFFER_STATUS_PENDING,
    accepted: OFFER_STATUS_ACCEPTED,
    rejected: OFFER_STATUS_REJECTED,
    cancelled: OFFER_STATUS_CANCELLED,
  };
}
