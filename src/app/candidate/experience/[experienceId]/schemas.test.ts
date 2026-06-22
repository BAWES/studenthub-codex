import { describe, it, expect } from "vitest";
import {
  getExperienceEntrySchema,
  updateExperienceEntrySchema,
  deleteExperienceEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getExperienceEntrySchema
// ---------------------------------------------------------------------------
describe("getExperienceEntrySchema", () => {
  it("accepts valid input", () => {
    expect(getExperienceEntrySchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(getExperienceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(getExperienceEntrySchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(getExperienceEntrySchema.safeParse({ experienceId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric experienceId", () => {
    expect(getExperienceEntrySchema.safeParse({ experienceId: "abc" }).success).toBe(false);
  });

  it("accepts coerced numeric string", () => {
    expect(getExperienceEntrySchema.safeParse({ experienceId: "5" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateExperienceEntrySchema
// ---------------------------------------------------------------------------
describe("updateExperienceEntrySchema", () => {
  it("accepts valid input", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: 1,
        experience: "Senior Engineer",
        employer: "ACME Corp",
        startYear: 2020,
        endYear: 2024,
      }).success,
    ).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    expect(
      updateExperienceEntrySchema.safeParse({ experienceId: 1, experience: "Engineer" }).success,
    ).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(
      updateExperienceEntrySchema.safeParse({ experience: "Engineer" }).success,
    ).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(
      updateExperienceEntrySchema.safeParse({ experienceId: 0, experience: "Engineer" }).success,
    ).toBe(false);
  });

  it("rejects missing experience", () => {
    expect(
      updateExperienceEntrySchema.safeParse({ experienceId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(
      updateExperienceEntrySchema.safeParse({ experienceId: 1, experience: "" }).success,
    ).toBe(false);
  });

  it("rejects experience exceeding 128 characters", () => {
    expect(
      updateExperienceEntrySchema.safeParse({ experienceId: 1, experience: "x".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects employer exceeding 255 characters", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: 1,
        experience: "Engineer",
        employer: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: 1,
        experience: "Engineer",
        startYear: 1899,
      }).success,
    ).toBe(false);
  });

  it("rejects startYear above 2100", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: 1,
        experience: "Engineer",
        startYear: 2101,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer endYear", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: 1,
        experience: "Engineer",
        endYear: 2024.5,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteExperienceEntrySchema
// ---------------------------------------------------------------------------
describe("deleteExperienceEntrySchema", () => {
  it("accepts valid input", () => {
    expect(deleteExperienceEntrySchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(deleteExperienceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(deleteExperienceEntrySchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(deleteExperienceEntrySchema.safeParse({ experienceId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric experienceId", () => {
    expect(deleteExperienceEntrySchema.safeParse({ experienceId: "abc" }).success).toBe(false);
  });
});
