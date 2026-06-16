import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCandidateWorkHistorySchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCandidateWorkHistorySchema = z.object({
  id: z.coerce.number().int().positive("Work history ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single work history item in the response.
 */
export const candidateWorkHistoryItemSchema = z.object({
  id: z.number().int().positive(),
  candidate_id: z.number().int().nullable(),
  contract_uuid: z.string().nullable(),
  store_id: z.number().int().nullable(),
  company_id: z.number().int().nullable(),
  parent_company_id: z.number().int().nullable(),
  staff_id: z.number().int().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  candidate_hourly_rate: z.number().nullable(),
  company_hourly_rate: z.number().nullable(),
  transfer_cost: z.number().nullable(),
  deleted: z.boolean(),
});

/**
 * Schema for the listCandidateWorkHistory response.
 */
export const listCandidateWorkHistoryResultSchema = z.object({
  items: z.array(candidateWorkHistoryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidateWorkHistoryInput = z.input<
  typeof listCandidateWorkHistorySchema
>;
export type GetCandidateWorkHistoryInput = z.input<
  typeof getCandidateWorkHistorySchema
>;

export type CandidateWorkHistoryItem = z.output<
  typeof candidateWorkHistoryItemSchema
>;
export type ListCandidateWorkHistoryResult = z.output<
  typeof listCandidateWorkHistoryResultSchema
>;
export const candidateWorkHistoryDetailSchema =
  candidateWorkHistoryItemSchema.nullable();
export type CandidateWorkHistoryDetail = z.output<
  typeof candidateWorkHistoryDetailSchema
>;
