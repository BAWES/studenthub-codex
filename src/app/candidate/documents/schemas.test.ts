import { describe, it, expect } from "vitest";
import { listDocumentsSchema } from "./schemas";

// ---------------------------------------------------------------------------
// listDocumentsSchema
// ---------------------------------------------------------------------------

describe("listDocumentsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listDocumentsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listDocumentsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listDocumentsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDocumentsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page (must be positive)", () => {
    const result = listDocumentsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listDocumentsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric limit", () => {
    const result = listDocumentsSchema.safeParse({ limit: "foo" });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listDocumentsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});
