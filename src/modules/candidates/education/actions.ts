"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateEducationSchema,
  getCandidateEducationSchema,
  candidateEducationItemSchema,
  listCandidateEducationResultSchema,
  type ListCandidateEducationParams,
  type GetCandidateEducationParams,
  type CandidateEducationItem,
  type CandidateEducationDetail,
  type ListCandidateEducationResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Re-exports for backward compatibility
// ---------------------------------------------------------------------------

export { listCandidateEducationSchema, getCandidateEducationSchema };
export type {
  ListCandidateEducationParams,
  GetCandidateEducationParams,
  CandidateEducationItem,
  CandidateEducationDetail,
  ListCandidateEducationResult,
};

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

  const result = {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/education] listCandidateEducation output failed:",
      outputParsed.error.issues,
    );
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

  const result = toItem(row);

  // Output validation — log mismatches without throwing
  const outputParsed = candidateEducationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/education] getCandidateEducation output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
