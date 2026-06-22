"use server";

// ---------------------------------------------------------------------------
// Staff ContractController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 staff module contract controller
//
// Actions:
//   - listContracts        — paginated list of contracts with candidate &
//                            company info
//   - getContractDetail    — single contract detail
//   - updateContractStatus — update the status of a contract
//
// Contract status convention:
//   0 = inactive
//   1 = active
//   2 = terminated
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listContractsSchema,
  getContractSchema,
  updateContractStatusSchema,
  contractListOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
} from "./schemas";
import type {
  ListContractsInput,
  GetContractInput,
  UpdateContractStatusInput,
  ContractRow,
  ContractDetail,
  ListContractsResult,
} from "./schemas";

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/staff/contracts] ${source} output validation failed:`, error);
}

// ---------------------------------------------------------------------------
// Status map
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<number, string> = {
  0: "inactive",
  1: "active",
  2: "terminated",
};

function getStatusLabel(status: number): string {
  return STATUS_LABELS[status] ?? `unknown (${status})`;
}

// ---------------------------------------------------------------------------
// listContracts
// ---------------------------------------------------------------------------

/**
 * List contracts with pagination and filtering.
 * Supports filtering by status, type, candidateId, companyId, and free-text search (q).
 */
export async function listContracts(
  input: ListContractsInput = {},
): Promise<ListContractsResult> {
  await requireCapability("contracts.read");

  const parsed = listContractsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, type, candidateId, companyId, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: false };
  if (status !== undefined) where.status = status;
  if (type !== undefined) where.type = type;
  if (candidateId !== undefined) where.candidate_id = candidateId;
  if (companyId !== undefined) where.company_id = companyId;

  // Free-text search across candidate name, company name, and contract type
  if (q && q.trim().length > 0) {
    where.OR = [
      { type: { contains: q.trim() } },
      { detail: { contains: q.trim() } },
      { candidate: { candidate_name: { contains: q.trim() } } },
      { company_contract_company_idTocompany: { company_name: { contains: q.trim() } } },
    ];
  }

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        candidate: { select: { candidate_name: true } },
        company_contract_company_idTocompany: { select: { company_name: true } },
      },
    }),
    prisma.contract.count({ where: where as any }),
  ]);

  const result = {
    items: contracts.map((c: any): ContractRow => ({
      contract_uuid: c.contract_uuid,
      candidate_name: c.candidate?.candidate_name ?? null,
      company_name: c.company_contract_company_idTocompany?.company_name ?? null,
      type: c.type,
      status: c.status,
      status_label: getStatusLabel(c.status),
      start_date: c.start_date?.toISOString() ?? null,
      end_date: c.end_date?.toISOString() ?? null,
      transfer_cost: c.transfer_cost ? c.transfer_cost.toString() : null,
      currency_code: c.currency_code ?? null,
      created_at: c.created_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = contractListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listContracts", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getContractDetail
// ---------------------------------------------------------------------------

/**
 * Get a single contract by UUID with full detail.
 */
export async function getContractDetail(
  input: GetContractInput,
): Promise<ContractDetail> {
  await requireCapability("contracts.read");

  const parsed = getContractSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contract UUID");
  }

  const contract = await prisma.contract.findFirst({
    where: { contract_uuid: parsed.data.uuid, deleted: false },
    include: {
      candidate: { select: { candidate_name: true } },
      company_contract_company_idTocompany: { select: { company_name: true } },
    },
  });

  if (!contract) {
    const nullResult = { contract: null };
    const nullParsed = contractDetailOutputSchema.safeParse(nullResult);
    if (!nullParsed.success) {
      logOutputError("getContractDetail", nullParsed.error.issues);
    }
    return nullResult;
  }

  const c = contract as any;

  const result = {
    contract: {
      contract_uuid: c.contract_uuid,
      type: c.type,
      detail: c.detail ?? null,
      status: c.status,
      status_label: getStatusLabel(c.status),
      start_date: c.start_date?.toISOString() ?? null,
      end_date: c.end_date?.toISOString() ?? null,
      transfer_cost: c.transfer_cost ? c.transfer_cost.toString() : null,
      currency_code: c.currency_code ?? null,
      auto_generate: c.auto_generate ?? false,
      created_at: c.created_at?.toISOString() ?? null,
      updated_at: c.updated_at?.toISOString() ?? null,
      candidate: c.candidate
        ? { candidate_name: c.candidate.candidate_name }
        : null,
      company: c.company_contract_company_idTocompany
        ? { company_name: c.company_contract_company_idTocompany.company_name }
        : null,
    },
  };

  // Validate output shape
  const outputParsed = contractDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getContractDetail", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateContractStatus
// ---------------------------------------------------------------------------

/**
 * Update the status of a contract.
 * Validates that the contract exists before updating.
 * Supports transitions to 0 (inactive), 1 (active), or 2 (terminated).
 * Returns { success: boolean } and revalidates relevant paths.
 */
export async function updateContractStatus(
  input: UpdateContractStatusInput,
): Promise<{ success: boolean }> {
  await requireCapability("contracts.write");

  const parsed = updateContractStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const contract = await prisma.contract.findFirst({
    where: { contract_uuid: parsed.data.uuid, deleted: false },
    select: { contract_uuid: true, status: true },
  });

  if (!contract) {
    throw new Error("Contract not found");
  }

  try {
    await prisma.contract.update({
      where: { contract_uuid: parsed.data.uuid },
      data: {
        status: parsed.data.status,
        updated_at: new Date(),
      },
    });

    revalidatePath("/staff/contracts");
    revalidatePath(`/staff/contracts/${parsed.data.uuid}`);

    const result = { success: true };

    // Validate output shape
    const outputParsed = contractStatusUpdateOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateContractStatus", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Failed to update contract status",
    );
  }
}
