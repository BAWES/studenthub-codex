import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: majors schema validation
//
// listMajors in actions.ts uses this zod schema internally.
// Testing it separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

const listMajorsSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// listMajorsSchema
// ---------------------------------------------------------------------------

describe("listMajorsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listMajorsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listMajorsSchema.safeParse({ nameFilter: "Computer" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listMajorsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listMajorsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listMajorsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listMajorsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});
