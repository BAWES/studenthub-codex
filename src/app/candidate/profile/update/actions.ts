"use server";

// ---------------------------------------------------------------------------
// Candidate Profile Update — server actions for profile read/update
// ---------------------------------------------------------------------------
// Route-level server actions for viewing and editing the candidate's own
// profile.  Uses Prisma directly with Zod validation (no FormData — clean
// JSON API for client components).
//
// Actions:
//   - getProfile    — fetch the candidate's full profile data
//   - updateProfile — update editable profile fields
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";
import {
  profileDataSchema,
  profileActionResultSchema,
} from "./schemas";
import type { ProfileData, ProfileActionResult } from "./schemas";

// Re-export types for consumers that import from ./actions
export type { ProfileData, ProfileActionResult };

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const getProfileSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

const updateProfileSchema = z.object({
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

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------

/**
 * Fetch the candidate's full profile data.
 * Only the owning candidate may access their own profile.
 */
export async function getProfile(): Promise<ProfileData> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const row = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_name_ar: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_personal_photo: true,
      candidate_objective: true,
      candidate_intro: true,
      candidate_address_line1: true,
      candidate_gender: true,
      candidate_birth_date: true,
      candidate_driving_license: true,
      candidate_civil_id: true,
      candidate_hourly_rate: true,
      profile_url: true,
      candidate_preferred_time: true,
      bank_account_name: true,
      candidate_iban: true,
      country_id: true,
      university_id: true,
      bank_id: true,
    },
  });

  if (!row) {
    throw new Error("Candidate profile not found");
  }

  const result = {
    candidateId: row.candidate_id,
    name: row.candidate_name,
    nameAr: row.candidate_name_ar ?? "",
    email: row.candidate_email,
    phone: row.candidate_phone,
    photoUrl: row.candidate_personal_photo,
    objective: row.candidate_objective,
    intro: row.candidate_intro,
    address: row.candidate_address_line1,
    gender: row.candidate_gender,
    birthDate: row.candidate_birth_date?.toISOString() ?? null,
    drivingLicense: row.candidate_driving_license,
    civilId: row.candidate_civil_id,
    hourlyRate: row.candidate_hourly_rate ? Number(row.candidate_hourly_rate) : null,
    profileUrl: row.profile_url,
    preferredTime: row.candidate_preferred_time,
    bankAccountName: row.bank_account_name,
    iban: row.candidate_iban,
    countryId: row.country_id,
    universityId: row.university_id,
    bankId: row.bank_id,
  };

  // Validate output shape
  const outputParsed = profileDataSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[app/candidate/profile/update] getProfile output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateProfile
// ---------------------------------------------------------------------------

/**
 * Update the candidate's editable profile fields.
 * Returns structured success/failure so the client can display per-field errors.
 */
export async function updateProfile(
  data: z.input<typeof updateProfileSchema>,
): Promise<ProfileActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      candidate_name: d.name,
      candidate_name_ar: d.nameAr || undefined,
      candidate_phone: d.phone || undefined,
      candidate_objective: d.objective || undefined,
      candidate_intro: d.intro || undefined,
      candidate_address_line1: d.address || undefined,
      candidate_gender: d.gender !== undefined && d.gender !== null ? d.gender : null,
      candidate_birth_date: d.birthDate
        ? (() => {
            const date = new Date(d.birthDate);
            return isFinite(date.getTime()) ? date : undefined;
          })()
        : null,
      candidate_driving_license:
        d.drivingLicense === "1" ? true : d.drivingLicense === "0" ? false : null,
      candidate_preferred_time: d.preferredTime || undefined,
      candidate_hourly_rate: d.hourlyRate !== undefined && d.hourlyRate !== null ? d.hourlyRate : null,
    },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");
  revalidatePath("/candidate/profile");

  const updateResult = { success: true } as const;

  // Validate output shape
  const outputParsed = profileActionResultSchema.safeParse(updateResult);
  if (!outputParsed.success) {
    console.error(
      "[app/candidate/profile/update] updateProfile output validation failed:",
      outputParsed.error.issues,
    );
  }

  return updateResult;
}
