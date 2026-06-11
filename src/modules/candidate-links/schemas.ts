import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const candidateLinkItemSchema = z.object({
  cl_uuid: z.string(),
  candidate_id: z.number().int(),
  title: z.string(),
  url: z.string(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type CandidateLinkItem = z.output<typeof candidateLinkItemSchema>;

export const listCandidateLinksResultSchema = z.object({
  links: z.array(candidateLinkItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListCandidateLinksResult = z.output<typeof listCandidateLinksResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listCandidateLinksSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID must be a positive integer"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCandidateLinkSchema = z.object({
  clUuid: z.string().min(1, "Link UUID is required"),
});

export const createCandidateLinkSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID must be a positive integer"),
  title: z.string().min(1, "Title is required").max(255),
  url: z.string().min(1, "URL is required").max(255),
});

export const updateCandidateLinkSchema = z.object({
  clUuid: z.string().min(1, "Link UUID is required"),
  title: z.string().min(1, "Title is required").max(255),
  url: z.string().min(1, "URL is required").max(255),
});

export const deleteCandidateLinkSchema = z.object({
  clUuid: z.string().min(1, "Link UUID is required"),
});

// ---------------------------------------------------------------------------
// Input types (for function signatures that use z.input)
// ---------------------------------------------------------------------------

export type ListCandidateLinksParams = z.input<typeof listCandidateLinksSchema>;
export type GetCandidateLinkParams = z.input<typeof getCandidateLinkSchema>;
export type CreateCandidateLinkParams = z.input<typeof createCandidateLinkSchema>;
export type UpdateCandidateLinkParams = z.input<typeof updateCandidateLinkSchema>;
export type DeleteCandidateLinkParams = z.input<typeof deleteCandidateLinkSchema>;
