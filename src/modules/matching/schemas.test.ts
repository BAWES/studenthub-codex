import { describe, it, expect } from "vitest";
import {
  matchScoreSchema,
  matchedJobRowSchema,
  matchedCandidateRowSchema,
  matchCandidateToJobResultSchema,
  listMatchingJobsResultSchema,
  listMatchingCandidatesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validMatchScore = () => ({
  overall: 85,
  skillMatch: 90,
  educationMatch: 75,
  locationMatch: 80,
  breakdown: [
    "Strong skill alignment (React, TypeScript)",
    "Education: Bachelor's in CS",
  ],
});

const validMatchedJobRow = () => ({
  jobListingId: 123,
  title: "Software Engineer",
  employerName: "Acme Corp",
  location: "Kuwait City",
  employmentType: "full-time",
  salaryRange: "1200-1800 KWD",
  score: validMatchScore(),
});

const validMatchedJobRowMinimal = () => ({
  jobListingId: 456,
  title: "Intern",
  employerName: "Startup Inc",
  location: null,
  employmentType: null,
  salaryRange: null,
  score: validMatchScore(),
});

const validMatchedCandidateRow = () => ({
  candidateId: 789,
  candidateName: "Fatima Al-Ali",
  candidateSkills: ["React", "TypeScript", "Node.js", "GraphQL"],
  universityName: "Kuwait University",
  score: validMatchScore(),
});

const validMatchedCandidateRowMinimal = () => ({
  candidateId: 790,
  candidateName: "Ali Hassan",
  candidateSkills: [],
  universityName: null,
  score: validMatchScore(),
});

// ---------------------------------------------------------------------------
// matchScoreSchema
// ---------------------------------------------------------------------------

describe("matchScoreSchema", () => {
  it("accepts a full match score", () => {
    const r = matchScoreSchema.safeParse(validMatchScore());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = matchScoreSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects score outside 0-100 range", () => {
    const r = matchScoreSchema.safeParse({
      ...validMatchScore(),
      overall: 150,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative score", () => {
    const r = matchScoreSchema.safeParse({
      ...validMatchScore(),
      skillMatch: -5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer score", () => {
    const r = matchScoreSchema.safeParse({
      ...validMatchScore(),
      overall: 85.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-array breakdown", () => {
    const r = matchScoreSchema.safeParse({
      ...validMatchScore(),
      breakdown: "string instead of array",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty breakdown with non-string items", () => {
    const r = matchScoreSchema.safeParse({
      ...validMatchScore(),
      breakdown: [123],
    });
    expect(r.success).toBe(false);
  });

  it("accepts score at boundary values", () => {
    const r = matchScoreSchema.safeParse({
      overall: 0,
      skillMatch: 100,
      educationMatch: 0,
      locationMatch: 100,
      breakdown: [],
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// matchedJobRowSchema
// ---------------------------------------------------------------------------

describe("matchedJobRowSchema", () => {
  it("accepts a full matched job row", () => {
    const r = matchedJobRowSchema.safeParse(validMatchedJobRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal matched job row (nullable fields set to null)", () => {
    const r = matchedJobRowSchema.safeParse(validMatchedJobRowMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = matchedJobRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = matchedJobRowSchema.safeParse({
      ...validMatchedJobRow(),
      jobListingId: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive jobListingId", () => {
    const r = matchedJobRowSchema.safeParse({
      ...validMatchedJobRow(),
      jobListingId: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing title", () => {
    const r = matchedJobRowSchema.safeParse({
      ...validMatchedJobRow(),
      title: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid score", () => {
    const r = matchedJobRowSchema.safeParse({
      ...validMatchedJobRow(),
      score: { overall: 200 },
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// matchedCandidateRowSchema
// ---------------------------------------------------------------------------

describe("matchedCandidateRowSchema", () => {
  it("accepts a full matched candidate row", () => {
    const r = matchedCandidateRowSchema.safeParse(validMatchedCandidateRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal matched candidate row", () => {
    const r = matchedCandidateRowSchema.safeParse(
      validMatchedCandidateRowMinimal()
    );
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = matchedCandidateRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = matchedCandidateRowSchema.safeParse({
      ...validMatchedCandidateRow(),
      candidateId: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const r = matchedCandidateRowSchema.safeParse({
      ...validMatchedCandidateRow(),
      candidateId: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string candidateSkills items", () => {
    const r = matchedCandidateRowSchema.safeParse({
      ...validMatchedCandidateRow(),
      candidateSkills: [123],
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing score", () => {
    const r = matchedCandidateRowSchema.safeParse({
      ...validMatchedCandidateRow(),
      score: undefined,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// matchCandidateToJobResultSchema
// ---------------------------------------------------------------------------

describe("matchCandidateToJobResultSchema", () => {
  it("accepts a successful match result", () => {
    const r = matchCandidateToJobResultSchema.safeParse({
      success: true,
      score: validMatchScore(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts a failed match result", () => {
    const r = matchCandidateToJobResultSchema.safeParse({
      success: false,
      score: validMatchScore(),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = matchCandidateToJobResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = matchCandidateToJobResultSchema.safeParse({
      success: "yes",
      score: validMatchScore(),
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid score", () => {
    const r = matchCandidateToJobResultSchema.safeParse({
      success: true,
      score: { overall: 200 },
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMatchingJobsResultSchema
// ---------------------------------------------------------------------------

describe("listMatchingJobsResultSchema", () => {
  it("accepts a full matching jobs result", () => {
    const r = listMatchingJobsResultSchema.safeParse({
      success: true,
      jobs: [validMatchedJobRow(), validMatchedJobRowMinimal()],
      total: 15,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty jobs array", () => {
    const r = listMatchingJobsResultSchema.safeParse({
      success: true,
      jobs: [],
      total: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = listMatchingJobsResultSchema.safeParse({ jobs: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-number total", () => {
    const r = listMatchingJobsResultSchema.safeParse({
      success: true,
      jobs: [],
      total: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listMatchingJobsResultSchema.safeParse({
      success: true,
      jobs: [],
      total: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid job items in the array", () => {
    const r = listMatchingJobsResultSchema.safeParse({
      success: true,
      jobs: [{ jobListingId: "bad" }],
      total: 1,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMatchingCandidatesResultSchema
// ---------------------------------------------------------------------------

describe("listMatchingCandidatesResultSchema", () => {
  it("accepts a full matching candidates result", () => {
    const r = listMatchingCandidatesResultSchema.safeParse({
      success: true,
      candidates: [
        validMatchedCandidateRow(),
        validMatchedCandidateRowMinimal(),
      ],
      total: 25,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty candidates array", () => {
    const r = listMatchingCandidatesResultSchema.safeParse({
      success: true,
      candidates: [],
      total: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = listMatchingCandidatesResultSchema.safeParse({
      candidates: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number total", () => {
    const r = listMatchingCandidatesResultSchema.safeParse({
      success: true,
      candidates: [],
      total: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listMatchingCandidatesResultSchema.safeParse({
      success: true,
      candidates: [],
      total: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid candidate items in the array", () => {
    const r = listMatchingCandidatesResultSchema.safeParse({
      success: true,
      candidates: [{ candidateId: "bad" }],
      total: 1,
    });
    expect(r.success).toBe(false);
  });
});
