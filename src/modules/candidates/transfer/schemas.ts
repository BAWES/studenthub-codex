import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listTransferCandidatesSchema = z.object({
  tcId: z.string().optional(), // comma-separated tc_ids
  transferConfirmationId: z.string().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  transferId: z.coerce.number().int().positive().optional(),
  transferFileId: z.coerce.number().int().positive().optional(),
});

export const getTransferCandidateSchema = z.object({
  tcId: z.coerce.number().int().positive("Transfer candidate ID is required"),
});

export type ListTransferCandidatesParams = z.input<
  typeof listTransferCandidatesSchema
>;
export type GetTransferCandidateParams = z.input<
  typeof getTransferCandidateSchema
>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const transferCandidateItemSchema = z.object({
  tc_id: z.number().int(),
  transfer_id: z.number().int().nullable(),
  candidate_id: z.number().int().nullable(),
  prev_candidate_id: z.number().int().nullable(),
  store_id: z.number().int().nullable(),
  store_name: z.string().nullable(),
  company_id: z.number().int().nullable(),
  company_name: z.string().nullable(),
  company_email: z.string().nullable(),
  bank_id: z.number().int().nullable(),
  transfer_confirmation_id: z.string().nullable(),
  transfer_file_id: z.number().int().nullable(),
  transfer_benef_name: z.string().nullable(),
  transfer_benef_iban: z.string().nullable(),
  candidate_hourly_rate: z.number().nullable(),
  company_hourly_rate: z.number().nullable(),
  hours: z.number().int().nullable(),
  minutes: z.number().int().nullable(),
  seconds: z.number().int().nullable(),
  bonus: z.number().nullable(),
  bonus_commission: z.number().nullable(),
  transfer_cost: z.number().nullable(),
  candidate_total: z.number().nullable(),
  company_total: z.number().nullable(),
  deleted: z.number().int(),
  paid: z.number().int(),
  is_candidate_notified: z.boolean().nullable(),
  currency_code: z.string().nullable(),
  contract_uuid: z.string().nullable(),
  tc_created_at: z.date(),
  tc_updated_at: z.date(),
  candidate: z
    .object({
      candidate_id: z.number().int(),
      candidate_name: z.string().nullable(),
      candidate_name_ar: z.string().nullable(),
    })
    .nullable(),
  transfer: z
    .object({
      transfer_id: z.number().int(),
      transfer_status: z.number().int(),
    })
    .nullable(),
});

export type TransferCandidateItem = z.output<typeof transferCandidateItemSchema>;
export const transferCandidateDetailSchema =
  transferCandidateItemSchema.nullable();
export type TransferCandidateDetail = z.output<
  typeof transferCandidateDetailSchema
>;

export const listTransferCandidatesResultSchema = z.object({
  items: z.array(transferCandidateItemSchema),
  total: z.number().int().nonnegative(),
});

export type ListTransferCandidatesResult = z.output<
  typeof listTransferCandidatesResultSchema
>;
