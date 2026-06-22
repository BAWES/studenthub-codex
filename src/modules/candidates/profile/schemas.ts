import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const getCandidateProfileMetricsSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
});

export const getCandidateProfileDataSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
});

export const updateCandidateProfileDataSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  nameAr: z.string().max(255).optional().default(""),
  phone: z.string().max(20).optional().default(""),
  objective: z.string().max(255).optional().default(""),
  intro: z.string().optional().default(""),
  address: z.string().optional().default(""),
  gender: z.coerce.number().int().min(0).max(2).optional().nullable(),
  birthDate: z.string().optional().default(""),
  drivingLicense: z
    .union([z.literal("1"), z.literal("0"), z.literal("")])
    .optional()
    .default(""),
  preferredTime: z.string().max(255).optional().default(""),
  hourlyRate: z.coerce.number().min(0).max(9999).optional().nullable(),
});

// Input types
export type GetCandidateProfileMetricsParams = z.input<
  typeof getCandidateProfileMetricsSchema
>;
export type GetCandidateProfileDataParams = z.input<
  typeof getCandidateProfileDataSchema
>;
export type UpdateCandidateProfileDataParams = z.input<
  typeof updateCandidateProfileDataSchema
>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateProfileMetricsSchema = z.object({
  experienceCount: z.number().int().nonnegative(),
  educationCount: z.number().int().nonnegative(),
  skillCount: z.number().int().nonnegative(),
  certificationCount: z.number().int().nonnegative(),
  languageCount: z.number().int().nonnegative(),
  applicationCount: z.number().int().nonnegative(),
});

export const candidateProfileDataSchema = z.object({
  candidateId: z.number().int().positive(),
  name: z.string(),
  nameAr: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  photoUrl: z.string().nullable(),
  objective: z.string().nullable(),
  intro: z.string().nullable(),
  address: z.string().nullable(),
  gender: z.number().int().nullable(),
  birthDate: z.string().nullable(),
  drivingLicense: z.boolean().nullable(),
  civilId: z.string().nullable(),
  hourlyRate: z.number().nullable(),
  profileUrl: z.string().nullable(),
  preferredTime: z.string().nullable(),
  bankAccountName: z.string().nullable(),
  iban: z.string().nullable(),
  countryId: z.number().int().nullable(),
  universityId: z.number().int().nullable(),
  bankId: z.number().int().nullable(),
});

export const candidateProfileActionResultSchema = z.discriminatedUnion(
  "success",
  [
    z.object({ success: z.literal(true) }),
    z.object({
      success: z.literal(false),
      error: z.string(),
      fieldErrors: z.record(z.array(z.string()).optional()).optional(),
    }),
  ],
);

// Output types
export type CandidateProfileMetrics = z.output<
  typeof candidateProfileMetricsSchema
>;
export type CandidateProfileData = z.output<typeof candidateProfileDataSchema>;
export type CandidateProfileActionResult = z.output<
  typeof candidateProfileActionResultSchema
>;
