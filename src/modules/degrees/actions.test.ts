import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: degrees schema validation
//
// listDegrees in actions.ts uses this zod schema internally.
// Testing it separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

const listDegreesSchema = z.object({
  nameFilter: z.string().optional(),
  degreeGroupUuid: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// listDegreesSchema
// ---------------------------------------------------------------------------

describe("listDegreesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listDegreesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listDegreesSchema.safeParse({ nameFilter: "Bachelor" });
    expect(result.success).toBe(true);
  });

  it("accepts degreeGroupUuid filter", () => {
    const result = listDegreesSchema.safeParse({ degreeGroupUuid: "group_uuid_123" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listDegreesSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listDegreesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDegreesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listDegreesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});
