import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listExperienceSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createExperienceSchema = z.object({
  candidateId: z.number().int().positive(),
  experience: z.string().min(1, "Experience is required").max(128),
  employer: z.string().max(255).optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
});

const updateExperienceSchema = z.object({
  id: z.number().int().positive(),
  experience: z.string().min(1).max(128).optional(),
  employer: z.string().max(255).optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
});

const deleteExperienceSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExperienceListItem = {
  candidate_experience_id: number;
  candidate_id: number | null;
  experience: string;
  employer: string | null;
  start_year: number | null;
  end_year: number | null;
  candidate_experience_created_at: Date | null;
};

type ListExperienceResult = {
  items: ExperienceListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Pure functions for testable logic
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

describe("listExperienceSchema", () => {
  it("accepts empty params", () => {
    const result = listExperienceSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts candidateId filter", () => {
    const result = listExperienceSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts pagination params", () => {
    const result = listExperienceSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listExperienceSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listExperienceSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("createExperienceSchema", () => {
  it("accepts valid input", () => {
    const result = createExperienceSchema.safeParse({
      candidateId: 42,
      experience: "Software Engineer",
      employer: "Acme Corp",
      startYear: 2020,
      endYear: 2023,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty experience", () => {
    const result = createExperienceSchema.safeParse({
      candidateId: 42,
      experience: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    const result = createExperienceSchema.safeParse({
      candidateId: 42,
      experience: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal input (candidateId + experience only)", () => {
    const result = createExperienceSchema.safeParse({
      candidateId: 42,
      experience: "Software Engineer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid startYear range", () => {
    const result = createExperienceSchema.safeParse({
      candidateId: 42,
      experience: "Engineer",
      startYear: 1899,
    });
    expect(result.success).toBe(false);
  });

  it("rejects endYear before startYear via pure function", () => {
    const error = validateDateRange(2023, 2020);
    expect(error).toBe("End year cannot be before start year");
  });

  it("accepts valid date range via pure function", () => {
    const error = validateDateRange(2020, 2023);
    expect(error).toBeNull();
  });

  it("accepts null start/end years via pure function", () => {
    expect(validateDateRange()).toBeNull();
    expect(validateDateRange(2020)).toBeNull();
    expect(validateDateRange(undefined, 2023)).toBeNull();
  });
});

describe("updateExperienceSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateExperienceSchema.safeParse({
      id: 1,
      experience: "Senior Engineer",
      employer: "New Corp",
      startYear: 2021,
      endYear: 2024,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (only experience)", () => {
    const result = updateExperienceSchema.safeParse({
      id: 1,
      experience: "Updated Title",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = updateExperienceSchema.safeParse({
      experience: "Engineer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = updateExperienceSchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });
});

describe("deleteExperienceSchema", () => {
  it("accepts valid id", () => {
    const result = deleteExperienceSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = deleteExperienceSchema.safeParse({});
    expect(result.success).toBe(false);
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

describe("ExperienceListItem type shape", () => {
  it("accepts a valid experience object", () => {
    const mock: ExperienceListItem = {
      candidate_experience_id: 1,
      candidate_id: 42,
      experience: "Software Engineer",
      employer: "Acme Corp",
      start_year: 2020,
      end_year: 2023,
      candidate_experience_created_at: new Date(),
    };
    expect(mock.candidate_experience_id).toBe(1);
    expect(mock.experience).toBe("Software Engineer");
  });
});

describe("ListExperienceResult type shape", () => {
  it("accepts an empty result set", () => {
    const result: ListExperienceResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});
