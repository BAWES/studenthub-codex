"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listTransferCandidatesSchema,
  getTransferCandidateSchema,
  transferCandidateItemSchema,
  listTransferCandidatesResultSchema,
  type ListTransferCandidatesParams,
  type GetTransferCandidateParams,
  type TransferCandidateItem,
  type TransferCandidateDetail,
  type ListTransferCandidatesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma transfer_candidate row to the shared item shape. */
function toItem(
  row: TransferCandidateRow,
): TransferCandidateItem {
  return {
    tc_id: row.tc_id,
    transfer_id: row.transfer_id,
    candidate_id: row.candidate_id,
    prev_candidate_id: row.prev_candidate_id,
    store_id: row.store_id,
    store_name: row.store_name,
    company_id: row.company_id,
    company_name: row.company_name,
    company_email: row.company_email,
    bank_id: row.bank_id,
    transfer_confirmation_id: row.transfer_confirmation_id,
    transfer_file_id: row.transfer_file_id,
    transfer_benef_name: row.transfer_benef_name,
    transfer_benef_iban: row.transfer_benef_iban,
    candidate_hourly_rate: row.candidate_hourly_rate
      ? Number(row.candidate_hourly_rate)
      : null,
    company_hourly_rate: row.company_hourly_rate
      ? Number(row.company_hourly_rate)
      : null,
    hours: row.hours ?? null,
    minutes: row.minutes ?? null,
    seconds: row.seconds ?? null,
    bonus: row.bonus ? Number(row.bonus) : null,
    bonus_commission: row.bonus_commission ? Number(row.bonus_commission) : null,
    transfer_cost: row.transfer_cost ? Number(row.transfer_cost) : null,
    candidate_total: row.candidate_total
      ? Number(row.candidate_total)
      : null,
    company_total: row.company_total ? Number(row.company_total) : null,
    deleted: row.deleted,
    paid: row.paid,
    is_candidate_notified: row.is_candidate_notified,
    currency_code: row.currency_code,
    contract_uuid: row.contract_uuid,
    tc_created_at: row.tc_created_at,
    tc_updated_at: row.tc_updated_at,
    candidate: row.candidate
      ? {
          candidate_id: row.candidate.candidate_id,
          candidate_name: row.candidate.candidate_name,
          candidate_name_ar: row.candidate.candidate_name_ar,
        }
      : null,
    transfer: row.transfer
      ? {
          transfer_id: row.transfer.transfer_id,
          transfer_status: row.transfer.transfer_status,
        }
      : null,
  };
}

/** Shape returned by Prisma include. */
type TransferCandidateRow = Awaited<
  ReturnType<typeof prisma.transfer_candidate.findFirst>
> & {
  candidate: {
    candidate_id: number;
    candidate_name: string;
    candidate_name_ar: string;
  } | null;
  transfer: {
    transfer_id: number;
    transfer_status: number;
  } | null;
};

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List transfer candidates with optional filters.
 * Maps to legacy TransferCandidateController::actionList.
 * Requires candidate.read capability.
 */
export async function listTransferCandidates(
  params: ListTransferCandidatesParams,
): Promise<ListTransferCandidatesResult> {
  await requireCapability("candidate.read");

  const { tcId, transferConfirmationId, candidateId, transferId, transferFileId } =
    listTransferCandidatesSchema.parse(params);

  const where: Record<string, unknown> = {};

  if (tcId) {
    const ids = tcId
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (ids.length > 0) {
      where.tc_id = { in: ids };
    }
  }

  if (transferConfirmationId) {
    where.transfer_confirmation_id = transferConfirmationId;
  }

  if (candidateId) {
    where.candidate_id = candidateId;
  }

  if (transferId) {
    where.transfer_id = transferId;
  }

  if (transferFileId) {
    where.transfer_file_id = transferFileId;
  }

  const [rows, total] = await Promise.all([
    prisma.transfer_candidate.findMany({
      where,
      orderBy: [{ tc_created_at: "desc" }, { tc_id: "desc" }],
      include: {
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_name_ar: true,
          },
        },
        transfer: {
          select: {
            transfer_id: true,
            transfer_status: true,
          },
        },
      },
    }),
    prisma.transfer_candidate.count({ where }),
  ]);

  const result = {
    items: rows.map(toItem),
    total,
  };

  // Validate output shape
  const outputParsed = listTransferCandidatesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/transfer] listTransferCandidates output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single transfer candidate by ID.
 * Maps to legacy TransferCandidateController::actionView.
 * Requires candidate.read capability.
 * Returns null if not found.
 */
export async function getTransferCandidate(
  params: GetTransferCandidateParams,
): Promise<TransferCandidateDetail> {
  await requireCapability("candidate.read");

  const { tcId } = getTransferCandidateSchema.parse(params);

  const row = await prisma.transfer_candidate.findUnique({
    where: { tc_id: tcId },
    include: {
      candidate: {
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_name_ar: true,
        },
      },
      transfer: {
        select: {
          transfer_id: true,
          transfer_status: true,
        },
      },
    },
  });

  if (!row) return null;

  const result = toItem(row);

  // Validate output shape
  const outputParsed = transferCandidateItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/transfer] getTransferCandidate output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
