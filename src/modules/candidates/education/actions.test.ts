import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listEducationSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createEducationSchema = z.object({
  candidateId: z.number().int().positive(),
  universityId: z.number().int().positive("University is required"),
  degreeUuid: z.string().optional(),
  majorUuid: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  isCurrentlyStudying: z.boolean().optional(),
});

const updateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.number().int().positive().optional(),
  degreeUuid: z.string().optional(),
  majorUuid: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  isCurrentlyStudying: z.boolean().optional(),
});

const deleteEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EducationListItem = {
  education_uuid: string;
  candidate_id: number;
  university_id: number;
  degree_uuid: string | null;
  major_uuid: string | null;
  graduation_year: number | null;
  is_currently_studying: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListEducationResult = {
  items: EducationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("listEducationSchema", () => {
  it("accepts empty params", () => {
    const result = listEducationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts candidateId filter", () => {
    const result = listEducationSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listEducationSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listEducationSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });
});

describe("createEducationSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createEducationSchema.safeParse({
      candidateId: 42,
      universityId: 1,
      degreeUuid: "deg-uuid-1",
      majorUuid: "maj-uuid-1",
      graduationYear: 2023,
      isCurrentlyStudying: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal input (candidateId + universityId only)", () => {
    const result = createEducationSchema.safeParse({
      candidateId: 42,
      universityId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const result = createEducationSchema.safeParse({ universityId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing universityId", () => {
    const result = createEducationSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(false);
  });

  it("accepts isCurrentlyStudying true", () => {
    const result = createEducationSchema.safeParse({
      candidateId: 42,
      universityId: 1,
      isCurrentlyStudying: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateEducationSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateEducationSchema.safeParse({
      educationUuid: "edu-abc-123",
      universityId: 2,
      degreeUuid: "deg-new-uuid",
      graduationYear: 2024,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (only universityId)", () => {
    const result = updateEducationSchema.safeParse({
      educationUuid: "edu-abc-123",
      universityId: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing educationUuid", () => {
    const result = updateEducationSchema.safeParse({ universityId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    const result = updateEducationSchema.safeParse({ educationUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("deleteEducationSchema", () => {
  it("accepts valid uuid", () => {
    const result = deleteEducationSchema.safeParse({ educationUuid: "edu-abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = deleteEducationSchema.safeParse({ educationUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("EducationListItem type shape", () => {
  it("accepts a valid education object", () => {
    const mock: EducationListItem = {
      education_uuid: "edu-abc-123",
      candidate_id: 42,
      university_id: 1,
      degree_uuid: "deg-1",
      major_uuid: "maj-1",
      graduation_year: 2023,
      is_currently_studying: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(mock.education_uuid).toBe("edu-abc-123");
    expect(mock.candidate_id).toBe(42);
    expect(mock.university_id).toBe(1);
  });
});

describe("ListEducationResult type shape", () => {
  it("accepts an empty result set", () => {
    const result: ListEducationResult = {
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
