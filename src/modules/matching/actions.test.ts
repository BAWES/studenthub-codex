import { describe, it, expect } from "vitest";
import {
  matchCandidateToJobSchema,
  listMatchingJobsSchema,
  listMatchingCandidatesSchema,
  matchCandidateToJobResultSchema,
  listMatchingJobsResultSchema,
  listMatchingCandidatesResultSchema,
  matchScoreSchema,
  matchedJobRowSchema,
  matchedCandidateRowSchema,
  type MatchScore,
  type MatchedJobRow,
  type MatchedCandidateRow,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("matchCandidateToJobSchema", () => {
  it("accepts valid input", () => {
    const r = matchCandidateToJobSchema.safeParse({ candidateId: 1, jobId: 42 });
    expect(r.success).toBe(true);
  });

  it("coerces string numbers", () => {
    const r = matchCandidateToJobSchema.safeParse({ candidateId: "1", jobId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(1);
      expect(r.data.jobId).toBe(42);
    }
  });

  it("rejects negative candidateId", () => {
    expect(matchCandidateToJobSchema.safeParse({ candidateId: -1, jobId: 42 }).success).toBe(false);
  });

  it("rejects missing jobId", () => {
    expect(matchCandidateToJobSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });

  it("rejects zero values", () => {
    expect(matchCandidateToJobSchema.safeParse({ candidateId: 0, jobId: 42 }).success).toBe(false);
  });
});

describe("listMatchingJobsSchema", () => {
  it("accepts minimum input", () => {
    const r = listMatchingJobsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
  });

  it("applies defaults for page and limit", () => {
    const r = listMatchingJobsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts optional filters", () => {
    const r = listMatchingJobsSchema.safeParse({
      candidateId: 1,
      page: 2,
      limit: 50,
      employmentType: "full-time",
      location: "Kuwait City",
    });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    expect(listMatchingJobsSchema.safeParse({ candidateId: 1, limit: 200 }).success).toBe(false);
  });
});

describe("listMatchingCandidatesSchema", () => {
  it("accepts valid input", () => {
    const r = listMatchingCandidatesSchema.safeParse({ jobId: 42 });
    expect(r.success).toBe(true);
  });

  it("accepts all optional filters", () => {
    const r = listMatchingCandidatesSchema.safeParse({
      jobId: 42,
      page: 1,
      limit: 10,
      minScore: 50,
      skillFilter: "React",
      universityId: 5,
      majorFilter: "Computer Science",
    });
    expect(r.success).toBe(true);
  });

  it("rejects minScore above 100", () => {
    expect(listMatchingCandidatesSchema.safeParse({ jobId: 42, minScore: 150 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listMatchingCandidatesSchema.safeParse({ jobId: 42, page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("matchScoreSchema", () => {
  const validScore = { overall: 75, skillMatch: 80, educationMatch: 70, locationMatch: 60, breakdown: ["Good match"] };

  it("accepts a valid score", () => {
    expect(matchScoreSchema.safeParse(validScore).success).toBe(true);
  });

  it("accepts empty breakdown", () => {
    expect(matchScoreSchema.safeParse({ ...validScore, breakdown: [] }).success).toBe(true);
  });

  it("rejects overall above 100", () => {
    expect(matchScoreSchema.safeParse({ ...validScore, overall: 150 }).success).toBe(false);
  });

  it("rejects overall below 0", () => {
    expect(matchScoreSchema.safeParse({ ...validScore, overall: -5 }).success).toBe(false);
  });

  it("rejects non-integer score", () => {
    expect(matchScoreSchema.safeParse({ ...validScore, overall: 75.5 }).success).toBe(false);
  });

  it("rejects missing skillMatch", () => {
    const { skillMatch: _, ...withoutSkill } = validScore;
    expect(matchScoreSchema.safeParse(withoutSkill).success).toBe(false);
  });
});

describe("matchedJobRowSchema", () => {
  const validRow = {
    jobListingId: 1,
    title: "Software Engineer",
    employerName: "Acme Corp",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "800-1200 KWD",
    score: { overall: 85, skillMatch: 90, educationMatch: 80, locationMatch: 70, breakdown: [] },
  };

  it("accepts a valid matched job row", () => {
    expect(matchedJobRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(matchedJobRowSchema.safeParse({ ...validRow, location: null, employmentType: null, salaryRange: null }).success).toBe(true);
  });

  it("rejects missing jobListingId", () => {
    const { jobListingId: _, ...withoutId } = validRow;
    expect(matchedJobRowSchema.safeParse(withoutId).success).toBe(false);
  });
});

describe("matchedCandidateRowSchema", () => {
  const validRow = {
    candidateId: 42,
    candidateName: "John Doe",
    candidateSkills: ["JavaScript", "React", "Python"],
    universityName: "Kuwait University",
    score: { overall: 80, skillMatch: 85, educationMatch: 75, locationMatch: 65, breakdown: [] },
  };

  it("accepts a valid matched candidate row", () => {
    expect(matchedCandidateRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null universityName", () => {
    expect(matchedCandidateRowSchema.safeParse({ ...validRow, universityName: null }).success).toBe(true);
  });

  it("accepts empty skills list", () => {
    expect(matchedCandidateRowSchema.safeParse({ ...validRow, candidateSkills: [] }).success).toBe(true);
  });
});

describe("matchCandidateToJobResultSchema", () => {
  const validResult = {
    success: true,
    score: { overall: 75, skillMatch: 80, educationMatch: 70, locationMatch: 60, breakdown: ["Skill match: 80%"] },
  };

  it("accepts a valid result", () => {
    expect(matchCandidateToJobResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("rejects missing score", () => {
    expect(matchCandidateToJobResultSchema.safeParse({ success: true }).success).toBe(false);
  });
});

describe("listMatchingJobsResultSchema", () => {
  const validResult = {
    success: true,
    jobs: [
      {
        jobListingId: 1,
        title: "Software Engineer",
        employerName: "Acme Corp",
        location: "Kuwait City",
        employmentType: "full-time",
        salaryRange: "800-1200 KWD",
        score: { overall: 85, skillMatch: 90, educationMatch: 80, locationMatch: 70, breakdown: [] },
      },
    ],
    total: 1,
  };

  it("accepts a valid result", () => {
    expect(listMatchingJobsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty jobs array", () => {
    expect(listMatchingJobsResultSchema.safeParse({ ...validResult, jobs: [], total: 0 }).success).toBe(true);
  });
});

describe("listMatchingCandidatesResultSchema", () => {
  const validResult = {
    success: true,
    candidates: [
      {
        candidateId: 42,
        candidateName: "John Doe",
        candidateSkills: ["JavaScript", "React"],
        universityName: "Kuwait University",
        score: { overall: 80, skillMatch: 85, educationMatch: 75, locationMatch: 65, breakdown: [] },
      },
    ],
    total: 1,
  };

  it("accepts a valid result", () => {
    expect(listMatchingCandidatesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty candidates", () => {
    expect(listMatchingCandidatesResultSchema.safeParse({ ...validResult, candidates: [], total: 0 }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("MatchScore type shape", () => {
  it("constructs with valid data", () => {
    const score: MatchScore = { overall: 85, skillMatch: 90, educationMatch: 80, locationMatch: 70, breakdown: ["Strong match"] };
    expect(score.overall).toBe(85);
    expect(score.breakdown).toHaveLength(1);
  });
});

describe("MatchedJobRow type shape", () => {
  it("constructs with valid data", () => {
    const row: MatchedJobRow = {
      jobListingId: 1,
      title: "Engineer",
      employerName: "Acme",
      location: null,
      employmentType: "full-time",
      salaryRange: null,
      score: { overall: 85, skillMatch: 90, educationMatch: 80, locationMatch: 70, breakdown: [] },
    };
    expect(row.jobListingId).toBe(1);
    expect(row.employerName).toBe("Acme");
  });
});

describe("MatchedCandidateRow type shape", () => {
  it("constructs with valid data", () => {
    const row: MatchedCandidateRow = {
      candidateId: 42,
      candidateName: "Jane",
      candidateSkills: ["Python"],
      universityName: null,
      score: { overall: 80, skillMatch: 85, educationMatch: 75, locationMatch: 65, breakdown: [] },
    };
    expect(row.candidateId).toBe(42);
    expect(row.candidateSkills).toContain("Python");
  });
});
