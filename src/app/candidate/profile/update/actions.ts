"use server";

// ---------------------------------------------------------------------------
// Candidate Profile Update — server actions for profile read/update
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/profile for
// viewing and editing the candidate's own profile.
//
// Actions:
//   - getProfile    — fetch the candidate's full profile data
//   - updateProfile — update editable profile fields
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";
import {
  getCandidateProfileData,
  updateCandidateProfileData,
} from "@/modules/candidates/profile/actions";
import {
  profileDataSchema,
  profileActionResultSchema,
} from "./schemas";
import type { ProfileData, ProfileActionResult } from "./schemas";

// Re-export types for consumers that import from ./actions
export type { ProfileData, ProfileActionResult };

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------

/**
 * Fetch the candidate's full profile data.
 * Only the owning candidate may access their own profile.
 * Delegates to modules/candidates/profile.
 */
export async function getProfile(): Promise<ProfileData> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await getCandidateProfileData({ candidateId });

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
 * Delegates to modules/candidates/profile.
 */
export async function updateProfile(
  data: z.input<typeof updateProfileDataSchema>,
): Promise<ProfileActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );
  const candidateId = Number(session.id);

  // We need the raw schema for input validation here since the module expects
  // a slightly different shape (no candidateId in the app-level input)
  const parsed = z
    .object({
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
    })
    .safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const result = await updateCandidateProfileData({
    candidateId,
    ...parsed.data,
  });

  if (result.success) {
    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");
    revalidatePath("/candidate/profile");
  }

  // Validate output shape
  const outputParsed = profileActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[app/candidate/profile/update] updateProfile output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// Local schema reference for the function above
const updateProfileDataSchema = z.object({
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
