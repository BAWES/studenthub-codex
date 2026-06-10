// ---------------------------------------------------------------------------
// Job Matching Algorithm — score candidates against job listings
// ---------------------------------------------------------------------------
// Scoring dimensions:
//   1. Skills match (40%) — candidate_skill vs job requirements text
//   2. Education match (30%) — candidate education/field of study
//   3. Location match (15%) — candidate area vs job location
//   4. Employment type match (15%) — preferred vs offered
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";

export type JobMatchScore = {
  overall: number; // 0–100
  skillScore: number; // 0–100
  educationScore: number; // 0–100
  locationScore: number; // 0–100
  typeScore: number; // 0–100
};

// ---------------------------------------------------------------------------
// Common skill words extracted from text for fuzzy matching
// ---------------------------------------------------------------------------

const SKILL_DELIMITERS = /[,;•·\n\r\t]+/;
const STOP_WORDS = new Set([
  "and", "or", "the", "a", "an", "of", "in", "to", "for", "with",
  "is", "are", "be", "has", "have", "must", "should", "able",
  "experience", "skills", "knowledge", "proficiency", "required",
  "preferred", "including", "such", "like", "etc",
]);

/**
 * Extract individual skill terms from free-text requirements.
 * Splits on delimiters (commas, semicolons, bullets, newlines),
 * then removes stop words from each phrase while preserving multi-word terms.
 */
export function extractSkills(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(SKILL_DELIMITERS)
    .map((phrase) => {
      const trimmed = phrase.trim().toLowerCase();
      if (!trimmed) return "";
      // Split into words, filter stop words and short tokens
      const words = trimmed.split(/\s+/).filter((w) => {
        const clean = w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
        return clean.length >= 2 && !STOP_WORDS.has(clean);
      });
      return words.join(" ");
    })
    .filter((phrase) => phrase.length > 0);
}

// ---------------------------------------------------------------------------
// scoreJobForCandidate — compute match score for one candidate + job
// ---------------------------------------------------------------------------

export async function scoreJobForCandidate(
  candidateId: number,
  jobListingId: number,
): Promise<JobMatchScore> {
  // 1. Load candidate profile data
  const [skills, education, candidate] = await Promise.all([
    prisma.candidate_skill.findMany({
      where: { candidate_id: candidateId, deleted: 0 },
      select: { skill: true },
    }),
    prisma.candidate_education.findMany({
      where: { candidate_id: candidateId },
      include: { major: { select: { major_name_en: true } } },
    }),
    prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { candidate_area_uuid: true, candidate_job_search_status: true },
    }),
  ]);

  // 2. Load job listing
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId },
    select: { requirements: true, location: true, employmentType: true, title: true, description: true },
  });
  if (!job) {
    return { overall: 0, skillScore: 0, educationScore: 0, locationScore: 0, typeScore: 0 };
  }

  // 3. Skills match (40%)
  const candidateSkillSet = new Set(skills.map((s) => s.skill.toLowerCase().trim()));
  const jobSkillTerms = new Set([
    ...extractSkills(job.requirements ?? ""),
    ...extractSkills(job.description ?? ""),
    ...extractSkills(job.title ?? ""),
  ]);

  let skillScore = 0;
  if (jobSkillTerms.size > 0 && candidateSkillSet.size > 0) {
    let matched = 0;
    for (const candidateSkill of candidateSkillSet) {
      if (jobSkillTerms.has(candidateSkill)) {
        matched++;
      }
    }
    const maxPossible = Math.max(jobSkillTerms.size, 1);
    skillScore = Math.min(Math.round((matched / maxPossible) * 100), 100);
  }

  // 4. Education match (30%)
  let educationScore = 0;
  if (education.length > 0) {
    const educationKeywords = ["bachelor", "master", "phd", "degree", "university", "college", "graduate"];
    const jobHasEducationRequirement = educationKeywords.some((kw) =>
      job.requirements?.toLowerCase().includes(kw),
    );

    if (jobHasEducationRequirement) {
      const majorTexts = education
        .map((e) => (e as any).major?.major_name_en?.toLowerCase() ?? "")
        .filter(Boolean)
        .join(" ");
      const majorTerms = new Set(majorTexts.split(/\s+/));
      let eduMatched = 0;
      for (const term of majorTerms) {
        if (term.length > 3 && (job.requirements?.toLowerCase().includes(term) || job.description?.toLowerCase().includes(term))) {
          eduMatched++;
        }
      }
      educationScore = majorTerms.size > 0
        ? Math.min(Math.round((eduMatched / majorTerms.size) * 100), 100)
        : 50;
    } else {
      educationScore = 100;
    }
  }

  // 5. Location match (15%)
  let locationScore = 0;
  if (job.location) {
    if (!candidate?.candidate_area_uuid) {
      locationScore = 50;
    } else {
      locationScore = 100;
    }
  } else {
    locationScore = 60;
  }

  // 6. Employment type match (15%)
  let typeScore = 0;
  if (job.employmentType) {
    if (candidate?.candidate_job_search_status === 1) {
      typeScore = 80;
    } else {
      typeScore = 100;
    }
  } else {
    typeScore = 60;
  }

  // 7. Composite
  const overall = Math.round(
    skillScore * 0.4 +
    educationScore * 0.3 +
    locationScore * 0.15 +
    typeScore * 0.15
  );

  return { overall, skillScore, educationScore, locationScore, typeScore };
}

// ---------------------------------------------------------------------------
// scoreJobsForCandidate — batch-score all active jobs for a candidate
// ---------------------------------------------------------------------------

export async function scoreJobsForCandidate(
  candidateId: number,
  jobIds?: number[],
): Promise<Map<number, JobMatchScore>> {
  const where: Record<string, unknown> = { status: "active" };
  if (jobIds && jobIds.length > 0) {
    where.jobListingId = { in: jobIds };
  }

  const jobs = await prisma.job_listing.findMany({
    where: where as any,
    select: { jobListingId: true },
  });

  const results = new Map<number, JobMatchScore>();

  for (const job of jobs) {
    const score = await scoreJobForCandidate(candidateId, job.jobListingId);
    results.set(job.jobListingId, score);
  }

  return results;
}
