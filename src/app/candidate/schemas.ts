import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated with candidate root page actions
// ---------------------------------------------------------------------------

export const getCandidateProfileSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation — matches the shape returned by getCandidateDetail
// ---------------------------------------------------------------------------

export const candidateProfileMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

export const candidateProfileListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
  href: z.string().optional(),
  status: z.number().optional(),
});

export const candidateProfileOutputSchema = z.object({
  candidate: z.any().nullable(),
  metrics: z.array(candidateProfileMetricSchema),
  invitations: z.array(candidateProfileListItemSchema),
  workHours: z.array(candidateProfileListItemSchema),
  histories: z.array(candidateProfileListItemSchema),
  notes: z.array(candidateProfileListItemSchema),
  skills: z.array(candidateProfileListItemSchema),
  tags: z.array(candidateProfileListItemSchema),
  warnings: z.array(candidateProfileListItemSchema),
  links: z.array(candidateProfileListItemSchema),
  idCards: z.array(candidateProfileListItemSchema),
  applications: z.array(candidateProfileListItemSchema),
  interviews: z.array(candidateProfileListItemSchema),
  suggestions: z.array(candidateProfileListItemSchema),
  education: z.array(candidateProfileListItemSchema),
  educationEntries: z.any().optional(),
  experiences: z.array(candidateProfileListItemSchema),
  certificates: z.array(candidateProfileListItemSchema),
  languages: z.array(candidateProfileListItemSchema),
  stats: z.any().nullable(),
});

// ---------------------------------------------------------------------------
// Output validation schemas — validate return shapes from server actions
// Follows the pattern from admin/dashboard/schemas.ts (dashboardDataSchema)
// ---------------------------------------------------------------------------

/**
 * Validates a single education item returned by listCandidateEducation
 * and getCandidateEducation. Matches the EducationItem type shape.
 */
export const educationItemOutputSchema = z.object({
  education_uuid: z.string(),
  university_id: z.number().int(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
  degree_uuid: z.string().nullable(),
  degree_name_en: z.string().nullable(),
  degree_name_ar: z.string().nullable(),
  major_uuid: z.string().nullable(),
  major_name_en: z.string().nullable(),
  major_name_ar: z.string().nullable(),
  graduation_year: z.number().int().nullable(),
  is_currently_studying: z.boolean(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Validates an array of education items (listCandidateEducation return).
 */
export const educationListOutputSchema = z.array(educationItemOutputSchema);

/**
 * Validates the EducationActionResult discriminated union.
 */
export const educationActionResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), educationUuid: z.string() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// ---------------------------------------------------------------------------
// Experience output validation — matches ExperienceItem / ExperienceActionResult
// ---------------------------------------------------------------------------

export const experienceItemSchema = z.object({
  candidate_experience_id: z.number().int().positive(),
  candidate_id: z.number().int().nullable(),
  experience: z.string().min(1),
  employer: z.string().nullable(),
  start_year: z.number().int().nullable(),
  end_year: z.number().int().nullable(),
  created_at: z.date().nullable(),
});

export const experienceActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), experienceId: z.number().int().positive() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const experienceListOutputSchema = z.array(experienceItemSchema);

export type GetCandidateProfileInput = z.input<typeof getCandidateProfileSchema>;

export type CandidateProfileOutput = z.input<typeof candidateProfileOutputSchema>;

export type EducationItemOutput = z.input<typeof educationItemOutputSchema>;
export type EducationListOutput = z.input<typeof educationListOutputSchema>;
export type EducationActionResultOutput = z.input<typeof educationActionResultOutputSchema>;
