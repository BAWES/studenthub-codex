import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const candidateLinkItemSchema = z.object({
  cl_uuid: z.string(),
  candidate_id: z.number(),
  title: z.string(),
  url: z.string(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type CandidateLinkItem = z.output<typeof candidateLinkItemSchema>;

export const listCandidateLinksResultSchema = z.object({
  links: z.array(candidateLinkItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListCandidateLinksResult = z.output<typeof listCandidateLinksResultSchema>;

export const listCandidateLinksSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getCandidateLinkSchema = z.object({
  uuid: z.string().min(1, "Candidate link UUID is required"),
});