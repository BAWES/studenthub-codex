import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCandidatesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  status: z.string().optional(),
});

export const getCandidateByIdSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidatesInput = z.input<typeof listCandidatesSchema>;
export type GetCandidateByIdInput = z.input<typeof getCandidateByIdSchema>;

export type CandidateRow = z.output<typeof candidateRowOutputSchema>;
export type CandidateDetail = z.output<typeof candidateDetailOutputSchema>;
export type ListCandidatesResult = z.output<typeof candidateListOutputSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single candidate row returned in list results.
 */
export const candidateRowOutputSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  status: z.number().int(),
  createdAt: z.string(),
});

/**
 * Validates the listCandidates return shape.
 */
export const candidateListOutputSchema = z.object({
  items: z.array(candidateRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Validates a candidate detail object returned by getCandidateById.
 */
export const candidateDetailOutputSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  nameAr: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  gender: z.number().int().nullable(),
  objective: z.string().nullable(),
  status: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
