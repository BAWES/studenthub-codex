import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: degree-group schema validation
//
// listDegreeGroups and getDegreeGroup in actions.ts use these zod schemas
// internally. Testing them separately avoids mocking "use server" deps.
// ---------------------------------------------------------------------------

const listDegreeGroupsSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getDegreeGroupSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

// ---------------------------------------------------------------------------
// createDegreeGroupSchema
// ---------------------------------------------------------------------------

const createDegreeGroupSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
  skipMajor: z.number().int().optional(),
});

const updateDegreeGroupSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  nameEn: z.string().min(1, "English name is required").optional(),
  nameAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
  skipMajor: z.number().int().optional(),
});

describe("createDegreeGroupSchema", () => {
  it("accepts valid create params with required fields only", () => {
    const result = createDegreeGroupSchema.safeParse({ nameEn: "Science" });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = createDegreeGroupSchema.safeParse({
      nameEn: "Science",
      nameAr: "علوم",
      sortOrder: 1,
      skipMajor: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty English name", () => {
    const result = createDegreeGroupSchema.safeParse({ nameEn: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing English name", () => {
    const result = createDegreeGroupSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer sortOrder", () => {
    const result = createDegreeGroupSchema.safeParse({
      nameEn: "Science",
      sortOrder: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateDegreeGroupSchema", () => {
  it("accepts valid update params with all fields", () => {
    const result = updateDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc",
      nameEn: "Science Updated",
      nameAr: "علوم محدثة",
      sortOrder: 2,
      skipMajor: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only uuid", () => {
    const result = updateDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts single field update", () => {
    const result = updateDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc",
      nameEn: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateDegreeGroupSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateDegreeGroupSchema.safeParse({ nameEn: "Science" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDegreeGroupsSchema
// ---------------------------------------------------------------------------

describe("listDegreeGroupsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listDegreeGroupsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listDegreeGroupsSchema.safeParse({ nameFilter: "Science" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listDegreeGroupsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listDegreeGroupsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDegreeGroupsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listDegreeGroupsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDegreeGroupSchema
// ---------------------------------------------------------------------------

describe("getDegreeGroupSchema", () => {
  it("accepts valid UUID", () => {
    const result = getDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getDegreeGroupSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getDegreeGroupSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
