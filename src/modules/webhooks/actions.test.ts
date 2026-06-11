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

// ---------------------------------------------------------------------------
// Output schema tests (from ./schemas.ts)
// ---------------------------------------------------------------------------

import {
  webhookListItemSchema,
  listWebhooksResultSchema,
  type WebhookListItem,
  type ListWebhooksResult,
} from "./schemas";

describe("webhookListItemSchema (output)", () => {
  it("validates a complete webhook list item", () => {
    const mock: WebhookListItem = {
      webhook_id: 1,
      event: "test.event",
      endpoint: "https://example.com/hook",
      method: "POST",
      created_at: "2024-01-15T00:00:00.000Z",
      updated_at: "2024-01-15T00:00:00.000Z",
    };
    const parsed = webhookListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.webhook_id).toBe(1);
      expect(parsed.data.event).toBe("test.event");
    }
  });

  it("allows null method and dates", () => {
    const mock: WebhookListItem = {
      webhook_id: 2,
      event: "minimal.event",
      endpoint: "",
      method: null,
      created_at: null,
      updated_at: null,
    };
    const parsed = webhookListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.method).toBeNull();
    expect(parsed.data?.created_at).toBeNull();
  });

  it("rejects missing webhook_id", () => {
    const parsed = webhookListItemSchema.safeParse({
      event: "test",
      endpoint: "",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("listWebhooksResultSchema (output)", () => {
  it("validates a complete list result", () => {
    const mock: ListWebhooksResult = {
      webhooks: [
        {
          webhook_id: 1,
          event: "test.event",
          endpoint: "https://example.com/hook",
          method: "POST",
          created_at: "2024-01-15T00:00:00.000Z",
          updated_at: "2024-01-15T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const parsed = listWebhooksResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.webhooks).toHaveLength(1);
      expect(parsed.data.totalPages).toBe(1);
    }
  });

  it("validates empty webhooks list with zero totalPages", () => {
    const mock: ListWebhooksResult = {
      webhooks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = listWebhooksResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
  });

  it("rejects negative totalPages", () => {
    const parsed = listWebhooksResultSchema.safeParse({
      webhooks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(parsed.success).toBe(false);
  });
});
