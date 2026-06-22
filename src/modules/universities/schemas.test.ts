import { describe, it, expect } from "vitest";
import {
  universityItemSchema,
  listUniversitiesResultSchema,
  createUniversityResultSchema,
} from "./schemas";

describe("universityItemSchema", () => {
  const valid = { university_id: 1, university_name_en: "Kuwait University", university_name_ar: "جامعة الكويت" };
  it("accepts a valid university item", () => {
    expect(universityItemSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts all fields as nullable strings", () => {
    expect(universityItemSchema.safeParse({
      university_id: 1, university_name_en: null, university_name_ar: null,
    }).success).toBe(true);
  });
  it("rejects missing university_id", () => {
    const { university_id: _, ...rest } = valid;
    expect(universityItemSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-positive university_id", () => {
    expect(universityItemSchema.safeParse({ ...valid, university_id: 0 }).success).toBe(false);
  });
});

describe("listUniversitiesResultSchema", () => {
  const valid = () => ({
    universities: [{ university_id: 1, university_name_en: null, university_name_ar: null }],
    total: 1, page: 1, limit: 20,
  });
  it("accepts a valid result", () => {
    expect(listUniversitiesResultSchema.safeParse(valid()).success).toBe(true);
  });
  it("accepts empty array", () => {
    expect(listUniversitiesResultSchema.safeParse({ ...valid(), universities: [] }).success).toBe(true);
  });
  it("rejects missing universities", () => {
    const { universities: _, ...rest } = valid();
    expect(listUniversitiesResultSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects limit above 500", () => {
    expect(listUniversitiesResultSchema.safeParse({ ...valid(), limit: 501 }).success).toBe(false);
  });
});

describe("createUniversityResultSchema", () => {
  it("accepts success with university", () => {
    expect(createUniversityResultSchema.safeParse({
      operation: "success", message: "Created",
      university: { university_id: 1, university_name_en: "KU", university_name_ar: null },
    }).success).toBe(true);
  });
  it("accepts error without university", () => {
    expect(createUniversityResultSchema.safeParse({
      operation: "error", message: "Duplicate",
    }).success).toBe(true);
  });
  it("rejects success without university", () => {
    expect(createUniversityResultSchema.safeParse({
      operation: "success", message: "OK",
    }).success).toBe(false);
  });
  it("rejects unknown operation", () => {
    expect(createUniversityResultSchema.safeParse({
      operation: "unknown", message: "?",
    }).success).toBe(false);
  });
});
