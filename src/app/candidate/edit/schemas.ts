import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getProfileSchema = z.object({});

export const updatePersonalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional().default(""),
  email: z
    .union([z.string().email("Invalid email address"), z.literal("")])
    .optional()
    .default(""),
  phone: z.string().optional().default(""),
  objective: z.string().optional().default(""),
  intro: z.string().optional().default(""),
  civilId: z.string().optional().default(""),
  profileUrl: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .default(""),
});

export const updateProfileFieldsSchema = z.object({
  countryId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.literal(null)])
    .optional()
    .default(null),
  universityId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.literal(null)])
    .optional()
    .default(null),
  bankId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.literal(null)])
    .optional()
    .default(null),
  bankAccountName: z.string().optional().default(""),
  iban: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  address: z.string().optional().default(""),
  gender: z
    .union([z.coerce.number().int().min(0).max(2), z.literal(""), z.literal(null)])
    .optional()
    .default(null),
  drivingLicense: z
    .union([z.literal("1"), z.literal("0"), z.literal(""), z.boolean(), z.null()])
    .optional()
    .default(null),
  civilExpiry: z.string().optional().default(""),
  preferredTime: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdatePersonalInfoInput = z.input<typeof updatePersonalInfoSchema>;
export type UpdateProfileFieldsInput = z.input<typeof updateProfileFieldsSchema>;

export type CandidateProfileEditData = {
  candidateName: string;
  candidateNameAr: string;
  candidateEmail: string;
  candidatePhone: string | null;
  candidateObjective: string | null;
  candidateIntro: string | null;
  candidateCivilId: string | null;
  profileUrl: string | null;
  candidateBirthDate: Date | null;
  candidateAddressLine1: string | null;
  candidateGender: number | null;
  candidateDrivingLicense: boolean | null;
  candidateCivilExpiryDate: Date | null;
  candidatePreferredTime: string | null;
  countryId: number | null;
  universityId: number | null;
  bankId: number | null;
  bankAccountName: string | null;
  candidateIban: string | null;
  candidatePersonalPhoto: string | null;
  candidateResume: string | null;
  candidateVideo: string | null;
  civilPhotoFront: string | null;
  civilPhotoBack: string | null;
};

export type ProfileActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a date string or return null/undefined. */
export function parseDate(val: string): Date | null | undefined {
  if (!val || val.trim().length === 0) return null;
  const date = new Date(val.trim());
  return isFinite(date.getTime()) ? date : undefined;
}

/** Parse a driving license value from various input forms. */
export function parseDrivingLicense(
  val: string | boolean | null | undefined,
): boolean | null | undefined {
  if (val === null || val === undefined || val === "") return null;
  if (val === "1" || val === true) return true;
  if (val === "0" || val === false) return false;
  return undefined;
}
