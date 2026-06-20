"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidatesSchema,
  getCandidateByIdSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
  type ListCandidatesInput,
  type GetCandidateByIdInput,
  type CandidateRow,
  type CandidateDetail,
  type ListCandidatesResult,
} from "./schemas";

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/staff/candidates] ${source} output validation failed:`, error);
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List candidates for the staff view, paginated and filterable.
 * Staff users can see all candidates (no per-candidate ownership filter).
 * Ordered by candidate ID descending (newest first).
 */
export async function listCandidates(
  params: ListCandidatesInput = {},
): Promise<ListCandidatesResult> {
  const session = await requireRoleCapability("staff", "candidate.search");

  const parsed = listCandidatesSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q, status } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Record<string, unknown> = {};

  if (q !== undefined && q.trim().length > 0) {
    where.OR = [
      { candidate_name: { contains: q.trim() } },
      { candidate_email: { contains: q.trim() } },
      { candidate_phone: { contains: q.trim() } },
    ];
  }

  if (status !== undefined && status.trim().length > 0) {
    where.candidate_status = Number(status);
  }

  // Staff: no candidate_id filter — staff can see all candidates
  where.deleted = 0;

  const [rows, total] = await Promise.all([
    prisma.candidate.findMany({
      where: where as any,
      orderBy: { candidate_id: "desc" },
      skip,
      take: limit,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        candidate_created_at: true,
      },
    }),
    prisma.candidate.count({ where: where as any }),
  ]);

  const items: CandidateRow[] = rows.map((row) => ({
    id: row.candidate_id,
    name: row.candidate_name,
    email: row.candidate_email,
    phone: row.candidate_phone,
    status: row.candidate_status,
    createdAt: row.candidate_created_at.toISOString(),
  }));

  const result = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = candidateListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidates", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single candidate's details by ID.
 * Staff users can view any candidate's details.
 * Returns null if not found or deleted.
 */
export async function getCandidateById(
  params: GetCandidateByIdInput,
): Promise<CandidateDetail | null> {
  const session = await requireRoleCapability("staff", "candidate.search");

  const parsed = getCandidateByIdSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { candidateId } = parsed.data;

  const row = await prisma.candidate.findFirst({
    where: {
      candidate_id: candidateId,
      deleted: 0,
    },
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_name_ar: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_gender: true,
      candidate_objective: true,
      candidate_status: true,
      candidate_created_at: true,
      candidate_updated_at: true,
    },
  });

  if (!row) {
    // null is a legitimate "not found" response — skip output validation
    return null;
  }

  const result = {
    id: row.candidate_id,
    name: row.candidate_name,
    nameAr: row.candidate_name_ar ?? "",
    email: row.candidate_email,
    phone: row.candidate_phone,
    gender: row.candidate_gender,
    objective: row.candidate_objective,
    status: row.candidate_status,
    createdAt: row.candidate_created_at.toISOString(),
    updatedAt: row.candidate_updated_at.toISOString(),
  };

  // Validate output shape
  const outputParsed = candidateDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateById", outputParsed.error.issues);
  }

  return result;
}
