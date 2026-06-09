import { describe, it, expect } from "vitest";
import {
  listFiringHitmapsSchema,
  getFiringHitmapSchema,
} from "./actions";

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
