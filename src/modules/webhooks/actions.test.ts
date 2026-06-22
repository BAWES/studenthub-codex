import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  webhookListItemSchema,
  listWebhooksResultSchema,
  webhookGetResultSchema,
} from "./schemas";

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
// Output schema shape validation (using schemas.ts)
// ---------------------------------------------------------------------------

describe("webhookListItemSchema", () => {
  it("accepts a valid webhook item", () => {
    const result = webhookListItemSchema.safeParse({
      webhook_id: 1,
      event: "user.created",
      endpoint: "https://example.com/hook",
      method: "POST",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const result = webhookListItemSchema.safeParse({
      webhook_id: 2,
      event: "payment.updated",
      endpoint: "https://example.com/hook2",
      method: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = webhookListItemSchema.safeParse({
      webhook_id: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const result = webhookListItemSchema.safeParse({
      webhook_id: "abc",
      event: "test",
      endpoint: "https://example.com",
      method: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listWebhooksResultSchema", () => {
  it("accepts empty webhook list", () => {
    const result = listWebhooksResultSchema.safeParse({
      webhooks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts populated webhook list", () => {
    const result = listWebhooksResultSchema.safeParse({
      webhooks: [
        {
          webhook_id: 1,
          event: "user.created",
          endpoint: "https://example.com/hook",
          method: "POST",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative totalPages", () => {
    const result = listWebhooksResultSchema.safeParse({
      webhooks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CRUD input schemas (mirrors admin/webhook schemas)
// ---------------------------------------------------------------------------

const webhookMethodEnum = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const createWebhookSchema = z.object({
  event: z.string().min(1, "Event is required").max(50),
  endpoint: z.string().min(1, "Endpoint is required").max(255),
  method: webhookMethodEnum.optional(),
});

const updateWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
  event: z.string().min(1, "Event is required").max(50),
  endpoint: z.string().min(1, "Endpoint is required").max(255),
  method: webhookMethodEnum.optional(),
});

const deleteWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
});

const webhookActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

describe("createWebhookSchema", () => {
  it("accepts valid create params with method", () => {
    const result = createWebhookSchema.safeParse({
      event: "issue.created",
      endpoint: "https://hooks.example.com/callback",
      method: "POST",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event).toBe("issue.created");
      expect(result.data.endpoint).toBe("https://hooks.example.com/callback");
      expect(result.data.method).toBe("POST");
    }
  });

  it("accepts valid create params without method", () => {
    const result = createWebhookSchema.safeParse({
      event: "issue.created",
      endpoint: "https://hooks.example.com/callback",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.method).toBeUndefined();
    }
  });

  it("rejects empty event", () => {
    const result = createWebhookSchema.safeParse({
      event: "",
      endpoint: "https://hooks.example.com/callback",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty endpoint", () => {
    const result = createWebhookSchema.safeParse({
      event: "issue.created",
      endpoint: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid method", () => {
    const result = createWebhookSchema.safeParse({
      event: "issue.created",
      endpoint: "https://hooks.example.com/callback",
      method: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateWebhookSchema", () => {
  it("accepts valid update params", () => {
    const result = updateWebhookSchema.safeParse({
      webhookId: 42,
      event: "user.created",
      endpoint: "https://hooks.example.com/user",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.webhookId).toBe(42);
    }
  });

  it("coerces string webhookId", () => {
    const result = updateWebhookSchema.safeParse({
      webhookId: "7",
      event: "test.event",
      endpoint: "https://example.com/hook",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.webhookId).toBe(7);
    }
  });

  it("rejects zero webhookId", () => {
    const result = updateWebhookSchema.safeParse({
      webhookId: 0,
      event: "test.event",
      endpoint: "https://example.com/hook",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteWebhookSchema", () => {
  it("accepts valid webhook ID", () => {
    const result = deleteWebhookSchema.safeParse({ webhookId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.webhookId).toBe(42);
    }
  });

  it("coerces string webhookId", () => {
    const result = deleteWebhookSchema.safeParse({ webhookId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.webhookId).toBe(7);
    }
  });

  it("rejects zero webhookId", () => {
    const result = deleteWebhookSchema.safeParse({ webhookId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing webhookId", () => {
    const result = deleteWebhookSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("webhookActionResponseSchema", () => {
  it("accepts success response", () => {
    const result = webhookActionResponseSchema.safeParse({
      operation: "success",
      message: "Webhook created",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error response", () => {
    const result = webhookActionResponseSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = webhookActionResponseSchema.safeParse({
      message: "Something went wrong",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = webhookActionResponseSchema.safeParse({
      operation: "success",
      message: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("webhookGetResultSchema", () => {
  it("accepts a valid webhook item", () => {
    const result = webhookGetResultSchema.safeParse({
      webhook_id: 1,
      event: "user.created",
      endpoint: "https://example.com/hook",
      method: "POST",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null result (webhook not found)", () => {
    const result = webhookGetResultSchema.safeParse(null);
    expect(result.success).toBe(true);
  });
});
