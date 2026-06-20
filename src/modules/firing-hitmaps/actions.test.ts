import { describe, it, expect } from "vitest";
import {
  listFiringHitmapsSchema,
  getFiringHitmapSchema,
  firingHitmapItemSchema,
  getFiringHitmapResultSchema,
  listFiringHitmapsResultSchema,
  type FiringHitmapItem,
  type ListFiringHitmapsResult,
  type GetFiringHitmapResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for firing hitmap server actions
// ---------------------------------------------------------------------------

describe("listFiringHitmapsSchema", () => {
  it("accepts empty params", () => {
    const result = listFiringHitmapsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts company ID filter", () => {
    const result = listFiringHitmapsSchema.safeParse({ companyId: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts year filter", () => {
    const result = listFiringHitmapsSchema.safeParse({ year: 2026 });
    expect(result.success).toBe(true);
  });

  it("accepts month filter", () => {
    const result = listFiringHitmapsSchema.safeParse({ month: 6 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid month (0)", () => {
    const result = listFiringHitmapsSchema.safeParse({ month: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid month (13)", () => {
    const result = listFiringHitmapsSchema.safeParse({ month: 13 });
    expect(result.success).toBe(false);
  });

  it("accepts pagination params", () => {
    const result = listFiringHitmapsSchema.safeParse({ page: 1, limit: 50 });
    expect(result.success).toBe(true);
  });

  it("accepts all params together", () => {
    const result = listFiringHitmapsSchema.safeParse({
      companyId: 1,
      year: 2026,
      month: 6,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative page", () => {
    const result = listFiringHitmapsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listFiringHitmapsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("getFiringHitmapSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getFiringHitmapSchema.safeParse({ uuid: "fh_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getFiringHitmapSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getFiringHitmapSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: firingHitmapItemSchema
// ---------------------------------------------------------------------------

const validFiringHitmapItem = {
  fh_uuid: "fh_abc123",
  company_id: 1,
  firing_month: 6,
  firing_year: 2026,
  total: 150,
  is_alerted: false,
  created_at: "2026-06-11T00:00:00.000Z",
  updated_at: null,
};

describe("firingHitmapItemSchema", () => {
  it("accepts a valid firing hitmap item", () => {
    const result = firingHitmapItemSchema.parse(validFiringHitmapItem);
    expect(result.fh_uuid).toBe("fh_abc123");
  });

  it("accepts nullable fields as null", () => {
    const result = firingHitmapItemSchema.parse({
      ...validFiringHitmapItem,
      total: null,
      is_alerted: null,
    });
    expect(result.total).toBeNull();
    expect(result.is_alerted).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { fh_uuid, ...rest } = validFiringHitmapItem;
    expect(() => firingHitmapItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for numeric field", () => {
    expect(() =>
      firingHitmapItemSchema.parse({ ...validFiringHitmapItem, company_id: "not-a-number" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: getFiringHitmapResultSchema
// ---------------------------------------------------------------------------

describe("getFiringHitmapResultSchema", () => {
  it("accepts a valid result with hitmap", () => {
    const result = getFiringHitmapResultSchema.parse({
      hitmap: validFiringHitmapItem,
    });
    expect(result.hitmap).not.toBeNull();
  });

  it("accepts null hitmap with error", () => {
    const result = getFiringHitmapResultSchema.parse({
      hitmap: null,
      error: "Firing hitmap not found",
    });
    expect(result.hitmap).toBeNull();
    expect(result.error).toBe("Firing hitmap not found");
  });

  it("accepts null hitmap without error", () => {
    const result = getFiringHitmapResultSchema.parse({
      hitmap: null,
    });
    expect(result.hitmap).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listFiringHitmapsResultSchema
// ---------------------------------------------------------------------------

describe("listFiringHitmapsResultSchema", () => {
  it("accepts a valid result with hitmaps", () => {
    const result = listFiringHitmapsResultSchema.parse({
      hitmaps: [validFiringHitmapItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.hitmaps.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listFiringHitmapsResultSchema.parse({
      hitmaps: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.hitmaps.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listFiringHitmapsResultSchema.parse({
        hitmaps: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});
