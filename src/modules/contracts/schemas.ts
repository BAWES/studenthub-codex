import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for the contract related detail discriminated by type.
 */
export const fixedPriceDetailSchema = z.object({
  type: z.literal("Fixed Price"),
  fp_contract_uuid: z.string(),
  candidate_total: z.number(),
  company_total: z.number(),
  completion_percentage: z.number().nullable(),
});

export const hourlyDetailSchema = z.object({
  type: z.literal("Hourly"),
  h_contract_uuid: z.string(),
  candidate_hourly_rate: z.number(),
  company_hourly_rate: z.number(),
});

export const monthlySalaryDetailSchema = z.object({
  type: z.literal("Monthly Salary"),
  ms_contract_uuid: z.string(),
  candidate_total: z.number(),
  company_total: z.number(),
  salary_day: z.number().nullable(),
});

/**
 * Discriminated union for ContractRelatedDetail.
 */
export const contractRelatedDetailSchema = z.discriminatedUnion("type", [
  fixedPriceDetailSchema,
  hourlyDetailSchema,
  monthlySalaryDetailSchema,
]);

/**
 * Schema for a single contract list item.
 */
export const contractListItemSchema = z.object({
  contract_uuid: z.string(),
  candidate_id: z.number().nullable(),
  company_id: z.number(),
  type: z.string(),
  detail: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  transfer_cost: z.number().nullable(),
  currency_code: z.string().nullable(),
  status: z.number(),
  created_at: z.string().nullable(),
  detailModel: contractRelatedDetailSchema.nullable(),
});

/**
 * Schema for getContract return type (detail or null).
 */
export const contractDetailSchema = contractRelatedDetailSchema.nullable();

/**
 * Schema for the listContracts response.
 */
export const listContractsResultSchema = z.object({
  contracts: z.array(contractListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ContractRelatedDetail = z.output<typeof contractRelatedDetailSchema>;
export type ContractListItem = z.output<typeof contractListItemSchema>;
export type ListContractsResult = z.output<typeof listContractsResultSchema>;
