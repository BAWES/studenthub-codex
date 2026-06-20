"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
  getEducationSchema,
  educationItemSchema,
  createCandidateEducationResultSchema,
  updateCandidateEducationResultSchema,
  deleteCandidateEducationResultSchema,
  type CreateEducationInput,
  type UpdateEducationInput,
  type EducationItem,
  type CreateCandidateEducationResult,
  type UpdateCandidateEducationResult,
  type DeleteCandidateEducationResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateEducation — Get a single education entry
// ---------------------------------------------------------------------------

/**
 * Get a single education entry for the current candidate.
 *
 * Maps to the legacy CandidateEducationController::actionView($id).
 */
export async function getCandidateEducation(
  educationUuid: string,
): Promise<EducationItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getEducationSchema.safeParse({ educationUuid });
  if (!parsed.success) return null;

  const education = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: candidateId,
    },
    include: {
      university: {
        select: { university_name_en: true, university_name_ar: true },
      },
    },
  });

  if (!education) return null;

  const result = {
    education_uuid: education.education_uuid,
    candidate_id: education.candidate_id,
    university_id: education.university_id,
    degree_uuid: education.degree_uuid,
    major_uuid: education.major_uuid,
    graduation_year: education.graduation_year,
    is_currently_studying: education.is_currently_studying ?? false,
    created_at: education.created_at,
    updated_at: education.updated_at,
    university: (education as unknown as { university?: { university_name_en: string; university_name_ar: string } }).university
      ? {
          name: (education as unknown as { university: { university_name_en: string; university_name_ar: string } }).university.university_name_en,
          nameAr: (education as unknown as { university: { university_name_en: string; university_name_ar: string } }).university.university_name_ar,
        }
      : undefined,
  } satisfies EducationItem;

  const outputParsed = educationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-education] getCandidateEducation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createCandidateEducation — Create education entry
// ---------------------------------------------------------------------------

/**
 * Create a new education entry for the current candidate.
 *
 * Maps to the legacy CandidateEducationController::actionCreate().
 */
export async function createCandidateEducation(
  params: FormData | CreateEducationInput,
): Promise<CreateCandidateEducationResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const raw =
    params instanceof FormData
      ? {
          universityId: params.get("universityId"),
          degreeUuid: params.get("degreeUuid"),
          majorUuid: params.get("majorUuid"),
          graduationYear: params.get("graduationYear"),
          isCurrentlyStudying: params.get("isCurrentlyStudying"),
        }
      : params;

  const parsed = createEducationSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid education fields.";
    return { success: false, error: firstError };
  }

  const d = parsed.data;
  const educationUuid = `edu_${crypto.randomUUID()}`;
  const now = new Date();

  // Verify university exists
  const university = await prisma.university.findUnique({
    where: { university_id: d.universityId },
    select: { university_id: true },
  });
  if (!university) {
    return { success: false, error: "University not found." };
  }

  await prisma.candidate_education.create({
    data: {
      education_uuid: educationUuid,
      candidate_id: candidateId,
      university_id: d.universityId,
      degree_uuid: d.degreeUuid || undefined,
      major_uuid: d.majorUuid || undefined,
      graduation_year: d.graduationYear === "" ? null : d.graduationYear,
      is_currently_studying: d.isCurrentlyStudying === "1",
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");

  const result: CreateCandidateEducationResult = { success: true, educationUuid };
  const outputParsed = createCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-education] createCandidateEducation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCandidateEducation — Update education entry
// ---------------------------------------------------------------------------

/**
 * Update an existing education entry for the current candidate.
 *
 * Maps to the legacy CandidateEducationController::actionUpdate($id).
 * Uses delete+create in a transaction (matching the existing editCandidateEducation pattern).
 */
export async function updateCandidateEducation(
  params: FormData | UpdateEducationInput,
): Promise<UpdateCandidateEducationResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const raw =
    params instanceof FormData
      ? {
          educationUuid: params.get("educationUuid"),
          universityId: params.get("universityId"),
          degreeUuid: params.get("degreeUuid"),
          majorUuid: params.get("majorUuid"),
          graduationYear: params.get("graduationYear"),
          isCurrentlyStudying: params.get("isCurrentlyStudying"),
        }
      : params;

  const parsed = updateEducationSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid education fields.";
    return { success: false, error: firstError };
  }

  const d = parsed.data;

  // Verify the education entry exists and belongs to this candidate
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: d.educationUuid,
      candidate_id: candidateId,
    },
    select: { education_uuid: true },
  });
  if (!existing) {
    return { success: false, error: "Education entry not found." };
  }

  // Verify university exists
  const university = await prisma.university.findUnique({
    where: { university_id: d.universityId },
    select: { university_id: true },
  });
  if (!university) {
    return { success: false, error: "University not found." };
  }

  const newUuid = `edu_${crypto.randomUUID()}`;
  const now = new Date();

  // Use delete+create in a transaction (matching existing pattern)
  await prisma.$transaction([
    prisma.candidate_education.delete({
      where: { education_uuid: d.educationUuid },
    }),
    prisma.candidate_education.create({
      data: {
        education_uuid: newUuid,
        candidate_id: candidateId,
        university_id: d.universityId,
        degree_uuid: d.degreeUuid || undefined,
        major_uuid: d.majorUuid || undefined,
        graduation_year: d.graduationYear === "" ? null : d.graduationYear,
        is_currently_studying: d.isCurrentlyStudying === "1",
        created_at: now,
        updated_at: now,
      },
    }),
  ]);

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");

  const result: UpdateCandidateEducationResult = { success: true };
  const outputParsed = updateCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-education] updateCandidateEducation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteCandidateEducation — Delete education entry
// ---------------------------------------------------------------------------

/**
 * Delete an education entry for the current candidate.
 *
 * Maps to the legacy CandidateEducationController::actionDelete($id).
 */
export async function deleteCandidateEducation(
  educationUuid: string,
): Promise<DeleteCandidateEducationResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = deleteEducationSchema.safeParse({ educationUuid });
  if (!parsed.success) {
    return { success: false, error: "Invalid education UUID." };
  }

  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: candidateId,
    },
    select: { education_uuid: true },
  });
  if (!existing) {
    return { success: false, error: "Education entry not found." };
  }

  await prisma.candidate_education.delete({
    where: { education_uuid: parsed.data.educationUuid },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");

  const result: DeleteCandidateEducationResult = { success: true };
  const outputParsed = deleteCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-education] deleteCandidateEducation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
