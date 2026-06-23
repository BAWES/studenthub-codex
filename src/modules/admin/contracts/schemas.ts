import { z } from "zod";

// ---------------------------------------------------------------------------
// listContracts schemas
// ---------------------------------------------------------------------------

export const listContractsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});
export type ListContractsInput = z.input<typeof listContractsSchema>;

export interface ContractRow {
  contract_uuid: string;
  type: string;
  detail: string | null;
  status: number;
  start_date: string | null;
  end_date: string | null;
  transfer_cost: number | null;
  currency_code: string | null;
  company_name: string | null;
  candidate_name: string | null;
  created_at: string | null;
}

// ---- Output validation for listContracts ----

export const contractRowOutputSchema = z.object({
  contract_uuid: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  status: z.number().int(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  transfer_cost: z.number().nullable(),
  currency_code: z.string().nullable(),
  company_name: z.string().nullable(),
  candidate_name: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const listContractsOutputSchema = z.object({
  items: z.array(contractRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// getContract schemas
// ---------------------------------------------------------------------------

export const getContractSchema = z.object({
  contractUuid: z.string().min(1, "Contract UUID is required"),
});
export type GetContractInput = z.input<typeof getContractSchema>;

export interface ContractDetail {
  contract: {
    contract_uuid: string;
    type: string;
    detail: string | null;
    start_date: string | null;
    end_date: string | null;
    transfer_cost: number | null;
    currency_code: string | null;
    status: number;
    company_name: string | null;
    candidate_name: string | null;
    created_by_name: string | null;
    store_name: string | null;
    auto_generate: boolean;
    created_at: string | null;
    updated_at: string | null;
  } | null;
}

// ---- Output validation for getContract ----

export const contractObjectOutputSchema = z.object({
  contract_uuid: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  transfer_cost: z.number().nullable(),
  currency_code: z.string().nullable(),
  status: z.number().int(),
  company_name: z.string().nullable(),
  candidate_name: z.string().nullable(),
  created_by_name: z.string().nullable(),
  store_name: z.string().nullable(),
  auto_generate: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const contractDetailOutputSchema = z.object({
  contract: contractObjectOutputSchema.nullable(),
});

// ---------------------------------------------------------------------------
// createContract schemas
// ---------------------------------------------------------------------------

export const createContractSchema = z.object({
  type: z.string().min(1, "Contract type is required").max(255),
  companyId: z.coerce.number().int().positive("Company is required"),
  candidateId: z.coerce.number().int().positive().optional().nullable(),
  detail: z.string().optional().nullable(),
  transferCost: z.coerce.number().optional().nullable(),
  currencyCode: z.string().max(3).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  storeId: z.coerce.number().int().positive().optional().nullable(),
  autoGenerate: z.boolean().optional().nullable(),
});
export type CreateContractInput = z.input<typeof createContractSchema>;

// ---------------------------------------------------------------------------
// updateContract schemas
// ---------------------------------------------------------------------------

export const updateContractSchema = z.object({
  contractUuid: z.string().min(1),
  type: z.string().min(1).max(255).optional(),
  detail: z.string().optional().nullable(),
  transferCost: z.coerce.number().optional().nullable(),
  currencyCode: z.string().max(3).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.coerce.number().int().optional(),
  autoGenerate: z.boolean().optional().nullable(),
});
export type UpdateContractInput = z.input<typeof updateContractSchema>;

// ---------------------------------------------------------------------------
// deleteContract schemas
// ---------------------------------------------------------------------------

export const deleteContractSchema = z.object({
  contractUuid: z.string().min(1),
});
export type DeleteContractInput = z.input<typeof deleteContractSchema>;

// ---------------------------------------------------------------------------
// Shared response types
// ---------------------------------------------------------------------------

export type ContractActionResponse =
  | { operation: "success"; message: string; data?: ContractDetail["contract"] }
  | { operation: "error"; message: string };

// ---- Output validation for mutations ----

export const contractMutationOutputSchema = z.object({
  operation: z.literal("success").or(z.literal("error")),
  message: z.string(),
  data: contractObjectOutputSchema.optional(),
});

// ---------------------------------------------------------------------------
// Legacy/compat output schemas
// ---------------------------------------------------------------------------

export const contractItemSchema = z.object({
  contract_uuid: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  status: z.number().int(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  transfer_cost: z.number().nullable(),
  currency_code: z.string().nullable(),
  company_name: z.string().nullable(),
  candidate_name: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const listContractsResultSchema = z.object({
  contracts: z.array(contractItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const contractOperationResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type ContractItem = z.output<typeof contractItemSchema>;
export type ListContractsResult = z.output<typeof listContractsResultSchema>;
export type ContractOperationResult = z.output<typeof contractOperationResultSchema>;
