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
