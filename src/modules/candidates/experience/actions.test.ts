import { describe, it, expect } from "vitest";
import {
  experienceListItemSchema,
  listExperienceResultSchema,
  deleteExperienceResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure functions for testable logic (duplicated from actions.ts)
// ---------------------------------------------------------------------------

function buildExperienceFilter(candidateId?: number) {
  const where: { deleted: number; candidate_id?: number } = { deleted: 0 };
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }
  return where;
}

function validateDateRange(startYear?: number, endYear?: number): string | null {
  if (startYear !== undefined && endYear !== undefined && endYear < startYear) {
    return "End year cannot be before start year";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("experienceListItemSchema", () => {
  it("parses a valid experience object", () => {
    const result = experienceListItemSchema.safeParse({
      candidate_experience_id: 1,
      candidate_id: 42,
      experience: "Software Engineer",
      employer: "Acme Corp",
      start_year: 2020,
      end_year: 2023,
      candidate_experience_created_at: new Date(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidate_experience_id).toBe(1);
    }
  });

  it("accepts nullable fields", () => {
    const result = experienceListItemSchema.safeParse({
      candidate_experience_id: 1,
      candidate_id: null,
      experience: "Engineer",
      employer: null,
      start_year: null,
      end_year: null,
      candidate_experience_created_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = experienceListItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const result = experienceListItemSchema.safeParse({
      candidate_experience_id: "abc",
      candidate_id: 42,
      experience: "Engineer",
      employer: null,
      start_year: null,
      end_year: null,
      candidate_experience_created_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listExperienceResultSchema", () => {
  it("parses a valid result with items", () => {
    const result = listExperienceResultSchema.safeParse({
      items: [
        {
          candidate_experience_id: 1,
          candidate_id: 42,
          experience: "Software Engineer",
          employer: "Acme Corp",
          start_year: 2020,
          end_year: 2023,
          candidate_experience_created_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.total).toBe(1);
    }
  });

  it("handles empty result set", () => {
    const result = listExperienceResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
    expect(result.data?.total).toBe(0);
  });

  it("rejects missing total", () => {
    const result = listExperienceResultSchema.safeParse({
      items: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteExperienceResultSchema", () => {
  it("parses success result", () => {
    const result = deleteExperienceResultSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    const result = deleteExperienceResultSchema.safeParse({ success: "yes" });
    expect(result.success).toBe(false);
  });

  it("rejects missing success field", () => {
    const result = deleteExperienceResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("validateDateRange", () => {
  it("rejects endYear before startYear", () => {
    const error = validateDateRange(2023, 2020);
    expect(error).toBe("End year cannot be before start year");
  });

  it("accepts valid date range", () => {
    const error = validateDateRange(2020, 2023);
    expect(error).toBeNull();
  });

  it("accepts null start/end years", () => {
    expect(validateDateRange()).toBeNull();
    expect(validateDateRange(2020)).toBeNull();
    expect(validateDateRange(undefined, 2023)).toBeNull();
  });
});

describe("buildExperienceFilter", () => {
  it("returns deleted:0 filter with no candidateId", () => {
    const result = buildExperienceFilter();
    expect(result).toEqual({ deleted: 0 });
  });

  it("includes candidateId when provided", () => {
    const result = buildExperienceFilter(42);
    expect(result).toEqual({ deleted: 0, candidate_id: 42 });
  });
});
