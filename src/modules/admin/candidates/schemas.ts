import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/candidates actions
// ---------------------------------------------------------------------------

export const listCandidatesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  status: z.coerce.number().int().optional(),
  storeId: z.coerce.number().int().positive().optional(),
});

export const getCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const searchCandidatesSchema = z.object({
  q: z.string().trim().min(1, "Search query is required").max(100),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  nameAr: z.string().max(255).optional().default(""),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().max(20).optional().default(""),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  bankId: z.coerce.number().int().positive().optional(),
  bankAccountName: z.string().max(100).optional().default(""),
  iban: z.string().max(100).optional().default(""),
  civilId: z.string().max(255).optional().default(""),
  objective: z.string().max(255).optional().default(""),
  intro: z.string().optional().default(""),
  address: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  gender: z.coerce.number().int().min(0).max(2).optional(),
  hourlyRate: z.coerce.number().positive().optional(),
});

export const updateCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  name: z.string().min(1).max(255).optional(),
  nameAr: z.string().max(255).optional(),
  email: z.string().email("Invalid email").max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  countryId: z.coerce.number().int().positive().optional().nullable(),
  universityId: z.coerce.number().int().positive().optional().nullable(),
  bankId: z.coerce.number().int().positive().optional().nullable(),
  bankAccountName: z.string().max(100).optional().nullable(),
  iban: z.string().max(100).optional().nullable(),
  civilId: z.string().max(255).optional().nullable(),
  objective: z.string().max(255).optional().nullable(),
  intro: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.coerce.number().int().min(0).max(2).optional().nullable(),
  hourlyRate: z.coerce.number().positive().optional().nullable(),
  status: z.coerce.number().int().optional(),
});

export const deleteCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidatesInput = z.input<typeof listCandidatesSchema>;
export type GetCandidateInput = z.input<typeof getCandidateSchema>;
export type SearchCandidatesInput = z.input<typeof searchCandidatesSchema>;
export type CreateCandidateInput = z.input<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.input<typeof updateCandidateSchema>;
export type DeleteCandidateInput = z.input<typeof deleteCandidateSchema>;

export type CreateCandidateResult = { success: true; candidateId: number } | { success: false; error: string };

export type UpdateCandidateResult = { success: true; candidateId: number } | { success: false; error: string };

export type DeleteCandidateResult = { success: true; candidateId: number } | { success: false; error: string };

export type CandidateRow = {
  candidate_id: number;
  name: string;
  name_ar: string;
  email: string;
  phone: string | null;
  status: number;
  store_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CandidateDetail = {
  candidate: {
    candidate_id: number;
    candidate_name: string;
    candidate_name_ar: string;
    candidate_email: string;
    candidate_phone: string | null;
    candidate_status: number;
    candidate_gender: number | null;
    candidate_birth_date: string | null;
    candidate_hourly_rate: number | null;
    currency_code: string | null;
    candidate_created_at: string | null;
    candidate_updated_at: string | null;
    store: { store_name: string | null } | null;
    country: { country_name_en: string | null } | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single candidate row returned in list/search results.
 */
export const candidateRowOutputSchema = z.object({
  candidate_id: z.number().int(),
  name: z.string(),
  name_ar: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  status: z.number().int(),
  store_name: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Validates the listCandidates / searchCandidates return shape.
 */
export const candidateListOutputSchema = z.object({
  items: z.array(candidateRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Validates a candidate detail object returned by getCandidate.
 */
export const candidateDetailObjectOutputSchema = z.object({
  candidate_id: z.number().int(),
  candidate_name: z.string(),
  candidate_name_ar: z.string(),
  candidate_email: z.string(),
  candidate_phone: z.string().nullable(),
  candidate_status: z.number().int(),
  candidate_gender: z.number().int().nullable(),
  candidate_birth_date: z.string().nullable(),
  candidate_hourly_rate: z.number().nullable(),
  currency_code: z.string().nullable(),
  candidate_created_at: z.string().nullable(),
  candidate_updated_at: z.string().nullable(),
  store: z
    .object({ store_name: z.string().nullable() })
    .nullable(),
  country: z
    .object({ country_name_en: z.string().nullable() })
    .nullable(),
});

/**
 * Validates the getCandidate return shape.
 */
export const candidateDetailOutputSchema = z.object({
  candidate: candidateDetailObjectOutputSchema.nullable(),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      note: z.string(),
    }),
  ),
});

/**
 * Validates mutation result (create/update/delete).
 */
export const candidateActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), candidateId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
