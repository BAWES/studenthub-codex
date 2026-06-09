"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listEducationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

export const createEducationSchema = z.object({
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

export const updateEducationSchema = z.object({
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

export const deleteEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEducationInput = z.input<typeof listEducationSchema>;
export type GetEducationInput = z.input<typeof getEducationSchema>;
export type CreateEducationInput = z.input<typeof createEducationSchema>;
export type UpdateEducationInput = z.input<typeof updateEducationSchema>;
export type DeleteEducationInput = z.input<typeof deleteEducationSchema>;

export type EducationItem = {
  education_uuid: string;
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

export type EducationActionResult =
  | { success: true; educationUuid: string }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_education row (with relations) to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_education.findFirst>>,
): EducationItem | null {
  if (!row) return null;
  const r = row as typeof row & {
    university?: { university_name_en: string | null; university_name_ar: string | null } | null;
    degree?: { degree_name_en: string | null; degree_name_ar: string | null } | null;
    major?: { major_name_en: string | null; major_name_ar: string | null } | null;
  };
  return {
    education_uuid: r.education_uuid,
    university_id: r.university_id,
    university_name_en: r.university?.university_name_en ?? null,
    university_name_ar: r.university?.university_name_ar ?? null,
    degree_uuid: r.degree_uuid,
    degree_name_en: r.degree?.degree_name_en ?? null,
    degree_name_ar: r.degree?.degree_name_ar ?? null,
    major_uuid: r.major_uuid,
    major_name_en: r.major?.major_name_en ?? null,
    major_name_ar: r.major?.major_name_ar ?? null,
    graduation_year: r.graduation_year ?? null,
    is_currently_studying: r.is_currently_studying ?? false,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

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

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List education records for the current candidate (paginated).
 * Mirrors the legacy CandidateEducationController::actionIndex.
 */
export async function listCandidateEducation(
  input: ListEducationInput = {},
): Promise<EducationItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listEducationSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid education list params",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const rows = await prisma.candidate_education.findMany({
    where: { candidate_id: Number(session.id) },
    orderBy: [{ created_at: "desc" }, { education_uuid: "desc" }],
    skip,
    take: limit,
    include: educationIncludes,
  });

  return rows.map((r) => toItem(r)!);
}

/**
 * Get a single education record by UUID.
 * Only returns records belonging to the current candidate.
 * Mirrors the legacy CandidateEducationController::actionView.
 */
export async function getCandidateEducation(
  educationUuid: string,
): Promise<EducationItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getEducationSchema.safeParse({ educationUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid education UUID",
    );
  }

  const row = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: Number(session.id),
    },
    include: educationIncludes,
  });

  return toItem(row);
}

/**
 * Create a new education record for the current candidate.
 * Mirrors the legacy CandidateEducationController::actionCreate.
 */
export async function createCandidateEducation(
  data: CreateEducationInput,
): Promise<EducationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createEducationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid education data",
    };
  }

  const candidateId = Number(session.id);
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
      candidate_id: candidateId,
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
  return { success: true, educationUuid };
}

/**
 * Update an existing education record (delete + create in transaction).
 * Mirrors the legacy CandidateEducationController::actionUpdate.
 */
export async function updateCandidateEducation(
  data: UpdateEducationInput,
): Promise<EducationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = updateEducationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid education data",
    };
  }

  const candidateId = Number(session.id);

  // Verify the education entry exists and belongs to this candidate
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: candidateId,
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
        candidate_id: candidateId,
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
  return { success: true, educationUuid: newUuid };
}

/**
 * Delete an education record by UUID.
 * Verifies ownership before deletion.
 * Mirrors the legacy CandidateEducationController::actionDelete.
 */
export async function deleteCandidateEducation(
  educationUuid: string,
): Promise<EducationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = deleteEducationSchema.safeParse({ educationUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid education UUID",
    };
  }

  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: Number(session.id),
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
  return { success: true, educationUuid: parsed.data.educationUuid };
}
