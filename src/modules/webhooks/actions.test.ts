import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema validation tests for WebhookController server actions
//
// Schemas are not exported from actions.ts — these mirror the validation rules
// to test the pure validation layer in isolation.
// ---------------------------------------------------------------------------

const listWebhooksSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getWebhookSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// listWebhooksSchema tests
// ---------------------------------------------------------------------------

describe("listWebhooksSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listWebhooksSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listWebhooksSchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects zero page", () => {
    expect(listWebhooksSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listWebhooksSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listWebhooksSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(listWebhooksSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const result = listWebhooksSchema.safeParse({ page: "2", limit: "30" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(30);
    }
  });
});

// ---------------------------------------------------------------------------
// getWebhookSchema tests
// ---------------------------------------------------------------------------

describe("getWebhookSchema", () => {
  it("accepts a valid webhook ID", () => {
    const result = getWebhookSchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it("rejects zero id", () => {
    expect(getWebhookSchema.safeParse({ id: 0 }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(getWebhookSchema.safeParse({ id: -1 }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getWebhookSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string id to number", () => {
    const result = getWebhookSchema.safeParse({ id: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(7);
    }
  });
});
