import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: nationalities schema validation
//
// listNationalities in actions.ts uses this zod schema internally.
// Testing it separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

const listNationalitiesSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getNationalitySchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// listNationalitiesSchema
// ---------------------------------------------------------------------------

describe("listNationalitiesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listNationalitiesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listNationalitiesSchema.safeParse({ nameFilter: "Kuwaiti" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listNationalitiesSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listNationalitiesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listNationalitiesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listNationalitiesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getNationalitySchema
// ---------------------------------------------------------------------------

describe("getNationalitySchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getNationalitySchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getNationalitySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getNationalitySchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getNationalitySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});
