"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const getCvPdfDataSchema = z.object({
  candidateId: z.coerce.number().int().positive(),
});

export type GetCvPdfDataInput = z.input<typeof getCvPdfDataSchema>;

// ---------------------------------------------------------------------------
// CV PDF data type
// ---------------------------------------------------------------------------

export type CvPdfActionResult = {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  objective: string | null;
  intro: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  civilId: string | null;
  education: {
    university: string;
    degree: string | null;
    major: string | null;
    graduationYear: number | null;
  }[];
  experience: {
    role: string;
    employer: string | null;
    startYear: number | null;
    endYear: number | null;
  }[];
  certificates: {
    title: string;
    issuer: string | null;
  }[];
  skills: {
    skill: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
  links: {
    title: string;
    url: string;
  }[];
};

// ---------------------------------------------------------------------------
// Server action: fetch candidate CV data for PDF generation
// ---------------------------------------------------------------------------

/**
 * Fetch the candidate's profile and all related CV data
 * for CV PDF generation.
 * Returns null if candidate not found.
 */
export async function getCvPdfData(
  input: GetCvPdfDataInput,
): Promise<CvPdfActionResult | null> {
  await requireCapability("candidate.read.any");

  const parsed = getCvPdfDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const { candidateId } = parsed.data;

  // Fetch candidate and all related data in parallel
  const [candidate, education, experience, certificates, skills, languages, links, country] =
    await Promise.all([
      prisma.candidate.findUnique({
        where: { candidate_id: candidateId },
      }),
      prisma.candidate_education.findMany({
        where: { candidate_id: candidateId },
        include: {
          university: true,
          degree: true,
          major: true,
        },
      }),
      prisma.candidate_experience.findMany({
        where: { candidate_id: candidateId, deleted: 0 },
      }),
      prisma.candidate_certificate.findMany({
        where: { candidate_id: candidateId, is_deleted: false },
      }),
      prisma.candidate_skill.findMany({
        where: { candidate_id: candidateId, deleted: 0 },
      }),
      prisma.candidate_language.findMany({
        where: { candidate_id: candidateId, deleted: 0 },
      }),
      prisma.candidate_link.findMany({
        where: { candidate_id: candidateId },
      }),
      prisma.country.findUnique({
        where: { country_id: candidateId },
      }),
    ]);

  if (!candidate) return null;

  // Re-fetch country by the actual country_id from candidate
  const actualCountry =
    candidate.country_id != null
      ? await prisma.country.findUnique({
          where: { country_id: candidate.country_id },
        })
      : null;

  return {
    candidateName: candidate.candidate_name,
    candidateEmail: candidate.candidate_email,
    candidatePhone: candidate.candidate_phone,
    objective: candidate.candidate_objective,
    intro: candidate.candidate_intro,
    nationality: actualCountry?.country_name_en ?? null,
    dateOfBirth: candidate.candidate_birth_date
      ? candidate.candidate_birth_date.toISOString().split("T")[0]
      : null,
    civilId: candidate.candidate_civil_id ?? null,
    education: education.map((e) => ({
      university: e.university?.university_name_en ?? "Unknown University",
      degree: e.degree?.degree_name_en ?? null,
      major: e.major?.major_name_en ?? null,
      graduationYear: e.graduation_year ?? null,
    })),
    experience: experience.map((e) => ({
      role: e.experience,
      employer: e.employer,
      startYear: e.start_year ?? null,
      endYear: e.end_year ?? null,
    })),
    certificates: certificates.map((c) => ({
      title: c.certificate_title ?? "Untitled Certificate",
      issuer: c.certificate_issuer ?? null,
    })),
    skills: skills.map((s) => ({
      skill: s.skill ?? "Unknown Skill",
    })),
    languages: languages.map((l) => ({
      language: l.language,
      proficiency: l.proficiency,
    })),
    links: links.map((l) => ({
      title: l.title,
      url: l.url,
    })),
  };
}
