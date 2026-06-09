import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation tests (no DB dependency)
// ---------------------------------------------------------------------------

const listAreasSchema = z.object({
  nameFilter: z.string().optional(),
  countryId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getAreaSchema = z.object({
  areaUuid: z.string().min(1),
});

describe("listAreasSchema", () => {
  it("accepts empty params", () => {
    const result = listAreasSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listAreasSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = listAreasSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("accepts name filter", () => {
    const result = listAreasSchema.safeParse({ nameFilter: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Kuwait");
    }
  });

  it("accepts country ID filter", () => {
    const result = listAreasSchema.safeParse({ countryId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.countryId).toBe(1);
    }
  });

  it("rejects negative page", () => {
    const result = listAreasSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listAreasSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listAreasSchema.safeParse({ page: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listAreasSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});

describe("getAreaSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getAreaSchema.safeParse({ areaUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areaUuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects empty string", () => {
    const result = getAreaSchema.safeParse({ areaUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-string", () => {
    const result = getAreaSchema.safeParse({ areaUuid: 123 });
    expect(result.success).toBe(false);
  });
});
