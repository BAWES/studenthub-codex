"use server";

// ---------------------------------------------------------------------------
// Job-Candidate Matching — server actions
// ---------------------------------------------------------------------------
// Provides matching algorithms and filter APIs for:
// - Matching a specific candidate against a specific job
// - Listing jobs scored by match for a candidate
// - Listing candidates scored by match for an employer's job
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import {
  matchCandidateToJobSchema,
  listMatchingJobsSchema,
  listMatchingCandidatesSchema,
  matchCandidateToJobResultSchema,
  listMatchingJobsResultSchema,
  listMatchingCandidatesResultSchema,
} from "./schemas";
import type {
  MatchCandidateToJobInput,
  ListMatchingJobsInput,
  ListMatchingCandidatesInput,
  MatchScore,
  MatchedJobRow,
  MatchedCandidateRow,
} from "./schemas";
import {
  type JobMatchScore,
  extractSkills,
} from "./utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Tokenize text into lowercase words. */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "") // keep Arabic letters
    .split(/\s+/)
    .filter((w) => w.length > 1);
  return new Set(words);
}

/** Compute Jaccard similarity between two sets. Returns 0-100. */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return Math.round((intersection / union) * 100);
}

/* Common skill-like keywords to extract from free-text requirements. */
const SKILL_KEYWORDS = new Set([
  "javascript", "typescript", "python", "java", "c#", "c++", "php", "ruby",
  "go", "rust", "swift", "kotlin", "react", "angular", "vue", "node",
  "next.js", "express", "django", "flask", "spring", "rails",
  "sql", "mysql", "postgresql", "mongodb", "redis", "docker", "kubernetes",
  "aws", "azure", "gcp", "git", "ci/cd", "rest", "graphql", "api",
  "html", "css", "sass", "tailwind", "bootstrap",
  "agile", "scrum", "jira", "devops",
  "leadership", "communication", "teamwork", "problem solving",
  "management", "analysis", "design", "testing",
  "sales", "marketing", "customer service", "support",
  "accounting", "finance", "hr", "recruitment",
  "photoshop", "illustrator", "figma", "ui/ux",
  "excel", "microsoft office", "powerpoint", "word",
  "arabic", "english",
]);

/** Extract skill-like tokens from job requirements text. */
function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const keyword of SKILL_KEYWORDS) {
    if (lower.includes(keyword)) {
      found.push(keyword);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

async function computeSkillMatch(
  candidateId: number,
  jobRequirements: string | null,
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  const candidateSkills = await prisma.candidate_skill.findMany({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { skill: true },
  });

  if (candidateSkills.length === 0) {
    details.push("No skills listed for this candidate");
    return { score: 0, details };
  }

  const candidateSkillSet = new Set(
    candidateSkills.map((s) => s.skill.toLowerCase().trim()),
  );

  if (!jobRequirements) {
    details.push(`Candidate has ${candidateSkills.length} skills (no job requirements to match against)`);
    return { score: 50, details }; // neutral score when no requirements
  }

  const extractedSkills = extractSkillsFromText(jobRequirements);
  const reqSkillSet = new Set(extractedSkills.map((s) => s.toLowerCase()));

  if (reqSkillSet.size === 0) {
    // Fallback: use Jaccard on tokenized requirements vs skill names
    const reqTokens = tokenize(jobRequirements);
    const score = jaccardSimilarity(candidateSkillSet, reqTokens);
    details.push(`Skill match (text-based): ${score}%`);
    return { score, details };
  }

  const score = jaccardSimilarity(candidateSkillSet, reqSkillSet);
  const matched = [...candidateSkillSet].filter((s) => reqSkillSet.has(s));
  if (matched.length > 0) {
    details.push(`Matched skills: ${matched.slice(0, 8).join(", ")}${matched.length > 8 ? "..." : ""}`);
  }
  details.push(`Skill match: ${score}% (${matched.length}/${reqSkillSet.size} required skills)`);

  return { score, details };
}

async function computeEducationMatch(
  candidateId: number,
  _jobRequirements: string | null,
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  const education = await prisma.candidate_education.findFirst({
    where: { candidate_id: candidateId },
    include: {
      university: { select: { university_name_en: true } },
      degree: { select: { degree_name_en: true } },
      major: { select: { major_name_en: true } },
    },
  });

  if (!education) {
    details.push("No education record found");
    return { score: 30, details }; // lower score for no education
  }

  const eduInfo: string[] = [];
  if (education.university?.university_name_en) {
    eduInfo.push(education.university.university_name_en);
  }
  if (education.degree?.degree_name_en) {
    eduInfo.push(education.degree.degree_name_en);
  }
  if (education.major?.major_name_en) {
    eduInfo.push(education.major.major_name_en);
  }

  if (eduInfo.length > 0) {
    details.push(`Education: ${eduInfo.join(" — ")}`);
  }

  return { score: 70, details }; // has education = baseline good
}

async function computeLocationMatch(
  candidateId: number,
  jobLocation: string | null,
): Promise<{ score: number; details: string[] }> {
  const details: string[] = [];

  if (!jobLocation) {
    details.push("No job location specified");
    return { score: 50, details }; // neutral
  }

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      candidate_address_line1: true,
      candidate_area_uuid: true,
    },
  });

  if (!candidate?.candidate_address_line1 && !candidate?.candidate_area_uuid) {
    details.push("No candidate location on file");
    return { score: 50, details };
  }

  // Simple text overlap check
  const locationTokens = tokenize(jobLocation);
  const candidateLocation = [
    candidate.candidate_address_line1 ?? "",
    candidate.candidate_area_uuid ?? "",
  ].join(" ");
  const candidateTokens = tokenize(candidateLocation);

  const score = jaccardSimilarity(locationTokens, candidateTokens);
  details.push(`Location match: ${score}%`);
  return { score, details };
}

/** Compute overall match score between a candidate and a job. */
export async function matchCandidateToJob(
  input: MatchCandidateToJobInput,
): Promise<{ success: true; score: MatchScore }> {
  const { candidateId, jobId } = matchCandidateToJobSchema.parse(input);

  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: jobId },
    select: { title: true, requirements: true, location: true },
  });

  if (!job) throw new Error("Job not found");

  const [skillScore, eduScore, locScore] = await Promise.all([
    computeSkillMatch(candidateId, job.requirements),
    computeEducationMatch(candidateId, job.requirements),
    computeLocationMatch(candidateId, job.location),
  ]);

  // Weighted overall score: skills 50%, education 30%, location 20%
  const overall = Math.round(
    skillScore.score * 0.5 +
    eduScore.score * 0.3 +
    locScore.score * 0.2,
  );

  const breakdown = [
    ...skillScore.details,
    ...eduScore.details,
    ...locScore.details,
  ];

  const result: { success: true; score: MatchScore } = {
    success: true,
    score: {
      overall,
      skillMatch: skillScore.score,
      educationMatch: eduScore.score,
      locationMatch: locScore.score,
      breakdown,
    },
  };

  // Validate output shape
  const outputParsed = matchCandidateToJobResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/matching] matchCandidateToJob output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// listMatchingJobs — score all active jobs for a given candidate
// ---------------------------------------------------------------------------

export async function listMatchingJobs(
  input: ListMatchingJobsInput,
): Promise<{ success: true; jobs: MatchedJobRow[]; total: number }> {
  const { candidateId, page, limit, employmentType, location } =
    listMatchingJobsSchema.parse(input);

  const where: Record<string, unknown> = { status: "active" };
  if (employmentType) where.employmentType = employmentType;
  if (location) where.location = { contains: location };

  const [dbRows] = await Promise.all([
    prisma.job_listing.findMany({
      where: where as any,
      include: { employer: { select: { company_name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit * 2, // fetch extra for scoring; will trim
    }),
  ]);

  // Score each job
  const scored = await Promise.all(
    dbRows.map(async (job) => {
      const result = await matchCandidateToJob({
        candidateId,
        jobId: job.jobListingId,
      });
      return {
        jobListingId: job.jobListingId,
        title: job.title,
        employerName: job.employer.company_name,
        location: job.location,
        employmentType: job.employmentType,
        salaryRange: job.salaryRange,
        score: result.score,
      } satisfies MatchedJobRow;
    }),
  );

  // Sort by overall score descending
  scored.sort((a, b) => b.score.overall - a.score.overall);

  const total = scored.length;
  const jobs = scored.slice(0, limit);

  const result: { success: true; jobs: MatchedJobRow[]; total: number } = { success: true, jobs, total };

  // Validate output shape
  const outputParsed = listMatchingJobsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/matching] listMatchingJobs output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// listMatchingCandidates — score all candidates for an employer's job
// ---------------------------------------------------------------------------

export async function listMatchingCandidates(
  input: ListMatchingCandidatesInput,
): Promise<{
  success: true;
  candidates: MatchedCandidateRow[];
  total: number;
}> {
  const { jobId, page, limit, minScore, skillFilter, universityId, majorFilter } =
    listMatchingCandidatesSchema.parse(input);

  // Get the job to check it exists
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: jobId },
    select: { jobListingId: true, title: true, employerId: true },
  });

  if (!job) throw new Error("Job not found");

  // Get candidates who have applied to this job (if any)
  const applicants = await prisma.job_listing_application.findMany({
    where: { jobListingId: jobId },
    select: { candidateId: true },
  });

  const applicantIds = applicants.map((a) => a.candidateId);

  // If there are applicants, score them; otherwise score recent candidates with skills
  let candidates;
  if (applicantIds.length > 0) {
    candidates = applicantIds;
  } else {
    // No applicants yet — show candidates with skills as potential matches
    const skilledCandidates = await prisma.candidate_skill.findMany({
      where: { deleted: 0 },
      select: { candidate_id: true },
      distinct: ["candidate_id"],
      take: 200,
    });
    candidates = [...new Set(skilledCandidates.map((s) => s.candidate_id!).filter(Boolean))];
  }

  // Apply product-level filters
  let filteredCandidateIds = candidates;

  if (universityId) {
    const eduCandidates = await prisma.candidate_education.findMany({
      where: {
        candidate_id: { in: filteredCandidateIds },
        university_id: universityId,
      },
      select: { candidate_id: true },
    });
    filteredCandidateIds = eduCandidates.map((e) => e.candidate_id);
  }

  if (skillFilter) {
    const skillCandidates = await prisma.candidate_skill.findMany({
      where: {
        candidate_id: { in: filteredCandidateIds },
        deleted: 0,
        skill: { contains: skillFilter },
      },
      select: { candidate_id: true },
    });
    filteredCandidateIds = [...new Set(skillCandidates.map((s) => s.candidate_id!))];
  }

  // Score all filtered candidates
  const scoredResults = await Promise.all(
    filteredCandidateIds.slice(0, 100).map(async (cid) => {
      try {
        const result = await matchCandidateToJob({ candidateId: cid, jobId });
        return { candidateId: cid, score: result.score };
      } catch {
        return null;
      }
    }),
  );

  const validResults = scoredResults.filter(
    (r): r is NonNullable<typeof r> => r !== null,
  );

  // Apply minScore filter
  const filtered = minScore
    ? validResults.filter((r) => r.score.overall >= minScore)
    : validResults;

  // Sort by overall score descending
  filtered.sort((a, b) => b.score.overall - a.score.overall);

  const total = filtered.length;
  const pageResults = filtered.slice((page - 1) * limit, page * limit);

  // Enrich with candidate details
  const candidatesWithDetails = await Promise.all(
    pageResults.map(async (r) => {
      const [candidateInfo, skills] = await Promise.all([
        prisma.candidate.findUnique({
          where: { candidate_id: r.candidateId },
          select: { candidate_name: true },
        }),
        prisma.candidate_skill.findMany({
          where: { candidate_id: r.candidateId, deleted: 0 },
          select: { skill: true },
          take: 20,
        }),
      ]);

      // Get university name
      const education = await prisma.candidate_education.findFirst({
        where: { candidate_id: r.candidateId },
        include: { university: { select: { university_name_en: true } } },
      });

      return {
        candidateId: r.candidateId,
        candidateName: candidateInfo?.candidate_name ?? `Candidate #${r.candidateId}`,
        candidateSkills: skills.map((s) => s.skill),
        universityName: education?.university?.university_name_en ?? null,
        score: r.score,
      } satisfies MatchedCandidateRow;
    }),
  );

  const result: { success: true; candidates: MatchedCandidateRow[]; total: number } = {
    success: true,
    candidates: candidatesWithDetails,
    total,
  };

  // Validate output shape
  const outputParsed = listMatchingCandidatesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/matching] listMatchingCandidates output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Legacy scoring functions — migrated from app/candidate/jobs/matching.ts
// ---------------------------------------------------------------------------

/**
 * Compute match score for one candidate against one job listing.
 * Scoring dimensions: Skills (40%), Education (30%), Location (15%), Type (15%).
 */
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

/**
 * Batch-score all active jobs for a candidate.
 * Optionally filter to specific job IDs.
 */
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
