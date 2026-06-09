"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CandidateWorkHistoryItem = {
  id: number;
  candidate_id: number | null;
  contract_uuid: string | null;
  store_id: number | null;
  company_id: number | null;
  parent_company_id: number | null;
  staff_id: number | null;
  start_date: string | null;
  end_date: string | null;
  candidate_hourly_rate: number | null;
  company_hourly_rate: number | null;
  transfer_cost: number | null;
  deleted: boolean;
};

export type CandidateWorkHistoryDetail = CandidateWorkHistoryItem | null;

export type ListCandidateWorkHistoryResult = {
  items: CandidateWorkHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCandidateWorkHistorySchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCandidateWorkHistorySchema = z.object({
  id: z.coerce.number().int().positive("Work history ID is required"),
});

export type ListCandidateWorkHistoryParams = z.input<
  typeof listCandidateWorkHistorySchema
>;
export type GetCandidateWorkHistoryParams = z.input<
  typeof getCandidateWorkHistorySchema
>;

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
  params: ListCandidateWorkHistoryParams,
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

  return {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };
}

/**
 * Get a single work history record by ID.
 * Maps to legacy CandidateWorkHistoryController::actionView.
 * Requires candidate.read capability.
 * Returns null if the record does not exist.
 */
export async function getCandidateWorkHistory(
  params: GetCandidateWorkHistoryParams,
): Promise<CandidateWorkHistoryDetail> {
  await requireCapability("candidate.read");

  const { id } = getCandidateWorkHistorySchema.parse(params);

  const row = await prisma.candidate_work_history.findUnique({
    where: { id },
  });

  if (!row) return null;

  return toItem(row);
}
