import { describe, it, expect } from "vitest";
import {
  jobApplicationRowOutputSchema,
  jobApplicationListOutputSchema,
  jobApplicationWithJobRowOutputSchema,
  jobApplicationListByEmployerOutputSchema,
  updateApplicationStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// jobApplicationRowOutputSchema
// ---------------------------------------------------------------------------

describe("jobApplicationRowOutputSchema", () => {
  const validRow = () => ({
    applicationId: 1,
    candidateId: 123,
    candidateName: "John Doe",
    status: "applied",
    coverLetter: "I am interested",
    createdAt: new Date("2026-06-15"),
    updatedAt: new Date("2026-06-20"),
  });

  it("accepts a valid application row", () => {
    const r = jobApplicationRowOutputSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = jobApplicationRowOutputSchema.safeParse({
      ...validRow(),
      candidateName: null,
      coverLetter: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validRow();
    expect(jobApplicationRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer candidateId", () => {
    expect(
      jobApplicationRowOutputSchema.safeParse({ ...validRow(), candidateId: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobApplicationListOutputSchema
// ---------------------------------------------------------------------------

describe("jobApplicationListOutputSchema", () => {
  const validRow = () => ({
    applicationId: 1, candidateId: 1, candidateName: null,
    status: "applied", coverLetter: null,
    createdAt: new Date(), updatedAt: new Date(),
  });

  it("accepts a valid list result", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [validRow()],
      total: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty applications", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: true, applications: [], total: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects success: false", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: false, applications: [], total: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobApplicationWithJobRowOutputSchema
// ---------------------------------------------------------------------------

describe("jobApplicationWithJobRowOutputSchema", () => {
  it("accepts a valid row with job title", () => {
    const r = jobApplicationWithJobRowOutputSchema.safeParse({
      applicationId: 1, candidateId: 1, candidateName: null,
      status: "applied", coverLetter: null,
      createdAt: new Date(), updatedAt: new Date(),
      jobTitle: "Software Engineer",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing jobTitle", () => {
    const r = jobApplicationWithJobRowOutputSchema.safeParse({
      applicationId: 1, candidateId: 1, candidateName: null,
      status: "applied", coverLetter: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobApplicationListByEmployerOutputSchema
// ---------------------------------------------------------------------------

describe("jobApplicationListByEmployerOutputSchema", () => {
  it("accepts a valid list result with job title", () => {
    const r = jobApplicationListByEmployerOutputSchema.safeParse({
      success: true,
      applications: [{
        applicationId: 1, candidateId: 1, candidateName: null,
        status: "applied", coverLetter: null,
        createdAt: new Date(), updatedAt: new Date(),
        jobTitle: "Engineer",
      }],
      total: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects applications without jobTitle", () => {
    const r = jobApplicationListByEmployerOutputSchema.safeParse({
      success: true,
      applications: [{
        applicationId: 1, candidateId: 1, candidateName: null,
        status: "applied", coverLetter: null,
        createdAt: new Date(), updatedAt: new Date(),
      }],
      total: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateApplicationStatusOutputSchema
// ---------------------------------------------------------------------------

describe("updateApplicationStatusOutputSchema", () => {
  it("accepts success: true", () => {
    const r = updateApplicationStatusOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects success: false", () => {
    const r = updateApplicationStatusOutputSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});
