"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateEducationSchema,
  getCandidateEducationSchema,
  createCandidateEducationSchema,
  updateCandidateEducationSchema,
  deleteCandidateEducationSchema,
  candidateEducationItemSchema,
  listCandidateEducationResultSchema,
  candidateEducationActionResultSchema,
  type ListCandidateEducationParams,
  type GetCandidateEducationParams,
  type CreateCandidateEducationParams,
  type UpdateCandidateEducationParams,
  type DeleteCandidateEducationParams,
  type CandidateEducationItem,
  type CandidateEducationDetail,
  type ListCandidateEducationResult,
  type CandidateEducationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_education row to the shared item shape. */
function toItem(
  row: PrismaCandidateEducationWithRelations,
): CandidateEducationItem {
  return {
    education_uuid: row.education_uuid,
    candidate_id: row.candidate_id,
    university_id: row.university_id,
    university_name_en: row.university?.university_name_en ?? null,
    university_name_ar: row.university?.university_name_ar ?? null,
    degree_uuid: row.degree_uuid,
    degree_name_en: row.degree?.degree_name_en ?? null,
    degree_name_ar: row.degree?.degree_name_ar ?? null,
    major_uuid: row.major_uuid,
    major_name_en: row.major?.major_name_en ?? null,
    major_name_ar: row.major?.major_name_ar ?? null,
    graduation_year: row.graduation_year ?? null,
    is_currently_studying: row.is_currently_studying ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Raw row shape with eagerly loaded relations. */
type PrismaCandidateEducationWithRelations = Awaited<
  ReturnType<typeof prisma.candidate_education.findFirst>
> & {
  university?: { university_name_en: string | null; university_name_ar: string | null } | null;
  degree?: { degree_name_en: string | null; degree_name_ar: string | null } | null;
  major?: { major_name_en: string | null; major_name_ar: string | null } | null;
};

/** Reusable include for education relations. */
const educationIncludes = {
  university: {
    select: { university_name_en: true, university_name_ar: true },
  },
  degree: {
    select: { degree_name_en: true, degree_name_ar: true },
  },
  major: {
    select: { major_name_en: true, major_name_ar: true },
  },
} as const;

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/education] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List education records for a candidate.
 * Maps to legacy CandidateEducationController::actionIndex.
 * Requires candidate.read capability.
 */
export async function listCandidateEducation(
  params: ListCandidateEducationParams,
): Promise<ListCandidateEducationResult> {
  await requireCapability("candidate.read");

  const { candidateId, page, limit } =
    listCandidateEducationSchema.parse(params);

  const where = { candidate_id: candidateId };

  const [rows, total] = await Promise.all([
    prisma.candidate_education.findMany({
      where,
      orderBy: [{ created_at: "desc" }, { education_uuid: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: educationIncludes,
    }),
    prisma.candidate_education.count({ where }),
  ]);

  const result = {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateEducation", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single education record by UUID.
 * Maps to legacy CandidateEducationController::actionView.
 * Requires candidate.read capability.
 * Returns null if the record does not exist or belongs to another candidate.
 */
export async function getCandidateEducation(
  params: GetCandidateEducationParams,
): Promise<CandidateEducationDetail> {
  await requireCapability("candidate.read");

  const { educationUuid } = getCandidateEducationSchema.parse(params);

  const row = await prisma.candidate_education.findUnique({
    where: { education_uuid: educationUuid },
    include: educationIncludes,
  });

  if (!row) return null;

  const result = toItem(row);

  // Output validation — log mismatches without throwing
  const outputParsed = candidateEducationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateEducation", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new education record for a candidate.
 * Accepts candidateId as a parameter so callers (app-level actions, admin, etc.)
 * can supply the appropriate ID.
 * Requires candidate.profile.edit capability.
 */
export async function createCandidateEducation(
  params: CreateCandidateEducationParams,
): Promise<CandidateEducationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = createCandidateEducationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid education data",
    };
  }

  const educationUuid = `edu_${crypto.randomUUID()}`;
  const now = new Date();

  // Verify university exists
  const university = await prisma.university.findUnique({
    where: { university_id: parsed.data.universityId },
    select: { university_id: true },
  });
  if (!university) {
    return { success: false, error: "University not found" };
  }

  await prisma.candidate_education.create({
    data: {
      education_uuid: educationUuid,
      candidate_id: parsed.data.candidateId,
      university_id: parsed.data.universityId,
      degree_uuid: parsed.data.degreeUuid || null,
      major_uuid: parsed.data.majorUuid || null,
      graduation_year: parsed.data.graduationYear ?? null,
      is_currently_studying: parsed.data.isCurrentlyStudying,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/education");

  const result: CandidateEducationActionResult = { success: true, educationUuid };

  // Output validation
  const outputParsed = candidateEducationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createCandidateEducation", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing education record (delete + create in transaction).
 * Accepts candidateId for ownership verification.
 * Requires candidate.profile.edit capability.
 */
export async function updateCandidateEducation(
  params: UpdateCandidateEducationParams,
): Promise<CandidateEducationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = updateCandidateEducationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid education data",
    };
  }

  // Verify the education entry exists and belongs to the candidate
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: parsed.data.candidateId,
    },
    select: { education_uuid: true },
  });
  if (!existing) {
    return { success: false, error: "Education entry not found or access denied" };
  }

  // Verify university exists
  const university = await prisma.university.findUnique({
    where: { university_id: parsed.data.universityId },
    select: { university_id: true },
  });
  if (!university) {
    return { success: false, error: "University not found" };
  }

  const newUuid = `edu_${crypto.randomUUID()}`;
  const now = new Date();

  // Use delete+create in a transaction (matching the existing project pattern)
  await prisma.$transaction([
    prisma.candidate_education.delete({
      where: { education_uuid: parsed.data.educationUuid },
    }),
    prisma.candidate_education.create({
      data: {
        education_uuid: newUuid,
        candidate_id: parsed.data.candidateId,
        university_id: parsed.data.universityId,
        degree_uuid: parsed.data.degreeUuid || null,
        major_uuid: parsed.data.majorUuid || null,
        graduation_year: parsed.data.graduationYear ?? null,
        is_currently_studying: parsed.data.isCurrentlyStudying,
        created_at: now,
        updated_at: now,
      },
    }),
  ]);

  revalidatePath("/candidate/education");

  const result: CandidateEducationActionResult = { success: true, educationUuid: newUuid };

  // Output validation
  const outputParsed = candidateEducationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateCandidateEducation", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete an education record by UUID.
 * Accepts candidateId for ownership verification.
 * Requires candidate.profile.edit capability.
 */
export async function deleteCandidateEducation(
  params: DeleteCandidateEducationParams,
): Promise<CandidateEducationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = deleteCandidateEducationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid education UUID",
    };
  }

  // Verify the education entry exists and belongs to the candidate
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: parsed.data.candidateId,
    },
    select: { education_uuid: true },
  });
  if (!existing) {
    return { success: false, error: "Education entry not found or access denied" };
  }

  await prisma.candidate_education.delete({
    where: { education_uuid: parsed.data.educationUuid },
  });

  revalidatePath("/candidate/education");

  const result: CandidateEducationActionResult = {
    success: true,
    educationUuid: parsed.data.educationUuid,
  };

  // Output validation
  const outputParsed = candidateEducationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteCandidateEducation", outputParsed.error.issues);
  }

  return result;
}
