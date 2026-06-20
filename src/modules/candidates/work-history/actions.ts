"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateWorkHistorySchema,
  getCandidateWorkHistorySchema,
  candidateWorkHistoryItemSchema,
  listCandidateWorkHistoryResultSchema,
  type ListCandidateWorkHistoryInput,
  type GetCandidateWorkHistoryInput,
  type CandidateWorkHistoryItem,
  type ListCandidateWorkHistoryResult,
  type CandidateWorkHistoryDetail,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_work_history row to the shared item shape. */
function toItem(
  row: PrismaCandidateWorkHistoryRow,
): CandidateWorkHistoryItem {
  return {
    id: row.id,
    candidate_id: row.candidate_id ?? null,
    contract_uuid: row.contract_uuid ?? null,
    store_id: row.store_id ?? null,
    company_id: row.company_id ?? null,
    parent_company_id: row.parent_company_id ?? null,
    staff_id: row.staff_id ?? null,
    start_date: row.start_date?.toISOString() ?? null,
    end_date: row.end_date?.toISOString() ?? null,
    candidate_hourly_rate: row.candidate_hourly_rate
      ? Number(row.candidate_hourly_rate)
      : null,
    company_hourly_rate: row.company_hourly_rate
      ? Number(row.company_hourly_rate)
      : null,
    transfer_cost: row.transfer_cost ? Number(row.transfer_cost) : null,
    deleted: row.deleted ?? false,
  };
}

/** Non-null Prisma row shape. The findUnique/findMany results are asserted above. */
type PrismaCandidateWorkHistoryRow = NonNullable<
  Awaited<ReturnType<typeof prisma.candidate_work_history.findFirst>>
>;

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List work history records for a candidate.
 * Maps to legacy CandidateWorkHistoryController::actionIndex.
 * Requires candidate.read capability.
 */
export async function listCandidateWorkHistory(
  params: ListCandidateWorkHistoryInput,
): Promise<ListCandidateWorkHistoryResult> {
  await requireCapability("candidate.read");

  const { candidateId, page, limit } =
    listCandidateWorkHistorySchema.parse(params);

  const where = {
    candidate_id: candidateId,
    deleted: false,
  };

  const [rows, total] = await Promise.all([
    prisma.candidate_work_history.findMany({
      where,
      orderBy: [{ start_date: { sort: "desc", nulls: "last" } }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_work_history.count({ where }),
  ]);

  const result = {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };

  // Validate output shape
  const outputParsed = listCandidateWorkHistoryResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/work-history] listCandidateWorkHistory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single work history record by ID.
 * Maps to legacy CandidateWorkHistoryController::actionView.
 * Requires candidate.read capability.
 * Returns null if the record does not exist.
 */
export async function getCandidateWorkHistory(
  params: GetCandidateWorkHistoryInput,
): Promise<CandidateWorkHistoryDetail> {
  await requireCapability("candidate.read");

  const { id } = getCandidateWorkHistorySchema.parse(params);

  const row = await prisma.candidate_work_history.findUnique({
    where: { id },
  });

  if (!row) return null;

  const item = toItem(row);

  // Validate output shape
  const outputParsed = candidateWorkHistoryItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/work-history] getCandidateWorkHistory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item;
}
