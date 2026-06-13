import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/candidates/[id] actions
// ---------------------------------------------------------------------------

export const getCandidateDetailSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const updateCandidateStatusSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  status: z.coerce.number().int().refine(
    (s) => [10, 20, 30].includes(s),
    { message: "Status must be 10 (active), 20 (inactive), or 30 (banned)" },
  ),
});

export const updateCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  candidateName: z.string().max(255).optional(),
  candidateNameAr: z.string().max(255).optional(),
  candidateEmail: z.string().max(255).optional(),
  candidatePhone: z.string().max(20).optional(),
  candidateGender: z.coerce.number().int().optional(),
  candidateBirthDate: z.string().optional(),
  candidateHourlyRate: z.coerce.number().optional(),
  currencyCode: z.string().max(3).optional(),
  storeId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  candidateObjective: z.string().max(255).optional(),
});

export const deleteCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateDetailInput = z.input<typeof getCandidateDetailSchema>;
export type UpdateCandidateStatusInput = z.input<typeof updateCandidateStatusSchema>;
export type UpdateCandidateInput = z.input<typeof updateCandidateSchema>;
export type DeleteCandidateInput = z.input<typeof deleteCandidateSchema>;

export type CandidateFullDetail = {
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
    candidate_objective: string | null;
    currency_code: string | null;
    candidate_created_at: string | null;
    candidate_updated_at: string | null;
    store: { store_name: string | null } | null;
    country: { country_name_en: string | null } | null;
    university: { university_name_en: string | null } | null;
  } | null;
  placements: {
    transfer_id: number;
    company_name: string | null;
    store_name: string | null;
    hours: number | null;
    amount: string | null;
    paid: number;
    period: string;
  }[];
  documents: {
    type: string;
    label: string;
    url: string | null;
  }[];
  metrics: { label: string; value: string | number; note: string }[];
};

export type CandidateActionResponse = {
  operation: "success" | "error";
  message: string;
};
