"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  contractDetailSchema,
  listContractsResultSchema,
  type ContractRelatedDetail,
  type ContractListItem,
  type ListContractsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listContractsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z
    .enum(["Fixed Price", "Hourly", "Monthly Salary"])
    .optional()
    .nullable(),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});


// ---------------------------------------------------------------------------
// getContract — Schema
// ---------------------------------------------------------------------------

const getContractSchema = z.object({
  contract_uuid: z.string().min(1, "contract_uuid is required"),
});


// ---------------------------------------------------------------------------
// getContract
// ---------------------------------------------------------------------------

/**
 * Get a single contract by its UUID, including its detail model.
 *
 * Mirrors the legacy Yii2 ContractController::actionView / actionDetail:
 * - Looks up by contract_uuid
 * - Excludes soft-deleted contracts
 * - Includes the relevant detail model (fixed_price_contract, hourly_contract,
 *   monthly_salary_contract)
 * - Returns null when not found
 */
export async function getContract(
  params: FormData | { contract_uuid: string },
): Promise<ContractRelatedDetail | null> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? { contract_uuid: params.get("contract_uuid") }
      : params;

  const parsed = getContractSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const { contract_uuid } = parsed.data;

  const contract = await prisma.contract.findFirst({
    where: {
      contract_uuid,
      deleted: false,
    },
    include: {
      fixed_price_contract: true,
      hourly_contract: true,
      monthly_salary_contract: true,
    },
  });

  if (!contract) {
    const nullResult: ContractRelatedDetail | null = null;

    // Validate output shape
    const outputParsed = contractDetailSchema.safeParse(nullResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/contracts] getContract output validation failed:",
        outputParsed.error.issues,
      );
    }

    return nullResult;
  }

  const record = contract as any;

  let result: ContractRelatedDetail | null = null;

  if (record.fixed_price_contract?.length) {
    const fp = record.fixed_price_contract[0] as any;
    result = {
      type: "Fixed Price" as const,
      fp_contract_uuid: fp.fp_contract_uuid,
      candidate_total: Number(fp.candidate_total),
      company_total: Number(fp.company_total),
      completion_percentage: fp.completion_percentage,
    };
  } else if (record.hourly_contract?.length) {
    const h = record.hourly_contract[0] as any;
    result = {
      type: "Hourly" as const,
      h_contract_uuid: h.h_contract_uuid,
      candidate_hourly_rate: Number(h.candidate_hourly_rate),
      company_hourly_rate: Number(h.company_hourly_rate),
    };
  } else if (record.monthly_salary_contract?.length) {
    const ms = record.monthly_salary_contract[0] as any;
    result = {
      type: "Monthly Salary" as const,
      ms_contract_uuid: ms.ms_contract_uuid,
      candidate_total: Number(ms.candidate_total),
      company_total: Number(ms.company_total),
      salary_day: ms.salary_day,
    };
  }

  // Validate output shape
  const outputParsed = contractDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/contracts] getContract output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// listContracts
// ---------------------------------------------------------------------------

/**
 * List contracts with optional type filter, candidate, and company filters.
 *
 * Mirrors the legacy Yii2 ContractController::actionList:
 * - Filters by type ("Fixed Price", "Hourly", "Monthly Salary")
 * - Filters by candidate_id or company_id when provided
 * - Includes the relevant detail model (fixed_price_contract, hourly_contract, monthly_salary_contract)
 * - Excludes soft-deleted contracts
 * - Paginated with configurable page/limit
 */
export async function listContracts(
  params: FormData | z.input<typeof listContractsSchema> = {},
): Promise<ListContractsResult> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          type: params.get("type"),
          candidateId: params.get("candidateId"),
          companyId: params.get("companyId"),
        }
      : params;

  const parsed = listContractsSchema.safeParse(raw);
  if (!parsed.success) {
    return { contracts: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, type, candidateId, companyId } = parsed.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = { deleted: false };
  if (type) {
    where.type = type;
  }
  if (candidateId) {
    where.candidate_id = candidateId;
  }
  if (companyId) {
    where.company_id = companyId;
  }

  // Build include for the relevant detail model based on type filter
  // When no type filter is specified, include all three detail models
  const include: Record<string, unknown> = {};

  if (!type || type === "Fixed Price") {
    include.fixed_price_contract = true;
  }
  if (!type || type === "Hourly") {
    include.hourly_contract = true;
  }
  if (!type || type === "Monthly Salary") {
    include.monthly_salary_contract = true;
  }

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where: where as any,
      include: include as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.contract.count({ where: where as any }),
  ]);

  const result: ListContractsResult = {
    contracts: contracts.map((c: Record<string, unknown>): ContractListItem => {
      let detailModel: ContractRelatedDetail | null = null;
      const raw = c as any;

      if (raw.fixed_price_contract?.length) {
        const fp = raw.fixed_price_contract[0] as any;
        detailModel = {
          type: "Fixed Price",
          fp_contract_uuid: fp.fp_contract_uuid,
          candidate_total: Number(fp.candidate_total),
          company_total: Number(fp.company_total),
          completion_percentage: fp.completion_percentage,
        };
      } else if (raw.hourly_contract?.length) {
        const h = raw.hourly_contract[0] as any;
        detailModel = {
          type: "Hourly",
          h_contract_uuid: h.h_contract_uuid,
          candidate_hourly_rate: Number(h.candidate_hourly_rate),
          company_hourly_rate: Number(h.company_hourly_rate),
        };
      } else if (raw.monthly_salary_contract?.length) {
        const ms = raw.monthly_salary_contract[0] as any;
        detailModel = {
          type: "Monthly Salary",
          ms_contract_uuid: ms.ms_contract_uuid,
          candidate_total: Number(ms.candidate_total),
          company_total: Number(ms.company_total),
          salary_day: ms.salary_day,
        };
      }

      return {
        contract_uuid: raw.contract_uuid,
        candidate_id: raw.candidate_id,
        company_id: raw.company_id,
        type: raw.type,
        detail: raw.detail,
        start_date: raw.start_date?.toISOString() ?? null,
        end_date: raw.end_date?.toISOString() ?? null,
        transfer_cost: raw.transfer_cost ? Number(raw.transfer_cost) : null,
        currency_code: raw.currency_code,
        status: raw.status,
        created_at: raw.created_at?.toISOString() ?? null,
        detailModel,
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listContractsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/contracts] listContracts output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
