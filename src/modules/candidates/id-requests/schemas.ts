import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const idRequestListItemSchema = z.object({
  cir_uuid: z.string(),
  candidate_count: z.number(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type IdRequestListItem = z.output<typeof idRequestListItemSchema>;

export const idRequestDetailSchema = z.object({
  cir_uuid: z.string(),
  candidate_ids: z.string().nullable(),
  status: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by_name: z.string().nullable(),
  updated_by_name: z.string().nullable(),
});

export type IdRequestDetail = z.output<typeof idRequestDetailSchema>;

export const listIdRequestsResultSchema = z.object({
  requests: z.array(idRequestListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListIdRequestsResult = z.output<typeof listIdRequestsResultSchema>;

export const createIdRequestResultSchema = z.object({
  cir_uuid: z.string(),
  status: z.string(),
});

export type CreateIdRequestResult = z.output<typeof createIdRequestResultSchema>;
