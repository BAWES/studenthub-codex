import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas — src/app/candidate/profile/update actions
// ---------------------------------------------------------------------------

/**
 * Schema for ProfileData returned by getProfile.
 */
export const profileDataSchema = z.object({
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

/**
 * Schema for ProfileActionResult returned by updateProfile.
 */
export const profileActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({
    success: z.literal(false),
    error: z.string(),
    fieldErrors: z.record(z.array(z.string()).optional()).optional(),
  }),
]);

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ProfileData = z.output<typeof profileDataSchema>;
export type ProfileActionResult = z.output<typeof profileActionResultSchema>;
