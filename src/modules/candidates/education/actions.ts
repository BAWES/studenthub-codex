"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  items: CandidateEducationItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCandidateEducationSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCandidateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

export type ListCandidateEducationParams = z.input<
  typeof listCandidateEducationSchema
>;
export type GetCandidateEducationParams = z.input<
  typeof getCandidateEducationSchema
>;

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
      include: {
        university: {
          select: {
            university_name_en: true,
            university_name_ar: true,
          },
        },
        degree: {
          select: {
            degree_name_en: true,
            degree_name_ar: true,
          },
        },
        major: {
          select: {
            major_name_en: true,
            major_name_ar: true,
          },
        },
      },
    }),
    prisma.candidate_education.count({ where }),
  ]);

  return {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };
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
    include: {
      university: {
        select: {
          university_name_en: true,
          university_name_ar: true,
        },
      },
      degree: {
        select: {
          degree_name_en: true,
          degree_name_ar: true,
        },
      },
      major: {
        select: {
          major_name_en: true,
          major_name_ar: true,
        },
      },
    },
  });

  if (!row) return null;

  return toItem(row);
}
