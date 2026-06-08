import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation tests (no DB dependency)
// ---------------------------------------------------------------------------

const listAccountsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
  status: z.number().int().optional(),
});

const getAccountSchema = z.object({
  id: z.number().int().positive(),
});

describe("listAccountsSchema", () => {
  it("accepts empty params", () => {
    const result = listAccountsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listAccountsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = listAccountsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("accepts search param", () => {
    const result = listAccountsSchema.safeParse({ search: "admin" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("admin");
    }
  });

  it("accepts status filter", () => {
    const result = listAccountsSchema.safeParse({ status: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(10);
    }
  });

  it("rejects negative page", () => {
    const result = listAccountsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listAccountsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid limit (zero)", () => {
    const result = listAccountsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listAccountsSchema.safeParse({ page: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listAccountsSchema.safeParse({ limit: 20.5 });
    expect(result.success).toBe(false);
  });
});

describe("getAccountSchema", () => {
  it("accepts positive integer id", () => {
    const result = getAccountSchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it("rejects negative id", () => {
    const result = getAccountSchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero id", () => {
    const result = getAccountSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getAccountSchema.safeParse({ id: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects string id", () => {
    const result = getAccountSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});
