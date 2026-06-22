import { describe, it, expect } from "vitest";
import {
  firingHitmapItemSchema,
  getFiringHitmapResultSchema,
  listFiringHitmapsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// firingHitmapItemSchema
// ---------------------------------------------------------------------------
describe("firingHitmapItemSchema", () => {
  const valid = {
    fh_uuid: "fh-uuid-1",
    company_id: 1,
    firing_month: 6,
    firing_year: 2026,
    total: 5,
    is_alerted: true,
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-13T12:00:00.000Z",
  };

  it("accepts a valid firing hitmap item", () => {
    expect(firingHitmapItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      firingHitmapItemSchema.safeParse({
        ...valid, total: null, is_alerted: null,
        created_at: null, updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing fh_uuid", () => {
    const { fh_uuid: _, ...rest } = valid;
    expect(firingHitmapItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(firingHitmapItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer firing_month", () => {
    expect(
      firingHitmapItemSchema.safeParse({ ...valid, firing_month: "June" }).success,
    ).toBe(false);
  });

  it("rejects non-boolean is_alerted", () => {
    expect(
      firingHitmapItemSchema.safeParse({ ...valid, is_alerted: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getFiringHitmapResultSchema
// ---------------------------------------------------------------------------
describe("getFiringHitmapResultSchema", () => {
  const valid = {
    hitmap: { fh_uuid: "fh-1", company_id: 1, firing_month: 6, firing_year: 2026,
             total: null, is_alerted: null, created_at: null, updated_at: null },
  };

  it("accepts a valid result with hitmap", () => {
    expect(getFiringHitmapResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null hitmap", () => {
    expect(getFiringHitmapResultSchema.safeParse({ hitmap: null }).success).toBe(true);
  });

  it("accepts optional error field", () => {
    expect(
      getFiringHitmapResultSchema.safeParse({ ...valid, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects missing hitmap", () => {
    expect(getFiringHitmapResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listFiringHitmapsResultSchema
// ---------------------------------------------------------------------------
describe("listFiringHitmapsResultSchema", () => {
  const valid = () => ({
    hitmaps: [{ fh_uuid: "fh-1", company_id: 1, firing_month: 6, firing_year: 2026,
                total: null, is_alerted: null, created_at: null, updated_at: null }],
    total: 1, page: 1, limit: 20, totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listFiringHitmapsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty hitmaps array", () => {
    expect(listFiringHitmapsResultSchema.safeParse({ ...valid(), hitmaps: [] }).success).toBe(true);
  });

  it("rejects missing hitmaps", () => {
    const { hitmaps: _, ...rest } = valid();
    expect(listFiringHitmapsResultSchema.safeParse(rest).success).toBe(false);
  });
});
