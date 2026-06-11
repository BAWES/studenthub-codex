import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listContractsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.coerce.number().int().optional(),
  type: z.string().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  q: z.string().optional(),
});

export const getContractSchema = z.object({
  uuid: z.string().min(1, "Contract UUID is required"),
});

export const updateContractStatusSchema = z.object({
  uuid: z.string().min(1, "Contract UUID is required"),
  status: z.coerce.number().int().min(0).max(2, "Status must be 0 (inactive), 1 (active), or 2 (terminated)"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListContractsInput = z.input<typeof listContractsSchema>;
export type GetContractInput = z.input<typeof getContractSchema>;
export type UpdateContractStatusInput = z.input<typeof updateContractStatusSchema>;

export type ContractRow = {
  contract_uuid: string;
  candidate_name: string | null;
  company_name: string | null;
  type: string;
  status: number;
  status_label: string;
  start_date: string | null;
  end_date: string | null;
  transfer_cost: string | null;
  currency_code: string | null;
  created_at: string | null;
};

export type ContractDetail = {
  contract: {
    contract_uuid: string;
    type: string;
    detail: string | null;
    status: number;
    status_label: string;
    start_date: string | null;
    end_date: string | null;
    transfer_cost: string | null;
    currency_code: string | null;
    auto_generate: boolean;
    created_at: string | null;
    updated_at: string | null;
    candidate: { candidate_name: string | null } | null;
    company: { company_name: string | null } | null;
  } | null;
};

export type ListContractsResult = {
  items: ContractRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ContractActionResponse = {
  operation: "success" | "error";
  message: string;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Validates the contract detail output shape. */
export const contractDetailOutputSchema = z.object({
  contract: z.object({
    contract_uuid: z.string(),
    type: z.string(),
    detail: z.string().nullable(),
    status: z.number().int(),
    status_label: z.string(),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    transfer_cost: z.string().nullable(),
    currency_code: z.string().nullable(),
    auto_generate: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    candidate: z.object({ candidate_name: z.string().nullable() }).nullable(),
    company: z.object({ company_name: z.string().nullable() }).nullable(),
  }).nullable(),
});

/** Validates the updateContractStatus success response. */
export const updateContractStatusOutputSchema = z.object({
  success: z.literal(true),
});
