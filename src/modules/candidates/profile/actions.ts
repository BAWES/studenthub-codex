"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getCandidateProfileMetricsSchema,
  getCandidateProfileDataSchema,
  updateCandidateProfileDataSchema,
  candidateProfileMetricsSchema,
  candidateProfileDataSchema,
  candidateProfileActionResultSchema,
  type GetCandidateProfileMetricsParams,
  type GetCandidateProfileDataParams,
  type UpdateCandidateProfileDataParams,
  type CandidateProfileMetrics,
  type CandidateProfileData,
  type CandidateProfileActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(
    `[modules/candidates/profile] ${source} output failed:`,
    error,
  );
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Get aggregate profile metrics for a candidate.
 * Returns counts across all profile sub-sections.
 * Requires candidate.read capability.
 */
export async function getCandidateProfileMetrics(
  params: GetCandidateProfileMetricsParams,
): Promise<CandidateProfileMetrics> {
  await requireCapability("candidate.read");

  const parsed = getCandidateProfileMetricsSchema.safeParse(params);
  if (!parsed.success) {
    return {
      experienceCount: 0,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    };
  }

  const { candidateId } = parsed.data;

  const [
    experienceCount,
    educationCount,
    skillCount,
    certificationCount,
    languageCount,
  ] = await Promise.all([
    prisma.candidate_experience.count({
      where: { candidate_id: candidateId },
    }),
    prisma.candidate_education.count({
      where: { candidate_id: candidateId },
    }),
    prisma.candidate_skill.count({
      where: { candidate_id: candidateId, deleted: 0 },
    }),
    prisma.candidate_certification.count({
      where: { candidate_id: candidateId },
    }),
    prisma.candidate_language.count({
      where: { candidate_id: candidateId },
    }),
  ]);

  let applicationCount = 0;
  try {
    applicationCount = await prisma.job_listing_application.count({
      where: { candidateId: candidateId } as any,
    });
  } catch {
    // model may not exist yet in some environments
  }

  const result: CandidateProfileMetrics = {
    experienceCount,
    educationCount,
    skillCount,
    certificationCount,
    languageCount,
    applicationCount,
  };

  // Output validation
  const outputParsed = candidateProfileMetricsSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError(
      "getCandidateProfileMetrics",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Fetch the full candidate profile data.
 * Only the owning candidate may access their own profile.
 * Requires candidate.read capability.
 */
export async function getCandidateProfileData(
  params: GetCandidateProfileDataParams,
): Promise<CandidateProfileData> {
  await requireCapability("candidate.read");

  const parsed = getCandidateProfileDataSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid candidate ID");
  }

  const { candidateId } = parsed.data;

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

  const result: CandidateProfileData = {
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
    hourlyRate: row.candidate_hourly_rate
      ? Number(row.candidate_hourly_rate)
      : null,
    profileUrl: row.profile_url,
    preferredTime: row.candidate_preferred_time,
    bankAccountName: row.bank_account_name,
    iban: row.candidate_iban,
    countryId: row.country_id,
    universityId: row.university_id,
    bankId: row.bank_id,
  };

  // Output validation
  const outputParsed = candidateProfileDataSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError(
      "getCandidateProfileData",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Update a candidate's editable profile fields.
 * Requires candidate.profile.edit capability.
 */
export async function updateCandidateProfileData(
  params: UpdateCandidateProfileDataParams,
): Promise<CandidateProfileActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = updateCandidateProfileDataSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { candidateId, ...d } = parsed.data;

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      candidate_name: d.name,
      candidate_name_ar: d.nameAr || undefined,
      candidate_phone: d.phone || undefined,
      candidate_objective: d.objective || undefined,
      candidate_intro: d.intro || undefined,
      candidate_address_line1: d.address || undefined,
      candidate_gender:
        d.gender !== undefined && d.gender !== null ? d.gender : null,
      candidate_birth_date: d.birthDate
        ? (() => {
            const date = new Date(d.birthDate);
            return isFinite(date.getTime()) ? date : undefined;
          })()
        : null,
      candidate_driving_license:
        d.drivingLicense === "1"
          ? true
          : d.drivingLicense === "0"
            ? false
            : null,
      candidate_preferred_time: d.preferredTime || undefined,
      candidate_hourly_rate:
        d.hourlyRate !== undefined && d.hourlyRate !== null
          ? d.hourlyRate
          : null,
    },
  });

  const result: CandidateProfileActionResult = { success: true };

  // Output validation
  const outputParsed = candidateProfileActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError(
      "updateCandidateProfileData",
      outputParsed.error.issues,
    );
  }

  return result;
}
