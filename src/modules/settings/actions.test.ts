import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: settings schema validation
//
// listSettings in actions.ts uses this zod schema internally.
// Testing it separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

const listSettingsSchema = z.object({
  code: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// listSettingsSchema
// ---------------------------------------------------------------------------

describe("listSettingsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts code filter", () => {
    const result = listSettingsSchema.safeParse({ code: "EventManager" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listSettingsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listSettingsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listSettingsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listSettingsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});
