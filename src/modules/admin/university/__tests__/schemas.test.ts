import { describe, it, expect } from "vitest";
import {
  universityListItemSchema,
  listUniversitiesResultSchema,
  universityIdResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: university schema validation
//
// All admin actions in actions.ts use these zod schemas internally.
// Testing them separately avoids mocking "use server" dependencies (prisma,
// session, next/cache).
// ---------------------------------------------------------------------------

const validUniversity = {
  university_id: 1,
  university_name_en: "Kuwait University",
  university_name_ar: "جامعة الكويت",
  university_data_source: 1,
  candidate_count: 0,
  university_created_at: "2024-01-01T00:00:00.000Z",
  university_updated_at: "2024-06-15T12:30:00.000Z",
  deleted: 0,
};

describe("universityListItemSchema", () => {
  it("accepts a valid university with all fields", () => {
    const result = universityListItemSchema.safeParse(validUniversity);
    expect(result.success).toBe(true);
  });

  it("accepts a university with minimal fields (nulls for optionals)", () => {
    const minimal = {
      university_id: 2,
      university_name_en: null,
      university_name_ar: null,
      university_data_source: null,
      candidate_count: null,
      university_created_at: null,
      university_updated_at: null,
      deleted: 0,
    };
    const result = universityListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = universityListItemSchema.safeParse({
      university_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer university_id", () => {
    const result = universityListItemSchema.safeParse({
      ...validUniversity,
      university_id: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string university_name_en", () => {
    const result = universityListItemSchema.safeParse({
      ...validUniversity,
      university_name_en: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listUniversitiesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = listUniversitiesResultSchema.safeParse({
      records: [validUniversity],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = listUniversitiesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listUniversitiesResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("universityIdResultSchema", () => {
  it("accepts a valid university_id result", () => {
    const result = universityIdResultSchema.safeParse({ university_id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.university_id).toBe(42);
    }
  });

  it("rejects non-integer university_id", () => {
    const result = universityIdResultSchema.safeParse({ university_id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing university_id", () => {
    const result = universityIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
