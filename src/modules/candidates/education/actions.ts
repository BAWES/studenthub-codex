"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
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

// ---------------------------------------------------------------------------
// Route-level wrappers (for /candidate/education route)
// ---------------------------------------------------------------------------

/** Input schema for listCandidateEducationAction — no candidateId (extracted from session). */
const listCandidateEducationActionSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

type ListCandidateEducationActionInput = z.input<typeof listCandidateEducationActionSchema>;

/** Input schema for createCandidateEducationAction — no candidateId (extracted from session). */
const createCandidateEducationActionSchema = z.object({
  universityId: z.coerce.number().int().positive("University is required"),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === "1" || v === true) return true;
      if (v === "0" || v === false) return false;
      return false;
    }),
});

type CreateCandidateEducationActionInput = z.input<typeof createCandidateEducationActionSchema>;

/** Input schema for updateCandidateEducationAction. */
const updateCandidateEducationActionSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.coerce.number().int().positive("University is required"),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === "1" || v === true) return true;
      if (v === "0" || v === false) return false;
      return false;
    }),
});

type UpdateCandidateEducationActionInput = z.input<typeof updateCandidateEducationActionSchema>;

/**
 * List education records for the current candidate (paginated).
 * Extracts candidateId from session and delegates to listCandidateEducation.
 */
export async function listCandidateEducationAction(
  input: ListCandidateEducationActionInput = {},
): Promise<CandidateEducationItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const { page, limit } = listCandidateEducationActionSchema.parse(input);

  const result = await listCandidateEducation({
    candidateId: Number(session.id),
    page,
    limit,
  });

  // Validate output shape
  const outputParsed = listCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateEducationAction", outputParsed.error.issues);
  }

  return result.items;
}

/**
 * Get a single education record by UUID.
 * Extracts session and delegates to getCandidateEducation.
 */
export async function getCandidateEducationAction(
  educationUuid: string,
): Promise<CandidateEducationItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const result = await getCandidateEducation({ educationUuid });

  // Validate output shape
  const outputParsed = candidateEducationItemSchema.nullable().safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateEducationAction", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new education record for the current candidate.
 * Extracts candidateId from session and delegates to createCandidateEducation.
 */
export async function createCandidateEducationAction(
  data: CreateCandidateEducationActionInput,
): Promise<CandidateEducationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createCandidateEducationActionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid education data",
    };
  }

  const { universityId, degreeUuid, majorUuid, graduationYear, isCurrentlyStudying } = parsed.data;

  const result = await createCandidateEducation({
    candidateId: Number(session.id),
    universityId,
    degreeUuid,
    majorUuid,
    graduationYear,
    isCurrentlyStudying,
  });

  revalidatePath("/candidate/education");

  return result;
}

/**
 * Update an existing education record.
 * Extracts candidateId from session and delegates to updateCandidateEducation.
 */
export async function updateCandidateEducationAction(
  data: UpdateCandidateEducationActionInput,
): Promise<CandidateEducationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateCandidateEducationActionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid education data",
    };
  }

  const { educationUuid, universityId, degreeUuid, majorUuid, graduationYear, isCurrentlyStudying } = parsed.data;

  const result = await updateCandidateEducation({
    candidateId: Number(session.id),
    educationUuid,
    universityId,
    degreeUuid,
    majorUuid,
    graduationYear,
    isCurrentlyStudying,
  });

  revalidatePath("/candidate/education");

  return result;
}

/**
 * Delete an education record by UUID.
 * Extracts candidateId from session and delegates to deleteCandidateEducation.
 */
export async function deleteCandidateEducationAction(
  educationUuid: string,
): Promise<CandidateEducationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const result = await deleteCandidateEducation({
    candidateId: Number(session.id),
    educationUuid,
  });

  revalidatePath("/candidate/education");

  return result;
}

// ---------------------------------------------------------------------------
// [id] route wrappers (for /candidate/education/[id])
// ---------------------------------------------------------------------------

/** Input schema for getEducationEntry. */
const getEducationEntrySchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

/** Input schema for updateEducationEntry. */
const updateEducationEntrySchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.coerce.number().int().positive("University is required"),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === "1" || v === true) return true;
      if (v === "0" || v === false) return false;
      return false;
    }),
});

type EducationEntryResponse = {
  success: boolean;
  error?: string;
};

/**
 * Get a single education entry by UUID.
 * Delegates to getCandidateEducationAction.
 */
export async function getEducationEntry(
  educationUuid: string,
): Promise<CandidateEducationItem | null> {
  const parsed = getEducationEntrySchema.safeParse({ educationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid education entry params");
  }

  return getCandidateEducationAction(parsed.data.educationUuid);
}

/**
 * Update an existing education entry.
 * Delegates to updateCandidateEducationAction.
 */
export async function updateEducationEntry(
  educationUuid: string,
  universityId: number,
  degreeUuid?: string,
  majorUuid?: string,
  graduationYear?: number,
  isCurrentlyStudying?: boolean,
): Promise<EducationEntryResponse> {
  const parsed = updateEducationEntrySchema.safeParse({
    educationUuid,
    universityId,
    degreeUuid,
    majorUuid,
    graduationYear,
    isCurrentlyStudying,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await updateCandidateEducationAction({
    educationUuid: parsed.data.educationUuid,
    universityId: parsed.data.universityId,
    degreeUuid: parsed.data.degreeUuid,
    majorUuid: parsed.data.majorUuid,
    graduationYear: parsed.data.graduationYear,
    isCurrentlyStudying: parsed.data.isCurrentlyStudying,
  });

  revalidatePath("/candidate/education");
  revalidatePath(`/candidate/education/${parsed.data.educationUuid}`);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

/**
 * Delete an education entry by UUID.
 * Delegates to deleteCandidateEducationAction.
 */
export async function deleteEducationEntry(
  educationUuid: string,
): Promise<EducationEntryResponse> {
  const parsed = getEducationEntrySchema.safeParse({ educationUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await deleteCandidateEducationAction(parsed.data.educationUuid);

  revalidatePath("/candidate/education");

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

