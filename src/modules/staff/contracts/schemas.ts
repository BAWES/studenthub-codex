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

export type ContractRow = z.output<typeof contractRowOutputSchema>;
export type ContractDetail = z.output<typeof contractDetailOutputSchema>;
export type ListContractsResult = z.output<typeof contractListOutputSchema>;

/** Validates the ContractActionResponse return shape (updateContractStatus etc.) */
export const contractActionResponseOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

export type ContractActionResponse = z.output<typeof contractActionResponseOutputSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single contract row returned in list results.
 */
export const contractRowOutputSchema = z.object({
  contract_uuid: z.string(),
  candidate_name: z.string().nullable(),
  company_name: z.string().nullable(),
  type: z.string(),
  status: z.number().int(),
  status_label: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  transfer_cost: z.string().nullable(),
  currency_code: z.string().nullable(),
  created_at: z.string().nullable(),
});

/**
 * Validates the listContracts return shape.
 */
export const contractListOutputSchema = z.object({
  items: z.array(contractRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Validates a contract detail object returned by getContractDetail.
 */
export const contractDetailObjectOutputSchema = z.object({
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
  candidate: z
    .object({ candidate_name: z.string().nullable() })
    .nullable(),
  company: z
    .object({ company_name: z.string().nullable() })
    .nullable(),
});

/**
 * Validates the getContractDetail return shape.
 */
export const contractDetailOutputSchema = z.object({
  contract: contractDetailObjectOutputSchema.nullable(),
});

/**
 * Validates mutation result (updateContractStatus).
 */
export const contractStatusUpdateOutputSchema = z.object({
  success: z.boolean(),
});
