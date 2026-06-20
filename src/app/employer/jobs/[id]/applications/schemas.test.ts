import { describe, it, expect } from "vitest";
import {
  jobApplicationRowOutputSchema,
  jobApplicationListOutputSchema,
  jobApplicationWithJobRowOutputSchema,
  jobApplicationListByEmployerOutputSchema,
  updateApplicationStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("jobApplicationRowOutputSchema", () => {
  const validRow = {
    applicationId: 1,
    candidateId: 42,
    candidateName: "John Doe",
    status: "pending",
    coverLetter: "I am very interested in this position.",
    createdAt: new Date("2026-06-12"),
    updatedAt: new Date("2026-06-12"),
  };

  it("accepts a valid job application row with all fields", () => {
    expect(jobApplicationRowOutputSchema.safeParse(validRow).success).toBe(
      true,
    );
  });

  it("accepts null candidateName", () => {
    expect(
      jobApplicationRowOutputSchema.safeParse({
        ...validRow,
        candidateName: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null coverLetter", () => {
    expect(
      jobApplicationRowOutputSchema.safeParse({
        ...validRow,
        coverLetter: null,
      }).success,
    ).toBe(true);
  });

  it("accepts string status (not enum)", () => {
    expect(
      jobApplicationRowOutputSchema.safeParse({
        ...validRow,
        status: "any_status_value",
      }).success,
    ).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validRow;
    expect(jobApplicationRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for applicationId", () => {
    expect(
      jobApplicationRowOutputSchema.safeParse({
        ...validRow,
        applicationId: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validRow;
    expect(jobApplicationRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for createdAt", () => {
    expect(
      jobApplicationRowOutputSchema.safeParse({
        ...validRow,
        createdAt: "2026-06-12",
      }).success,
    ).toBe(false);
  });
});

describe("jobApplicationListOutputSchema", () => {
  const validList = {
    success: true,
    applications: [
      {
        applicationId: 1,
        candidateId: 42,
        candidateName: "John Doe",
        status: "pending",
        coverLetter: null,
        createdAt: new Date("2026-06-12"),
        updatedAt: new Date("2026-06-12"),
      },
    ],
    total: 1,
  };

  it("accepts a valid list result", () => {
    expect(jobApplicationListOutputSchema.safeParse(validList).success).toBe(
      true,
    );
  });

  it("accepts empty applications array", () => {
    expect(
      jobApplicationListOutputSchema.safeParse({
        ...validList,
        applications: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing applications field", () => {
    const { applications: _, ...rest } = validList;
    expect(jobApplicationListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validList;
    expect(jobApplicationListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      jobApplicationListOutputSchema.safeParse({
        ...validList,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects success that is not true", () => {
    expect(
      jobApplicationListOutputSchema.safeParse({
        ...validList,
        success: false,
      }).success,
    ).toBe(false);
  });
});

describe("jobApplicationWithJobRowOutputSchema", () => {
  const validRow = {
    applicationId: 1,
    candidateId: 42,
    candidateName: "John Doe",
    status: "accepted",
    coverLetter: null,
    createdAt: new Date("2026-06-12"),
    updatedAt: new Date("2026-06-12"),
    jobTitle: "Software Engineer",
  };

  it("accepts a valid row with job title", () => {
    expect(
      jobApplicationWithJobRowOutputSchema.safeParse(validRow).success,
    ).toBe(true);
  });

  it("accepts null candidateName", () => {
    expect(
      jobApplicationWithJobRowOutputSchema.safeParse({
        ...validRow,
        candidateName: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing jobTitle", () => {
    const { jobTitle: _, ...rest } = validRow;
    expect(jobApplicationWithJobRowOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  it("rejects wrong type for jobTitle", () => {
    expect(
      jobApplicationWithJobRowOutputSchema.safeParse({
        ...validRow,
        jobTitle: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validRow;
    expect(jobApplicationWithJobRowOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      jobApplicationWithJobRowOutputSchema.safeParse({
        ...validRow,
        candidateId: "42",
      }).success,
    ).toBe(false);
  });
});

describe("jobApplicationListByEmployerOutputSchema", () => {
  const validList = {
    success: true,
    applications: [
      {
        applicationId: 1,
        candidateId: 42,
        candidateName: "John Doe",
        status: "pending",
        coverLetter: null,
        createdAt: new Date("2026-06-12"),
        updatedAt: new Date("2026-06-12"),
        jobTitle: "Software Engineer",
      },
    ],
    total: 1,
  };

  it("accepts a valid employer list result", () => {
    expect(
      jobApplicationListByEmployerOutputSchema.safeParse(validList).success,
    ).toBe(true);
  });

  it("accepts empty applications array", () => {
    expect(
      jobApplicationListByEmployerOutputSchema.safeParse({
        ...validList,
        applications: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing applications", () => {
    const { applications: _, ...rest } = validList;
    expect(
      jobApplicationListByEmployerOutputSchema.safeParse(rest).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      jobApplicationListByEmployerOutputSchema.safeParse({
        ...validList,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects item missing jobTitle (enforced by WithJob schema)", () => {
    const { jobTitle: _, ...rowWithoutJob } = validList.applications[0];
    expect(
      jobApplicationListByEmployerOutputSchema.safeParse({
        ...validList,
        applications: [rowWithoutJob],
      }).success,
    ).toBe(false);
  });
});

describe("updateApplicationStatusOutputSchema", () => {
  it("accepts success result", () => {
    const r = updateApplicationStatusOutputSchema.safeParse({
      success: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects success that is not true", () => {
    expect(
      updateApplicationStatusOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects missing success field", () => {
    expect(
      updateApplicationStatusOutputSchema.safeParse({}).success,
    ).toBe(false);
  });
});
