"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/candidates/candidate-detail";
import {
  updatePersonalInfoSchema,
  updateProfileFieldsSchema,
  profileEditDataNullableOutputSchema,
  profileActionResultOutputSchema,
  optionsItemOutputSchema,
  type UpdatePersonalInfoInput,
  type UpdateProfileFieldsInput,
  type CandidateProfileEditData,
  type ProfileActionResult,
  parseDate,
  parseDrivingLicense,
} from "./schemas";

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
// Data fetching — colocated from @/modules/candidates/actions
// ---------------------------------------------------------------------------

/**
 * Fetch the full candidate profile detail for the edit page.
 * Delegates to the existing data layer; colocated for the edit route.
 */
export async function getCandidateProfileEdit(input: { candidateId: number }) {
  return getCandidateDetail(Number(input.candidateId), "/candidate/invitations");
}

export async function getCountryOptions() {
  const rows = await prisma.country.findMany({
    orderBy: { country_name_en: "asc" },
    select: { country_id: true, country_name_en: true, country_nationality_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.country_id,
    label: `${r.country_name_en}${r.country_nationality_name_en && r.country_nationality_name_en !== r.country_name_en ? ` (${r.country_nationality_name_en})` : ""}`,
  }));
}

export async function getUniversityOptions() {
  const rows = await prisma.university.findMany({
    where: { deleted: 0 },
    orderBy: { university_name_en: "asc" },
    select: { university_id: true, university_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.university_id,
    label: r.university_name_en ?? `University #${r.university_id}`,
  }));
}

export async function getBankOptions() {
  const rows = await prisma.bank.findMany({
    where: { deleted: 0 },
    orderBy: { bank_name: "asc" },
    select: { bank_id: true, bank_name: true },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.bank_id,
    label: r.bank_name ?? `Bank #${r.bank_id}`,
  }));
}

export async function getDegreeOptions() {
  const rows = await prisma.degree.findMany({
    orderBy: { degree_name_en: "asc" },
    select: { degree_uuid: true, degree_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.degree_uuid,
    label: r.degree_name_en,
  }));
}

export async function getMajorOptions() {
  const rows = await prisma.major.findMany({
    orderBy: { major_name_en: "asc" },
    select: { major_uuid: true, major_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.major_uuid,
    label: r.major_name_en,
  }));
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

  const profileData = toProfileData(row);

  // Validate output shape
  const outputParsed = profileEditDataNullableOutputSchema.safeParse(profileData);
  if (!outputParsed.success) {
    console.error(
      "[candidate/edit] getCandidateProfileForEdit output validation failed:",
      outputParsed.error.issues,
    );
  }

  return profileData;
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

  const personalInfoResult = { success: true as const };

  // Validate output shape
  const personalInfoOutputParsed = profileActionResultOutputSchema.safeParse(personalInfoResult);
  if (!personalInfoOutputParsed.success) {
    console.error(
      "[candidate/edit] updateCandidatePersonalInfo output validation failed:",
      personalInfoOutputParsed.error.issues,
    );
  }

  return personalInfoResult;
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

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      country_id: d.countryId
        ? Number(d.countryId)
        : null,
      university_id: d.universityId
        ? Number(d.universityId)
        : null,
      bank_id: d.bankId
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

  const profileFieldsResult = { success: true as const };

  // Validate output shape
  const profileFieldsOutputParsed = profileActionResultOutputSchema.safeParse(profileFieldsResult);
  if (!profileFieldsOutputParsed.success) {
    console.error(
      "[candidate/edit] updateCandidateProfileFields output validation failed:",
      profileFieldsOutputParsed.error.issues,
    );
  }

  return profileFieldsResult;
}
