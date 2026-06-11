import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const candidateIdRequestItemSchema = z.object({
  cir_uuid: z.string(),
  candidate_ids: z.string().nullable(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  created_by: z.number().nullable(),
  updated_by: z.number().nullable(),
});

export type CandidateIdRequestItem = z.output<typeof candidateIdRequestItemSchema>;

export const listIdRequestsResultSchema = z.object({
  requests: z.array(candidateIdRequestItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListIdRequestsResult = z.output<typeof listIdRequestsResultSchema>;

export const idRequestMutationResultSchema = z.object({
  operation: z.string(),
  message: z.unknown().optional(),
});

export type IdRequestMutationResult = z.output<typeof idRequestMutationResultSchema>;

export const listIdRequestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getIdRequestSchema = z.object({
  uuid: z.string().min(1, "ID request UUID is required"),
});
export const regenerateIdRequestSchema = z.object({
  uuid: z.string().min(1, "ID request UUID is required"),
});
export const deleteIdRequestSchema = z.object({
  uuid: z.string().min(1, "ID request UUID is required"),
});