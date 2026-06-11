"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateLinksSchema,
  getCandidateLinkSchema,
  createCandidateLinkSchema,
  updateCandidateLinkSchema,
  deleteCandidateLinkSchema,
  candidateLinkItemSchema,
  listCandidateLinksResultSchema,
  type CandidateLinkItem,
  type ListCandidateLinksResult,
  type ListCandidateLinksParams,
  type GetCandidateLinkParams,
  type CreateCandidateLinkParams,
  type UpdateCandidateLinkParams,
  type DeleteCandidateLinkParams,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateLinks
// ---------------------------------------------------------------------------

/**
 * List candidate links with pagination.
 *
 * Maps to the legacy CandidateLinkController::actionList().
 * - Filters by candidate ID
 * - Paginated with configurable page/limit
 * - Ordered by created_at descending (most recent first)
 */
export async function listCandidateLinks(
  params: FormData | ListCandidateLinksParams,
): Promise<ListCandidateLinksResult> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          candidateId: params.get("candidateId"),
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listCandidateLinksSchema.safeParse(raw);
  if (!parsed.success) {
    return { links: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { candidateId, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = { candidate_id: candidateId };

  const [links, total] = await Promise.all([
    prisma.candidate_link.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        cl_uuid: true,
        candidate_id: true,
        title: true,
        url: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.candidate_link.count({ where }),
  ]);

  const result: ListCandidateLinksResult = {
    links: links as CandidateLinkItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCandidateLinksResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-links] listCandidateLinks output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateLink
// ---------------------------------------------------------------------------

/**
 * Get a single candidate link by its UUID.
 *
 * Maps to the legacy CandidateLinkController::actionView().
 * Throws if the link is not found.
 */
export async function getCandidateLink(params: GetCandidateLinkParams): Promise<CandidateLinkItem> {
  await requireCapability("candidate.read.own");

  const parsed = getCandidateLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { clUuid } = parsed.data;

  const link = await prisma.candidate_link.findUnique({
    where: { cl_uuid: clUuid },
    select: {
      cl_uuid: true,
      candidate_id: true,
      title: true,
      url: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!link) {
    throw new Error(`Candidate link with UUID ${clUuid} not found`);
  }

  const result = link as CandidateLinkItem;

  // Validate output shape
  const outputParsed = candidateLinkItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-links] getCandidateLink output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createCandidateLink
// ---------------------------------------------------------------------------

/**
 * Create a new candidate link.
 *
 * Maps to the legacy CandidateLinkController::actionCreate().
 * Generates a UUID for the link.
 * Returns the created link item.
 */
export async function createCandidateLink(params: CreateCandidateLinkParams): Promise<CandidateLinkItem> {
  await requireCapability("candidate.profile.edit");

  const parsed = createCandidateLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { candidateId, title, url } = parsed.data;
  const now = new Date();
  const uuid = crypto.randomUUID();

  const link = await prisma.candidate_link.create({
    data: {
      cl_uuid: uuid,
      candidate_id: candidateId,
      title,
      url,
      created_at: now,
      updated_at: now,
    },
    select: {
      cl_uuid: true,
      candidate_id: true,
      title: true,
      url: true,
      created_at: true,
      updated_at: true,
    },
  });

  const result = link as CandidateLinkItem;

  // Validate output shape
  const outputParsed = candidateLinkItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-links] createCandidateLink output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCandidateLink
// ---------------------------------------------------------------------------

/**
 * Update an existing candidate link.
 *
 * Maps to the legacy CandidateLinkController::actionUpdate().
 * Throws if the link is not found.
 */
export async function updateCandidateLink(params: UpdateCandidateLinkParams): Promise<CandidateLinkItem> {
  await requireCapability("candidate.profile.edit");

  const parsed = updateCandidateLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { clUuid, title, url } = parsed.data;

  // Verify link exists
  const existing = await prisma.candidate_link.findUnique({
    where: { cl_uuid: clUuid },
    select: { cl_uuid: true },
  });

  if (!existing) {
    throw new Error(`Candidate link with UUID ${clUuid} not found`);
  }

  const updated = await prisma.candidate_link.update({
    where: { cl_uuid: clUuid },
    data: {
      title,
      url,
      updated_at: new Date(),
    },
    select: {
      cl_uuid: true,
      candidate_id: true,
      title: true,
      url: true,
      created_at: true,
      updated_at: true,
    },
  });

  const result = updated as CandidateLinkItem;

  // Validate output shape
  const outputParsed = candidateLinkItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-links] updateCandidateLink output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteCandidateLink
// ---------------------------------------------------------------------------

/**
 * Delete a candidate link by its UUID.
 *
 * Maps to the legacy CandidateLinkController::actionDelete().
 * Throws if the link is not found.
 */
export async function deleteCandidateLink(params: DeleteCandidateLinkParams): Promise<void> {
  await requireCapability("candidate.profile.edit");

  const parsed = deleteCandidateLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { clUuid } = parsed.data;

  // Verify link exists
  const existing = await prisma.candidate_link.findUnique({
    where: { cl_uuid: clUuid },
    select: { cl_uuid: true },
  });

  if (!existing) {
    throw new Error(`Candidate link with UUID ${clUuid} not found`);
  }

  await prisma.candidate_link.delete({
    where: { cl_uuid: clUuid },
  });
}
