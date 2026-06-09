import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: balance schema validation
//
// The balance actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (wallet-db, session, etc.).
// ---------------------------------------------------------------------------

const listBalancesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getBalanceSchema = z.object({
  accountUuid: z.string().min(1, "Account UUID is required"),
});

describe("listBalancesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listBalancesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination values", () => {
    const result = listBalancesSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects zero page", () => {
    const result = listBalancesSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listBalancesSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listBalancesSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listBalancesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getBalanceSchema", () => {
  it("accepts valid account UUID", () => {
    const result = getBalanceSchema.safeParse({
      accountUuid: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty account UUID", () => {
    const result = getBalanceSchema.safeParse({ accountUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing account UUID", () => {
    const result = getBalanceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
