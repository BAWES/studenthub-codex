"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

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

/** Map a Prisma candidate row to the edit-profile API shape. */
function toProfileData(
  row: Awaited<ReturnType<typeof prisma.candidate.findUnique>>,
): CandidateProfileEditData | null {
  if (!row) return null;
  return {
    candidateName: row.candidate_name,
    candidateNameAr: row.candidate_name_ar,
    candidateEmail: row.candidate_email,
    candidatePhone: row.candidate_phone,
    candidateObjective: row.candidate_objective,
    candidateIntro: row.candidate_intro,
    candidateCivilId: row.candidate_civil_id,
    profileUrl: row.profile_url,
    candidateBirthDate: row.candidate_birth_date,
    candidateAddressLine1: row.candidate_address_line1,
    candidateGender: row.candidate_gender,
    candidateDrivingLicense: row.candidate_driving_license,
    candidateCivilExpiryDate: row.candidate_civil_expiry_date,
    candidatePreferredTime: row.candidate_preferred_time,
    countryId: row.country_id,
    universityId: row.university_id,
    bankId: row.bank_id,
    bankAccountName: row.bank_account_name,
    candidateIban: row.candidate_iban,
    candidatePersonalPhoto: row.candidate_personal_photo,
    candidateResume: row.candidate_resume,
    candidateVideo: row.candidate_video,
    civilPhotoFront: row.candidate_civil_photo_front,
    civilPhotoBack: row.candidate_civil_photo_back,
  };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Get the candidate's full profile data for the edit form.
 * Mirrors the data loading in CandidateEditPage (getCandidateDetail).
 */
export async function getCandidateProfileForEdit(): Promise<CandidateProfileEditData | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const row = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
  });

  return toProfileData(row);
}

/**
 * Update personal info fields (name, email, phone, objective, intro, civilId, profileUrl).
 * Matches the fields exposed in the top section of CandidateEditForm.
 */
export async function updateCandidatePersonalInfo(
  data: UpdatePersonalInfoInput,
): Promise<ProfileActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updatePersonalInfoSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid personal info data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      candidate_name: d.name.trim(),
      candidate_name_ar: d.nameAr || undefined,
      candidate_email: d.email || undefined,
      candidate_phone: d.phone || undefined,
      candidate_objective: d.objective || undefined,
      candidate_intro: d.intro || undefined,
      candidate_civil_id: d.civilId || undefined,
      profile_url: d.profileUrl || undefined,
      candidate_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");

  return { success: true };
}

/**
 * Update additional profile fields (address, dates, gender, driving license, bank info, etc.).
 * Matches the secondary field groups in CandidateEditForm.
 */
export async function updateCandidateProfileFields(
  data: UpdateProfileFieldsInput,
): Promise<ProfileActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateProfileFieldsSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile field data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  // Parse birthDate / civilExpiry
  const parseDate = (val: string): Date | null | undefined => {
    if (!val || val.trim().length === 0) return null;
    const date = new Date(val.trim());
    return isFinite(date.getTime()) ? date : undefined;
  };

  // Parse drivingLicense
  const parseDrivingLicense = (
    val: string | boolean | null | undefined,
  ): boolean | null | undefined => {
    if (val === null || val === undefined || val === "") return null;
    if (val === "1" || val === true) return true;
    if (val === "0" || val === false) return false;
    return undefined;
  };

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      country_id: d.countryId && d.countryId !== "" && d.countryId !== null
        ? Number(d.countryId)
        : null,
      university_id: d.universityId && d.universityId !== "" && d.universityId !== null
        ? Number(d.universityId)
        : null,
      bank_id: d.bankId && d.bankId !== "" && d.bankId !== null
        ? Number(d.bankId)
        : null,
      bank_account_name: d.bankAccountName || undefined,
      candidate_iban: d.iban || undefined,
      candidate_birth_date: parseDate(d.birthDate),
      candidate_address_line1: d.address || undefined,
      candidate_gender:
        d.gender !== null && d.gender !== "" ? Number(d.gender) : null,
      candidate_driving_license: parseDrivingLicense(d.drivingLicense),
      candidate_civil_expiry_date: parseDate(d.civilExpiry),
      candidate_preferred_time: d.preferredTime || undefined,
      candidate_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/candidate");

  return { success: true };
}
