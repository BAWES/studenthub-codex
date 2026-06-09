"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EDUCATION_UUID_PREFIX = "education_";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCandidateEducationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getCandidateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

export const createCandidateEducationSchema = z.object({
  universityId: z.coerce
    .number({ required_error: "University is required" })
    .int()
    .positive("University is required"),
  degreeUuid: z.string().optional(),
  majorUuid: z.string().optional(),
  graduationYear: z.coerce.number().int().optional(),
  isCurrentlyStudying: z.coerce
    .number()
    .int()
    .transform((v) => v === 1)
    .optional(),
});

export const updateCandidateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.coerce.number().int().positive().optional(),
  degreeUuid: z.string().optional(),
  majorUuid: z.string().optional(),
  graduationYear: z.coerce.number().int().optional(),
  isCurrentlyStudying: z.coerce
    .number()
    .int()
    .transform((v) => v === 1)
    .optional(),
});

export const deleteCandidateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidateEducationInput = z.input<
  typeof listCandidateEducationSchema
>;

export type CreateCandidateEducationInput = z.input<
  typeof createCandidateEducationSchema
>;

export type UpdateCandidateEducationInput = z.input<
  typeof updateCandidateEducationSchema
>;

export type CandidateEducationItem = {
  education_uuid: string;
  candidate_id: number;
  university_id: number;
  university_name_en: string | null;
  university_name_ar: string | null;
  degree_uuid: string | null;
  degree_name_en: string | null;
  degree_name_ar: string | null;
  major_uuid: string | null;
  major_name_en: string | null;
  major_name_ar: string | null;
  graduation_year: number | null;
  is_currently_studying: boolean;
  created_at: Date | null;
  updated_at: Date | null;
};

export type CandidateEducationDetail = CandidateEducationItem | null;

export type ListCandidateEducationResult = {
  records: CandidateEducationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateCandidateEducationResult = {
  education_uuid: string;
};

export type UpdateCandidateEducationResult = {
  education_uuid: string;
};

export type DeleteCandidateEducationResult = {
  success: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateEducationUuid(): string {
  return `${EDUCATION_UUID_PREFIX}${crypto.randomUUID()}`;
}

function mapEducation(
  row: Record<string, unknown>,
): CandidateEducationItem {
  return {
    education_uuid: row.education_uuid as string,
    candidate_id: row.candidate_id as number,
    university_id: row.university_id as number,
    university_name_en: (row as any).university?.university_name_en ?? null,
    university_name_ar: (row as any).university?.university_name_ar ?? null,
    degree_uuid: (row.degree_uuid as string) ?? null,
    degree_name_en: (row as any).degree?.degree_name_en ?? null,
    degree_name_ar: (row as any).degree?.degree_name_ar ?? null,
    major_uuid: (row.major_uuid as string) ?? null,
    major_name_en: (row as any).major?.major_name_en ?? null,
    major_name_ar: (row as any).major?.major_name_ar ?? null,
    graduation_year: (row.graduation_year as number) ?? null,
    is_currently_studying: Boolean(row.is_currently_studying),
    created_at: (row.created_at as Date) ?? null,
    updated_at: (row.updated_at as Date) ?? null,
  };
}

// ---------------------------------------------------------------------------
// listCandidateEducation
// ---------------------------------------------------------------------------

/**
 * List education records for the current candidate.
 *
 * Mirrors the legacy Yii2 CandidateEducationController::actionList().
 * Requires capability: candidate.read.own
 */
export async function listCandidateEducation(
  params: ListCandidateEducationInput = {},
): Promise<ListCandidateEducationResult> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCandidateEducationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = { candidate_id: candidateId };

  const [rows, total] = await Promise.all([
    prisma.candidate_education.findMany({
      where,
      include: {
        degree: true,
        major: true,
        university: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidate_education.count({ where }),
  ]);

  return {
    records: rows.map(mapEducation),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getCandidateEducation
// ---------------------------------------------------------------------------

/**
 * Get a single education record by UUID for the current candidate.
 *
 * Mirrors the legacy Yii2 CandidateEducationController::actionView().
 * Requires capability: candidate.read.own
 */
export async function getCandidateEducation(
  educationUuid: string,
): Promise<CandidateEducationDetail> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getCandidateEducationSchema.safeParse({ educationUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid education UUID",
    );
  }

  const row = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: candidateId,
    },
    include: {
      degree: true,
      major: true,
      university: true,
    },
  });

  if (!row) return null;
  return mapEducation(row as unknown as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// createCandidateEducation
// ---------------------------------------------------------------------------

/**
 * Create a new candidate education record.
 *
 * Mirrors the legacy Yii2 CandidateEducationController::actionCreate().
 * Requires capability: candidate.profile.edit
 */
export async function createCandidateEducation(
  data: CreateCandidateEducationInput,
): Promise<CreateCandidateEducationResult> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = createCandidateEducationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid education data",
    );
  }

  const { universityId, degreeUuid, majorUuid, graduationYear, isCurrentlyStudying } = parsed.data;

  const educationUuid = generateEducationUuid();

  await prisma.candidate_education.create({
    data: {
      education_uuid: educationUuid,
      candidate_id: candidateId,
      university_id: universityId,
      degree_uuid: degreeUuid ?? null,
      major_uuid: majorUuid ?? null,
      graduation_year: graduationYear ?? null,
      is_currently_studying: isCurrentlyStudying ?? false,
    },
  });

  revalidatePath("/candidate/profile");
  revalidatePath("/app/candidate/edit");

  return { education_uuid: educationUuid };
}

// ---------------------------------------------------------------------------
// updateCandidateEducation
// ---------------------------------------------------------------------------

/**
 * Update an existing candidate education record.
 *
 * Mirrors the legacy Yii2 CandidateEducationController::actionUpdate().
 * Requires capability: candidate.profile.edit
 */
export async function updateCandidateEducation(
  data: UpdateCandidateEducationInput,
): Promise<UpdateCandidateEducationResult> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateCandidateEducationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid education data",
    );
  }

  const { educationUuid, universityId, degreeUuid, majorUuid, graduationYear, isCurrentlyStudying } = parsed.data;

  // Verify ownership before update
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: educationUuid,
      candidate_id: candidateId,
    },
  });

  if (!existing) {
    throw new Error("Education record not found or access denied.");
  }

  await prisma.candidate_education.update({
    where: { education_uuid: educationUuid },
    data: {
      ...(universityId !== undefined && { university_id: universityId }),
      ...(degreeUuid !== undefined && { degree_uuid: degreeUuid ?? null }),
      ...(majorUuid !== undefined && { major_uuid: majorUuid ?? null }),
      ...(graduationYear !== undefined && { graduation_year: graduationYear }),
      ...(isCurrentlyStudying !== undefined && { is_currently_studying: isCurrentlyStudying }),
    },
  });

  revalidatePath("/candidate/profile");
  revalidatePath("/app/candidate/edit");

  return { education_uuid: educationUuid };
}

// ---------------------------------------------------------------------------
// deleteCandidateEducation
// ---------------------------------------------------------------------------

/**
 * Delete a candidate education record.
 *
 * Mirrors the legacy Yii2 CandidateEducationController::actionDelete().
 * Requires capability: candidate.profile.edit
 */
export async function deleteCandidateEducation(
  educationUuid: string,
): Promise<DeleteCandidateEducationResult> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = deleteCandidateEducationSchema.safeParse({ educationUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid education UUID",
    );
  }

  // Verify ownership before delete
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: candidateId,
    },
  });

  if (!existing) {
    throw new Error("Education record not found or access denied.");
  }

  await prisma.candidate_education.delete({
    where: { education_uuid: parsed.data.educationUuid },
  });

  revalidatePath("/candidate/profile");
  revalidatePath("/app/candidate/edit");

  return { success: true };
}
