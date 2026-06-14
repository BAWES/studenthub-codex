import { describe, it, expect } from "vitest";
import {
  experienceListItemSchema,
  listExperienceResultSchema,
  deleteExperienceResultSchema,
  experienceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("experienceListItemSchema", () => {
  const valid = {
    candidate_experience_id: 1,
    candidate_id: 5,
    experience: "Software Engineer at KIB",
    employer: "Kuwait International Bank",
    start_year: 2020,
    end_year: 2023,
    candidate_experience_created_at: new Date("2024-01-15"),
  };

  it("accepts a valid experience list item", () => {
    expect(experienceListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      experienceListItemSchema.safeParse({
        candidate_experience_id: 2,
        candidate_id: null,
        experience: "Intern",
        employer: null,
        start_year: null,
        end_year: null,
        candidate_experience_created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_experience_id", () => {
    const { candidate_experience_id: _, ...rest } = valid;
    expect(experienceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing experience", () => {
    const { experience: _, ...rest } = valid;
    expect(experienceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_experience_id", () => {
    expect(
      experienceListItemSchema.safeParse({ ...valid, candidate_experience_id: "not-a-number" })
        .success,
    ).toBe(false);
  });
});

describe("listExperienceResultSchema", () => {
  it("accepts valid result with empty items", () => {
    expect(
      listExperienceResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    expect(
      listExperienceResultSchema.safeParse({ total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});

describe("deleteExperienceResultSchema", () => {
  it("accepts success", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts failure", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects wrong type for success", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: "maybe" }).success).toBe(false);
  });
});

describe("experienceActionResultSchema", () => {
  it("accepts success with experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: false,
        error: "Experience entry not found.",
      }).success,
    ).toBe(true);
  });

  it("rejects success without experienceId", () => {
    expect(experienceActionResultSchema.safeParse({ success: true }).success).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(experienceActionResultSchema.safeParse({ success: false }).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      experienceActionResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});
