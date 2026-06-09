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

export type CandidateRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: number;
  createdAt: string;
};

export type CandidateDetail = {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  phone: string | null;
  gender: number | null;
  objective: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
};

export type ListCandidatesResult = {
  items: CandidateRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
