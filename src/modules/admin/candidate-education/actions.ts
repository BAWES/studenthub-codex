"use server";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateEducationSchema,
  listCandidateEducationResultSchema,
  type ListCandidateEducationInput,
  type ListCandidateEducationResult,
  getCandidateEducationInputSchema,
  candidateEducationDetailResultSchema,
  type GetCandidateEducationInput,
  type CandidateEducationDetailResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/candidate-education] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// listCandidateEducation — List all candidate education entries (admin view)
// ---------------------------------------------------------------------------

export async function listCandidateEducation(
  params: ListCandidateEducationInput = {},
): Promise<ListCandidateEducationResult> {
  await requireRoleCapability("admin", "admin.read");

  const parsed = listCandidateEducationSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { candidate: { candidate_name: { contains: search } } },
          { university: { university_name_en: { contains: search } } },
          { university: { university_name_ar: { contains: search } } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.candidate_education.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        candidate: { select: { candidate_name: true } },
        university: { select: { university_name_en: true, university_name_ar: true } },
        degree: { select: { degree_name_en: true, degree_name_ar: true } },
        major: { select: { major_name_en: true, major_name_ar: true } },
      },
    }),
    prisma.candidate_education.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const items = rows.map((row) => ({
    education_uuid: row.education_uuid,
    candidate_id: row.candidate_id,
    candidate_name: row.candidate?.candidate_name ?? null,
    university_name: row.university.university_name_en || row.university.university_name_ar || "",
    degree_name: row.degree
      ? (row.degree.degree_name_en || row.degree.degree_name_ar)
      : null,
    major_name: row.major
      ? (row.major.major_name_en || row.major.major_name_ar)
      : null,
    graduation_year: row.graduation_year,
    is_currently_studying: row.is_currently_studying ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  const result: ListCandidateEducationResult = { items, total, page, limit, totalPages };

  const outputParsed = listCandidateEducationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateEducation", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateEducation — Get single candidate education record
// ---------------------------------------------------------------------------

export async function getCandidateEducation(
  params: GetCandidateEducationInput,
): Promise<CandidateEducationDetailResult> {
  await requireRoleCapability("admin", "admin.read");

  const parsed = getCandidateEducationInputSchema.safeParse(params);
  if (!parsed.success) {
    return { education: null };
  }

  const row = await prisma.candidate_education.findUnique({
    where: { education_uuid: parsed.data.education_uuid },
    include: {
      candidate: { select: { candidate_name: true } },
      university: { select: { university_name_en: true, university_name_ar: true } },
      degree: { select: { degree_name_en: true, degree_name_ar: true } },
      major: { select: { major_name_en: true, major_name_ar: true } },
    },
  });

  if (!row) {
    return { education: null };
  }

  const education = {
    education_uuid: row.education_uuid,
    candidate_id: row.candidate_id,
    candidate_name: row.candidate?.candidate_name ?? null,
    university_id: row.university_id,
    university_name: row.university.university_name_en || row.university.university_name_ar || "",
    degree_uuid: row.degree_uuid,
    degree_name: row.degree
      ? (row.degree.degree_name_en || row.degree.degree_name_ar)
      : null,
    major_uuid: row.major_uuid,
    major_name: row.major
      ? (row.major.major_name_en || row.major.major_name_ar)
      : null,
    graduation_year: row.graduation_year,
    is_currently_studying: row.is_currently_studying ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  const result: CandidateEducationDetailResult = { education };

  const outputParsed = candidateEducationDetailResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateEducation", outputParsed.error.issues);
  }

  return result;
}
