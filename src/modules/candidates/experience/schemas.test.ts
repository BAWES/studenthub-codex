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
  const validItem = () => ({
    candidate_experience_id: 1,
    candidate_id: 123,
    experience: "Full-stack developer at Acme Corp",
    employer: "Acme Corp",
    start_year: 2020,
    end_year: 2023,
    candidate_experience_created_at: new Date("2026-01-01"),
  });

  it("accepts a valid experience item", () => {
    const r = experienceListItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = experienceListItemSchema.safeParse({
      ...validItem(),
      candidate_id: null,
      employer: null,
      start_year: null,
      end_year: null,
      candidate_experience_created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_experience_id", () => {
    const { candidate_experience_id: _, ...rest } = validItem();
    expect(experienceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string experience", () => {
    expect(
      experienceListItemSchema.safeParse({ ...validItem(), experience: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExperienceResultSchema
// ---------------------------------------------------------------------------

describe("listExperienceResultSchema", () => {
  const validItem = () => ({
    candidate_experience_id: 1,
    candidate_id: null,
    experience: "Dev",
    employer: null,
    start_year: null,
    end_year: null,
    candidate_experience_created_at: null,
  });

  it("accepts a valid paginated result", () => {
    const r = listExperienceResultSchema.safeParse({
      items: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listExperienceResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    const r = listExperienceResultSchema.safeParse({
      items: [], page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteExperienceResultSchema
// ---------------------------------------------------------------------------

describe("deleteExperienceResultSchema", () => {
  it("accepts success: true", () => {
    const r = deleteExperienceResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success: false", () => {
    const r = deleteExperienceResultSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    const r = deleteExperienceResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceActionResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("experienceActionResultSchema", () => {
  it("accepts success with experienceId", () => {
    const r = experienceActionResultSchema.safeParse({ success: true, experienceId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects success without experienceId", () => {
    const r = experienceActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("accepts failure with error", () => {
    const r = experienceActionResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = experienceActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});
