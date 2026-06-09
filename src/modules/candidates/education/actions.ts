"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listEducationSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createEducationSchema = z.object({
  candidateId: z.number().int().positive(),
  universityId: z.number().int().positive("University is required"),
  degreeUuid: z.string().optional(),
  majorUuid: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  isCurrentlyStudying: z.boolean().optional(),
});

const updateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.number().int().positive().optional(),
  degreeUuid: z.string().optional(),
  majorUuid: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  isCurrentlyStudying: z.boolean().optional(),
});

const deleteEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEducationParams = z.input<typeof listEducationSchema>;
export type CreateEducationParams = z.input<typeof createEducationSchema>;
export type UpdateEducationParams = z.input<typeof updateEducationSchema>;
export type DeleteEducationParams = z.input<typeof deleteEducationSchema>;

export type EducationListItem = {
  education_uuid: string;
  candidate_id: number;
  university_id: number;
  degree_uuid: string | null;
  major_uuid: string | null;
  graduation_year: number | null;
  is_currently_studying: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListEducationResult = {
  items: EducationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List candidate education entries with pagination and optional candidate filter.
 */
export async function listEducation(
  params: ListEducationParams = {},
): Promise<ListEducationResult> {
  await requireCapability("candidate.read.own");

  const parsed = listEducationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { candidateId, page = 1, limit = 20 } = parsed.data;

  const where: { candidate_id?: number } = {};
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [items, total] = await Promise.all([
    prisma.candidate_education.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_education.count({ where }),
  ]);

  return {
    items: items as EducationListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Create a new candidate education entry.
 */
export async function createEducation(
  params: CreateEducationParams,
): Promise<EducationListItem> {
  await requireCapability("candidate.read.own");

  const parsed = createEducationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const {
    candidateId,
    universityId,
    degreeUuid,
    majorUuid,
    graduationYear,
    isCurrentlyStudying,
  } = parsed.data;

  const now = new Date();

  const item = await prisma.candidate_education.create({
    data: {
      education_uuid: crypto.randomUUID(),
      candidate_id: candidateId,
      university_id: universityId,
      degree_uuid: degreeUuid ?? null,
      major_uuid: majorUuid ?? null,
      graduation_year: graduationYear ?? null,
      is_currently_studying: isCurrentlyStudying ?? null,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/profile");
  return item as EducationListItem;
}

/**
 * Update an existing candidate education entry.
 */
export async function updateEducation(
  params: UpdateEducationParams,
): Promise<EducationListItem> {
  await requireCapability("candidate.read.own");

  const parsed = updateEducationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { educationUuid, ...fields } = parsed.data;

  // Verify the record exists
  const existing = await prisma.candidate_education.findUnique({
    where: { education_uuid: educationUuid },
  });
  if (!existing) {
    throw new Error("Education entry not found");
  }

  const item = await prisma.candidate_education.update({
    where: { education_uuid: educationUuid },
    data: {
      ...(fields.universityId !== undefined && { university_id: fields.universityId }),
      ...(fields.degreeUuid !== undefined && { degree_uuid: fields.degreeUuid }),
      ...(fields.majorUuid !== undefined && { major_uuid: fields.majorUuid }),
      ...(fields.graduationYear !== undefined && { graduation_year: fields.graduationYear }),
      ...(fields.isCurrentlyStudying !== undefined && {
        is_currently_studying: fields.isCurrentlyStudying,
      }),
      updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/profile");
  return item as EducationListItem;
}

/**
 * Delete a candidate education entry.
 */
export async function deleteEducation(
  params: DeleteEducationParams,
): Promise<{ success: boolean }> {
  await requireCapability("candidate.read.own");

  const parsed = deleteEducationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { educationUuid } = parsed.data;

  // Verify the record exists
  const existing = await prisma.candidate_education.findUnique({
    where: { education_uuid: educationUuid },
  });
  if (!existing) {
    throw new Error("Education entry not found");
  }

  await prisma.candidate_education.delete({
    where: { education_uuid: educationUuid },
  });

  revalidatePath("/candidate/profile");
  return { success: true };
}
