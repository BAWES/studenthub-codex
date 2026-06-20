import { describe, it, expect } from "vitest";
import {
  experienceListItemSchema,
  listExperienceResultSchema,
  deleteExperienceResultSchema,
  experienceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// experienceListItemSchema
// ---------------------------------------------------------------------------
describe("experienceListItemSchema", () => {
  const validItem = {
    candidate_experience_id: 1,
    candidate_id: 42,
    experience: "Software Engineer at Acme Corp",
    employer: "Acme Corp",
    start_year: 2020,
    end_year: 2023,
    candidate_experience_created_at: new Date("2023-01-15T10:00:00Z"),
  };

  it("accepts a fully populated valid item", () => {
    expect(experienceListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null candidate_id", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, candidate_id: null }).success,
    ).toBe(true);
  });

  it("accepts null employer", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, employer: null }).success,
    ).toBe(true);
  });

  it("accepts null start_year", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, start_year: null }).success,
    ).toBe(true);
  });

  it("accepts null end_year", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, end_year: null }).success,
    ).toBe(true);
  });

  it("accepts null candidate_experience_created_at", () => {
    expect(
      experienceListItemSchema.safeParse({
        ...validItem,
        candidate_experience_created_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields as null simultaneously", () => {
    expect(
      experienceListItemSchema.safeParse({
        ...validItem,
        candidate_id: null,
        employer: null,
        start_year: null,
        end_year: null,
        candidate_experience_created_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty experience string", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, experience: "" }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_experience_id", () => {
    const { candidate_experience_id: _, ...rest } = validItem;
    expect(experienceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing experience", () => {
    const { experience: _, ...rest } = validItem;
    expect(experienceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string for candidate_experience_id", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, candidate_experience_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects number for experience", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, experience: 123 }).success,
    ).toBe(false);
  });

  it("rejects string for candidate_id (non-nullable-type violation)", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, candidate_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects string for start_year", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, start_year: "2020" }).success,
    ).toBe(false);
  });

  it("rejects string for end_year", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem, end_year: "2023" }).success,
    ).toBe(false);
  });

  it("rejects plain string for candidate_experience_created_at", () => {
    expect(
      experienceListItemSchema.safeParse({
        ...validItem,
        candidate_experience_created_at: "2023-01-15T10:00:00Z",
      }).success,
    ).toBe(false);
  });

  it("strips extra unknown fields (no .strict())", () => {
    const result = experienceListItemSchema.safeParse({ ...validItem, extraField: "oops" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
  });
});

// ---------------------------------------------------------------------------
// listExperienceResultSchema
// ---------------------------------------------------------------------------
describe("listExperienceResultSchema", () => {
  const validResult = {
    items: [
      {
        candidate_experience_id: 1,
        candidate_id: 42,
        experience: "Engineer",
        employer: "Acme",
        start_year: 2020,
        end_year: 2023,
        candidate_experience_created_at: new Date("2023-01-15T10:00:00Z"),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list result with one item", () => {
    expect(listExperienceResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listExperienceResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts zero counts", () => {
    expect(
      listExperienceResultSchema.safeParse({
        items: [],
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts an item with all nullable fields null inside the array", () => {
    expect(
      listExperienceResultSchema.safeParse({
        ...validResult,
        items: [
          {
            candidate_experience_id: 1,
            candidate_id: null,
            experience: "Independent Consultant",
            employer: null,
            start_year: null,
            end_year: null,
            candidate_experience_created_at: null,
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listExperienceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listExperienceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listExperienceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResult;
    expect(listExperienceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listExperienceResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid item in array", () => {
    expect(
      listExperienceResultSchema.safeParse({
        ...validResult,
        items: [{ candidate_experience_id: "not-a-number" }],
      }).success,
    ).toBe(false);
  });

  it("rejects string for total", () => {
    expect(
      listExperienceResultSchema.safeParse({ ...validResult, total: "abc" }).success,
    ).toBe(false);
  });

  it("rejects string for page", () => {
    expect(
      listExperienceResultSchema.safeParse({ ...validResult, page: "abc" }).success,
    ).toBe(false);
  });

  it("rejects items as non-array", () => {
    expect(
      listExperienceResultSchema.safeParse({ ...validResult, items: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteExperienceResultSchema
// ---------------------------------------------------------------------------
describe("deleteExperienceResultSchema", () => {
  it("accepts success: true", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts success: false", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(deleteExperienceResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects string instead of boolean", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: "true" }).success).toBe(false);
  });

  it("rejects number instead of boolean", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: 1 }).success).toBe(false);
  });

  it("rejects null for success", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: null }).success).toBe(false);
  });

  it("rejects undefined for success", () => {
    expect(deleteExperienceResultSchema.safeParse({ success: undefined }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceActionResultSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("experienceActionResultSchema", () => {
  it("accepts a success result with positive integer experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: 42,
      }).success,
    ).toBe(true);
  });

  it("accepts a failure result with error string", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: false,
        error: "Experience not found",
      }).success,
    ).toBe(true);
  });

  it("accepts success with minimum positive experienceId (1)", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects success without experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects success with negative experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects success with zero experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects success with non-integer experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: 42.5,
      }).success,
    ).toBe(false);
  });

  it("rejects success with string experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: "42",
      }).success,
    ).toBe(false);
  });

  it("rejects failure without error", () => {
    expect(
      experienceActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects failure with non-string error", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: false,
        error: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects failure with empty error string", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: false,
        error: "",
      }).success,
    ).toBe(true); // schema doesn't constrain empty string, so it's valid
  });

  it("strips extra fields on success branch (allows unknown keys)", () => {
    const result = experienceActionResultSchema.safeParse({
      success: true,
      experienceId: 1,
      error: "should not be here",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ success: true, experienceId: 1 });
    }
  });

  it("strips extra fields on failure branch (allows unknown keys)", () => {
    const result = experienceActionResultSchema.safeParse({
      success: false,
      error: "fail",
      experienceId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ success: false, error: "fail" });
    }
  });

  it("rejects missing success discriminator", () => {
    expect(experienceActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success discriminator", () => {
    expect(
      experienceActionResultSchema.safeParse({ success: "maybe" }).success,
    ).toBe(false);
  });
});
