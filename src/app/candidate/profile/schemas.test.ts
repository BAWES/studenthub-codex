import { describe, it, expect } from "vitest";
import {
  profileMetricsSchema,
  getCandidateProfileDetailResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// profileMetricsSchema tests
// ---------------------------------------------------------------------------

describe("profileMetricsSchema", () => {
  const validMetrics = {
    experienceCount: 3,
    educationCount: 2,
    skillCount: 5,
    certificationCount: 1,
    languageCount: 2,
    applicationCount: 10,
  };

  it("accepts valid metrics with all fields", () => {
    expect(profileMetricsSchema.safeParse(validMetrics).success).toBe(true);
  });

  it("accepts zero counts", () => {
    expect(
      profileMetricsSchema.safeParse({
        experienceCount: 0,
        educationCount: 0,
        skillCount: 0,
        certificationCount: 0,
        languageCount: 0,
        applicationCount: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing required field", () => {
    const { experienceCount: _, ...rest } = validMetrics;
    expect(profileMetricsSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for count (string instead of number)", () => {
    expect(
      profileMetricsSchema.safeParse({
        ...validMetrics,
        experienceCount: "3",
      }).success,
    ).toBe(false);
  });

  it("rejects negative count", () => {
    expect(
      profileMetricsSchema.safeParse({
        ...validMetrics,
        skillCount: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects float (non-integer)", () => {
    expect(
      profileMetricsSchema.safeParse({
        ...validMetrics,
        applicationCount: 10.5,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateProfileDetailResultSchema tests
// ---------------------------------------------------------------------------

describe("getCandidateProfileDetailResultSchema", () => {
  const validResult = {
    detail: { name: "John", id: 123 },
    metrics: {
      experienceCount: 3,
      educationCount: 2,
      skillCount: 5,
      certificationCount: 1,
      languageCount: 2,
      applicationCount: 10,
    },
  };

  it("accepts valid result with detail object", () => {
    expect(
      getCandidateProfileDetailResultSchema.safeParse(validResult).success,
    ).toBe(true);
  });

  it("accepts detail as null", () => {
    expect(
      getCandidateProfileDetailResultSchema.safeParse({
        ...validResult,
        detail: null,
      }).success,
    ).toBe(true);
  });

  it("accepts detail as string", () => {
    expect(
      getCandidateProfileDetailResultSchema.safeParse({
        ...validResult,
        detail: "just a string",
      }).success,
    ).toBe(true);
  });

  it("accepts missing detail (z.any() accepts undefined)", () => {
    const { detail: _, ...rest } = validResult;
    expect(
      getCandidateProfileDetailResultSchema.safeParse(rest).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validResult;
    expect(
      getCandidateProfileDetailResultSchema.safeParse(rest).success,
    ).toBe(false);
  });

  it("rejects invalid metrics", () => {
    expect(
      getCandidateProfileDetailResultSchema.safeParse({
        ...validResult,
        metrics: { experienceCount: -1, educationCount: 0, skillCount: 0, certificationCount: 0, languageCount: 0, applicationCount: 0 },
      }).success,
    ).toBe(false);
  });
});
