"use server";

// ---------------------------------------------------------------------------
// AdminContractsController — Contract CRUD server actions
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  contractDetailOutputSchema,
  contractMutationOutputSchema,
  listContractsOutputSchema,
  createContractSchema,
  deleteContractSchema,
  getContractSchema,
  listContractsSchema,
  updateContractSchema,
  type ContractActionResponse,
  type ContractDetail,
  type ContractRow,
  type CreateContractInput,
  type DeleteContractInput,
  type ListContractsInput,
  type UpdateContractInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/contracts] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListContractsParams = z.input<typeof listContractsSchema>;
export type CreateContractParams = z.input<typeof createContractSchema>;

// ---------------------------------------------------------------------------
// Shared includes for contract queries
// ---------------------------------------------------------------------------

const CONTRACT_INCLUDES = {
  company_contract_company_idTocompany: {
    select: { company_name: true },
  },
  candidate: {
    select: { candidate_name: true },
  },
  staff: {
    select: { staff_name: true },
  },
  store: {
    select: { store_name: true },
  },
  _count: { select: { transfer: true } },
} as const;

// ---------------------------------------------------------------------------
// listContracts
// ---------------------------------------------------------------------------

/**
 * List contracts with pagination and optional text search.
 */
export async function listContracts(
  input: ListContractsInput = {},
): Promise<{
  items: ContractRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listContractsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    deleted: false,
  };
  if (q && q.trim().length > 0) {
    where.OR = [
      { type: { contains: q.trim() } },
      { detail: { contains: q.trim() } },
    ];
  }

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: CONTRACT_INCLUDES,
    }),
    prisma.contract.count({ where: where as any }),
  ]);

  const result = {
    items: contracts.map((c): ContractRow => ({
      contract_uuid: c.contract_uuid,
      type: c.type,
      detail: c.detail,
      status: c.status,
      start_date: c.start_date?.toISOString() ?? null,
      end_date: c.end_date?.toISOString() ?? null,
      transfer_cost: c.transfer_cost ? Number(c.transfer_cost) : null,
      currency_code: c.currency_code,
      company_name: c.company_contract_company_idTocompany?.company_name ?? null,
      candidate_name: c.candidate?.candidate_name ?? null,
      created_at: c.created_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listContractsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listContracts", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getContract
// ---------------------------------------------------------------------------

/**
 * Get a single contract by UUID with related data.
 */
export async function getContract(
  contractUuid: string,
): Promise<ContractDetail> {
  await requireCapability("admin.read");

  const parsed = getContractSchema.safeParse({ contractUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contract UUID");
  }

  const contract = await prisma.contract.findFirst({
    where: { contract_uuid: parsed.data.contractUuid, deleted: false },
    include: CONTRACT_INCLUDES,
  });

  if (!contract) {
    return { contract: null };
  }

  const result = {
    contract: {
      contract_uuid: contract.contract_uuid,
      type: contract.type,
      detail: contract.detail,
      start_date: contract.start_date?.toISOString() ?? null,
      end_date: contract.end_date?.toISOString() ?? null,
      transfer_cost: contract.transfer_cost ? Number(contract.transfer_cost) : null,
      currency_code: contract.currency_code,
      status: contract.status,
      company_name: contract.company_contract_company_idTocompany?.company_name ?? null,
      candidate_name: contract.candidate?.candidate_name ?? null,
      created_by_name: contract.staff?.staff_name ?? null,
      store_name: contract.store?.store_name ?? null,
      auto_generate: contract.auto_generate ?? false,
      created_at: contract.created_at?.toISOString() ?? null,
      updated_at: contract.updated_at?.toISOString() ?? null,
    },
  };

  // Validate output shape
  const outputParsed = contractDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getContract", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// createContract
// ---------------------------------------------------------------------------

/**
 * Create a new contract.
 */
export async function createContract(
  input: CreateContractInput,
): Promise<ContractActionResponse> {
  await requireCapability("admin.write");

  const parsed = createContractSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const data: Record<string, unknown> = {
      type: parsed.data.type,
      company_id: parsed.data.companyId,
      candidate_id: parsed.data.candidateId ?? null,
      detail: parsed.data.detail ?? null,
      transfer_cost: parsed.data.transferCost ?? null,
      currency_code: parsed.data.currencyCode ?? "KWD",
      auto_generate: parsed.data.autoGenerate ?? false,
    };

    if (parsed.data.startDate) {
      data.start_date = new Date(parsed.data.startDate);
    }
    if (parsed.data.endDate) {
      data.end_date = new Date(parsed.data.endDate);
    }
    if (parsed.data.storeId) {
      data.store_id = parsed.data.storeId;
    }

    const contract = await prisma.contract.create({
      data: data as any,
    });

    revalidatePath("/admin/contracts");

    const result: ContractActionResponse = {
      operation: "success",
      message: `Contract "${contract.type}" created`,
      data: {
        contract_uuid: contract.contract_uuid,
        type: contract.type,
        detail: contract.detail,
        start_date: contract.start_date?.toISOString() ?? null,
        end_date: contract.end_date?.toISOString() ?? null,
        transfer_cost: contract.transfer_cost ? Number(contract.transfer_cost) : null,
        currency_code: contract.currency_code,
        status: contract.status,
        company_name: null,
        candidate_name: null,
        created_by_name: null,
        store_name: null,
        auto_generate: contract.auto_generate ?? false,
        created_at: contract.created_at?.toISOString() ?? null,
        updated_at: contract.updated_at?.toISOString() ?? null,
      },
    };

    // Validate output shape
    const outputParsed = contractMutationOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("createContract", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create contract",
    };
  }
}

// ---------------------------------------------------------------------------
// updateContract
// ---------------------------------------------------------------------------

/**
 * Update a contract's fields. Only provided fields are modified.
 */
export async function updateContract(
  input: UpdateContractInput,
): Promise<ContractActionResponse> {
  await requireCapability("admin.write");

  const parsed = updateContractSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.contract.findFirst({
    where: { contract_uuid: parsed.data.contractUuid, deleted: false },
    select: { contract_uuid: true, type: true },
  });

  if (!existing) {
    return { operation: "error", message: "Contract not found" };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.detail !== undefined) updateData.detail = parsed.data.detail;
  if (parsed.data.transferCost !== undefined) updateData.transfer_cost = parsed.data.transferCost;
  if (parsed.data.currencyCode !== undefined) updateData.currency_code = parsed.data.currencyCode;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.autoGenerate !== undefined) updateData.auto_generate = parsed.data.autoGenerate;
  if (parsed.data.startDate !== undefined) {
    updateData.start_date = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
  }
  if (parsed.data.endDate !== undefined) {
    updateData.end_date = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
  }

  try {
    const contract = await prisma.contract.update({
      where: { contract_uuid: parsed.data.contractUuid },
      data: updateData as any,
    });

    revalidatePath("/admin/contracts");
    revalidatePath(`/admin/contracts/${parsed.data.contractUuid}`);

    const result: ContractActionResponse = {
      operation: "success",
      message: `Contract "${contract.type}" updated`,
      data: {
        contract_uuid: contract.contract_uuid,
        type: contract.type,
        detail: contract.detail,
        start_date: contract.start_date?.toISOString() ?? null,
        end_date: contract.end_date?.toISOString() ?? null,
        transfer_cost: contract.transfer_cost ? Number(contract.transfer_cost) : null,
        currency_code: contract.currency_code,
        status: contract.status,
        company_name: null,
        candidate_name: null,
        created_by_name: null,
        store_name: null,
        auto_generate: contract.auto_generate ?? false,
        created_at: contract.created_at?.toISOString() ?? null,
        updated_at: contract.updated_at?.toISOString() ?? null,
      },
    };

    // Validate output shape
    const outputParsed = contractMutationOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateContract", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update contract",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteContract
// ---------------------------------------------------------------------------

/**
 * Soft-delete a contract. Refuses if transfers still exist.
 */
export async function deleteContract(
  input: DeleteContractInput,
): Promise<ContractActionResponse> {
  await requireCapability("admin.write");

  const parsed = deleteContractSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.contract.findFirst({
    where: { contract_uuid: parsed.data.contractUuid, deleted: false },
    include: {
      _count: { select: { transfer: true } },
    },
  });

  if (!existing) {
    return { operation: "error", message: "Contract not found or already deleted" };
  }

  if ((existing._count?.transfer ?? 0) > 0) {
    return {
      operation: "error",
      message: `Contract already has ${existing._count.transfer} transfer(s) assigned`,
    };
  }

  try {
    await prisma.contract.update({
      where: { contract_uuid: parsed.data.contractUuid },
      data: { deleted: true },
    });

    revalidatePath("/admin/contracts");

    const result: ContractActionResponse = { operation: "success", message: "Contract deleted successfully" };

    // Validate output shape
    const outputParsed = contractMutationOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("deleteContract", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete contract",
    };
  }
}
