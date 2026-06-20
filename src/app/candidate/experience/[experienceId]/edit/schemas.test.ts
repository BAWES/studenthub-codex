import { describe, it, expect } from "vitest";
import {
  updateExperienceEntrySchema,
  experienceActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// updateExperienceEntrySchema (re-exported from ../../schemas)
// ---------------------------------------------------------------------------
describe("updateExperienceEntrySchema (re-exported)", () => {
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
// experienceActionResultOutputSchema (re-exported)
// ---------------------------------------------------------------------------
describe("experienceActionResultOutputSchema (re-exported)", () => {
  it("accepts success response", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: true, experienceId: 1 }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects success without experienceId", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error string", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });
});
