"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  candidateLinkItemSchema,
  listCandidateLinksResultSchema,
  listCandidateLinksSchema,
  getCandidateLinkSchema,
  type CandidateLinkItem,
  type ListCandidateLinksResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidateLinksParams = z.input<typeof listCandidateLinksSchema>;
export type GetCandidateLinkParams = z.input<typeof getCandidateLinkSchema>;

// ---------------------------------------------------------------------------
// listCandidateLinks
// ---------------------------------------------------------------------------

/**
 * List candidate links with pagination and optional candidate filter.
 *
 * Mirrors the legacy CandidateLinkController::actionList.
 * - Filters by candidate_id when candidateId is provided
 * - Paginated with configurable page/limit
 */
export async function listCandidateLinks(
  params: ListCandidateLinksParams = {},
): Promise<ListCandidateLinksResult> {
  await requireCapability("candidate.read.own");

  const parsed = listCandidateLinksSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { candidateId, page, limit } = parsed.data;

  const where: Record<string, unknown> = {};
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [links, total] = await Promise.all([
    prisma.candidate_link.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_link.count({ where: where as any }),
  ]);

  const result: ListCandidateLinksResult = {
    links: links.map((l) => ({
      cl_uuid: l.cl_uuid,
      candidate_id: l.candidate_id,
      title: l.title,
      url: l.url,
      created_at: l.created_at ?? null,
      updated_at: l.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listCandidateLinksResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/links] listCandidateLinks output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateLink
// ---------------------------------------------------------------------------

/**
 * Get a single candidate link by UUID.
 * Returns null if not found.
 */
export async function getCandidateLink(
  params: GetCandidateLinkParams,
): Promise<CandidateLinkItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getCandidateLinkSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid candidate link UUID",
    );
  }

  const { uuid } = parsed.data;

  const link = await prisma.candidate_link.findUnique({
    where: { cl_uuid: uuid },
  });

  if (!link) return null;

  const result: CandidateLinkItem = {
    cl_uuid: link.cl_uuid,
    candidate_id: link.candidate_id,
    title: link.title,
    url: link.url,
    created_at: link.created_at ?? null,
    updated_at: link.updated_at ?? null,
  };

  const outputParsed = candidateLinkItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/links] getCandidateLink output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
