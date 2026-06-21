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
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateObjective: string | null;
  candidateBirthDate: string | null;
  candidateGender: string | null;
  nationality: string | null;
  address: string | null;
  educationRows: string;
  experienceRows: string;
  skillTags: string;
  languageRows: string;
};

// ---------------------------------------------------------------------------
// Server action: fetch candidate data for CV PDF
// ---------------------------------------------------------------------------

/**
 * Fetch candidate profile data needed for the CV PDF generation.
 * Uses separate queries (no Prisma include) to avoid client type issues.
 * Returns null if candidate not found.
 */
export async function getCvPdfData(
  input: GetCvPdfDataInput,
): Promise<CvPdfActionResult | null> {
  await requireCapability("candidate.read");

  const parsed = getCvPdfDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const { candidateId } = parsed.data;

  // Fetch candidate with relations via separate queries (avoids Prisma include type bug)
  const [candidate, educations, experiences, skills, languages, country] =
    await Promise.all([
      prisma.candidate.findUnique({
        where: { candidate_id: candidateId },
      }),
      prisma.candidate_education.findMany({
        where: { candidate_id: candidateId },
        orderBy: { created_at: "desc" },
      }),
      prisma.candidate_experience.findMany({
        where: { candidate_id: candidateId, deleted: 0 },
        orderBy: { candidate_experience_created_at: "desc" },
      }),
      prisma.candidate_skill.findMany({
        where: { candidate_id: candidateId, deleted: 0 },
        orderBy: { candidate_skill_created_at: "desc" },
      }),
      prisma.candidate_language.findMany({
        where: { candidate_id: candidateId, deleted: 0 },
      }),
      prisma.country.findUnique({
        where: { country_id: candidateId }, // Will be re-queried below if needed
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

  // Fetch area
  const area =
    candidate.candidate_area_uuid != null
      ? await prisma.area.findUnique({
          where: { area_uuid: candidate.candidate_area_uuid },
        })
      : null;

  // Fetch degree/major/university names for each education entry
  const educationRows = (
    await Promise.all(
      educations.map(async (edu) => {
        const [degree, major, uni] = await Promise.all([
          edu.degree_uuid
            ? prisma.degree.findUnique({ where: { degree_uuid: edu.degree_uuid } })
            : null,
          edu.major_uuid
            ? prisma.major.findUnique({ where: { major_uuid: edu.major_uuid } })
            : null,
          prisma.university.findUnique({ where: { university_id: edu.university_id } }),
        ]);
        const degreeName = degree?.degree_name_en ?? "";
        const majorName = major?.major_name_en ?? "";
        const uniName = uni?.university_name_en ?? "";
        const title = [degreeName, majorName].filter(Boolean).join(" in ");
        const year = edu.graduation_year ?? "";
        return `
    <tr>
      <td>${escapeHtmlInner(title || "Education")}</td>
      <td>${escapeHtmlInner(uniName)}</td>
      <td>${year}</td>
    </tr>`;
      }),
    )
  ).join("\n");

  // Format experience rows
  const experienceRows = experiences
    .map((exp) => {
      const year = exp.candidate_experience_created_at
        ? new Date(exp.candidate_experience_created_at).getFullYear()
        : "";
      return `
    <tr>
      <td>${escapeHtmlInner(exp.experience || "")}</td>
      <td>&mdash;</td>
      <td>${year}</td>
    </tr>`;
    })
    .join("\n");

  // Format skills as comma-separated tags
  const skillTags = skills
    .map((s) => s.skill)
    .filter(Boolean)
    .join(", ");

  // Format language rows
  const languageRows = languages
    .map((lang) => {
      return `
    <tr>
      <td>${escapeHtmlInner(lang.language || "")}</td>
      <td>${escapeHtmlInner(lang.proficiency || "")}</td>
    </tr>`;
    })
    .join("\n");

  // Build address from area + country
  const addressParts: string[] = [];
  if (candidate.candidate_address_line1) {
    addressParts.push(candidate.candidate_address_line1);
  }
  if (area?.area_name_en) {
    addressParts.push(area.area_name_en);
  }
  if (actualCountry?.country_name_en) {
    addressParts.push(actualCountry.country_name_en);
  }

  return {
    candidateName: candidate.candidate_name,
    candidateEmail: candidate.candidate_email || null,
    candidatePhone: candidate.candidate_phone || null,
    candidateObjective: candidate.candidate_objective || null,
    candidateBirthDate: candidate.candidate_birth_date
      ? candidate.candidate_birth_date.toISOString().split("T")[0]
      : null,
    candidateGender:
      candidate.candidate_gender === 1
        ? "Male"
        : candidate.candidate_gender === 2
          ? "Female"
          : null,
    nationality: actualCountry?.country_name_en ?? null,
    address: addressParts.length > 0 ? addressParts.join(", ") : null,
    educationRows,
    experienceRows,
    skillTags,
    languageRows,
  };
}

/**
 * Minimal HTML escape for data that's already inside HTML template strings.
 */
function escapeHtmlInner(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
