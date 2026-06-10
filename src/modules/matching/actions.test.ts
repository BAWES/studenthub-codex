import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  matchCandidateToJobSchema,
  listMatchingJobsSchema,
  listMatchingCandidatesSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Mock Prisma client
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job_listing: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    candidate_skill: {
      findMany: vi.fn(),
    },
    candidate_education: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    candidate: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    job_listing_application: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import type { Mock } from "vitest";
import {
  matchCandidateToJob,
  listMatchingJobs,
  listMatchingCandidates,
} from "./actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJob() {
  return {
    jobListingId: 1,
    employerId: 10,
    title: "Software Engineer",
    description: "Build awesome things",
    requirements: "React, TypeScript, Node.js, communication skills",
    location: "Kuwait City",
    status: "active",
    employer: { company_name: "TechCorp" },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

function makeCandidateSkills(skills: string[]) {
  return skills.map((s) => ({ skill: s }));
}

function makeEducation(overrides = {}) {
  return {
    candidate_id: 42,
    university: { university_name_en: "Kuwait University" },
    degree: { degree_name_en: "Bachelor's" },
    major: { major_name_en: "Computer Science" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("matchCandidateToJobSchema", () => {
  it("accepts valid input", () => {
    const result = matchCandidateToJobSchema.parse({
      candidateId: 42,
      jobId: 1,
    });
    expect(result.candidateId).toBe(42);
    expect(result.jobId).toBe(1);
  });

  it("coerces string IDs", () => {
    const result = matchCandidateToJobSchema.parse({
      candidateId: "42",
      jobId: "1",
    });
    expect(result.candidateId).toBe(42);
  });

  it("rejects missing candidateId", () => {
    expect(() =>
      matchCandidateToJobSchema.parse({ jobId: 1 }),
    ).toThrow();
  });

  it("rejects negative IDs", () => {
    expect(() =>
      matchCandidateToJobSchema.parse({ candidateId: -1, jobId: 1 }),
    ).toThrow();
  });
});

describe("listMatchingJobsSchema", () => {
  it("accepts valid input", () => {
    const result = listMatchingJobsSchema.parse({
      candidateId: 42,
    });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("accepts optional filters", () => {
    const result = listMatchingJobsSchema.parse({
      candidateId: 42,
      employmentType: "full-time",
      location: "Kuwait",
    });
    expect(result.employmentType).toBe("full-time");
  });

  it("rejects limit > 100", () => {
    expect(() =>
      listMatchingJobsSchema.parse({ candidateId: 42, limit: 200 }),
    ).toThrow();
  });
});

describe("listMatchingCandidatesSchema", () => {
  it("accepts valid input", () => {
    const result = listMatchingCandidatesSchema.parse({ jobId: 1 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("accepts optional filters", () => {
    const result = listMatchingCandidatesSchema.parse({
      jobId: 1,
      minScore: 50,
      skillFilter: "react",
      universityId: 5,
    });
    expect(result.minScore).toBe(50);
    expect(result.skillFilter).toBe("react");
  });

  it("rejects minScore > 100", () => {
    expect(() =>
      listMatchingCandidatesSchema.parse({ jobId: 1, minScore: 150 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// matchCandidateToJob
// ---------------------------------------------------------------------------

describe("matchCandidateToJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a match score for a candidate-job pair", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(makeJob());
    (prisma.candidate_skill.findMany as Mock).mockResolvedValue(
      makeCandidateSkills(["react", "typescript", "node.js", "communication"]),
    );
    (prisma.candidate_education.findFirst as Mock).mockResolvedValue(
      makeEducation(),
    );
    (prisma.candidate.findUnique as Mock).mockResolvedValue({
      candidate_id: 42,
      candidate_address_line1: "Salmiya, Kuwait City",
      candidate_area_uuid: null,
    });

    const result = await matchCandidateToJob({
      candidateId: 42,
      jobId: 1,
    });

    expect(result.success).toBe(true);
    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.score.overall).toBeLessThanOrEqual(100);
    expect(result.score.skillMatch).toBeGreaterThan(0); // should match skills
    expect(result.score.educationMatch).toBeGreaterThan(0);
    expect(result.score.breakdown.length).toBeGreaterThan(0);
  });

  it("returns 0 skill match when candidate has no skills", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(makeJob());
    (prisma.candidate_skill.findMany as Mock).mockResolvedValue([]);
    (prisma.candidate_education.findFirst as Mock).mockResolvedValue(null);
    (prisma.candidate.findUnique as Mock).mockResolvedValue(null);

    const result = await matchCandidateToJob({
      candidateId: 42,
      jobId: 1,
    });

    expect(result.score.skillMatch).toBe(0);
    expect(result.score.educationMatch).toBe(30); // no education = baseline
  });

  it("throws for non-existent job", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(null);

    await expect(
      matchCandidateToJob({ candidateId: 42, jobId: 999 }),
    ).rejects.toThrow("Job not found");
  });
});

// ---------------------------------------------------------------------------
// listMatchingJobs
// ---------------------------------------------------------------------------

describe("listMatchingJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns jobs sorted by match score", async () => {
    const job1 = { ...makeJob(), jobListingId: 1, title: "Engineer A" };
    const job2 = { ...makeJob(), jobListingId: 2, title: "Engineer B" };

    // listMatchingJobs → findMany for the list, then matchCandidateToJob → findUnique per job
    (prisma.job_listing.findMany as Mock).mockResolvedValue([job1, job2]);
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(makeJob());
    (prisma.candidate_skill.findMany as Mock).mockResolvedValue(
      makeCandidateSkills(["react", "typescript"]),
    );
    (prisma.candidate_education.findFirst as Mock).mockResolvedValue(
      makeEducation(),
    );
    (prisma.candidate.findUnique as Mock).mockResolvedValue({
      candidate_address_line1: "Kuwait City",
      candidate_area_uuid: null,
    });

    const result = await listMatchingJobs({
      candidateId: 42,
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(true);
    expect(result.jobs.length).toBe(2);
    expect(result.jobs[0].score.overall).toBeGreaterThanOrEqual(0);
  });

  it("filters by employment type", async () => {
    (prisma.job_listing.findMany as Mock).mockResolvedValue([]);

    await listMatchingJobs({
      candidateId: 42,
      employmentType: "full-time",
    });

    const callArgs = (prisma.job_listing.findMany as Mock).mock.calls[0][0];
    expect(callArgs.where.employmentType).toBe("full-time");
  });
});

// ---------------------------------------------------------------------------
// listMatchingCandidates
// ---------------------------------------------------------------------------

describe("listMatchingCandidates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns candidates scored for a job", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(makeJob());
    (prisma.job_listing_application.findMany as Mock).mockResolvedValue([
      { candidateId: 42 },
    ]);
    (prisma.candidate_skill.findMany as Mock).mockResolvedValue(
      makeCandidateSkills(["react", "typescript"]),
    );
    (prisma.candidate_education.findFirst as Mock).mockResolvedValue(
      makeEducation(),
    );
    (prisma.candidate.findUnique as Mock).mockResolvedValue({
      candidate_name: "Ahmed Ali",
      candidate_address_line1: "Kuwait City",
      candidate_area_uuid: null,
    });

    const result = await listMatchingCandidates({
      jobId: 1,
      page: 1,
      limit: 20,
    });

    expect(result.success).toBe(true);
    expect(result.candidates.length).toBe(1);
    expect(result.candidates[0].candidateName).toBe("Ahmed Ali");
    expect(result.candidates[0].candidateSkills).toContain("react");
    expect(result.candidates[0].score.overall).toBeGreaterThan(0);
  });

  it("throws for non-existent job", async () => {
    (prisma.job_listing.findUnique as Mock).mockResolvedValue(null);

    await expect(
      listMatchingCandidates({ jobId: 999 }),
    ).rejects.toThrow("Job not found");
  });
});
