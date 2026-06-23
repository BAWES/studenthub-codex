import { describe, it, expect } from "vitest";
import {
  webhookItemSchema,
  listWebhooksResultSchema,
  createWebhookSchema,
  webhookActionResponseSchema,
} from "../schemas";

const validWebhookItem = {
  webhook_id: 1,
  event: "candidate.created",
  endpoint: "https://example.com/hook",
  method: "POST",
  created_at: new Date("2025-01-15"),
  updated_at: new Date("2025-01-15"),
};

describe("webhookItemSchema", () => {
  it("accepts a valid webhook item", () => {
    const result = webhookItemSchema.safeParse(validWebhookItem);
    expect(result.success).toBe(true);
  });

  it("accepts nullable method", () => {
    const result = webhookItemSchema.safeParse({
      ...validWebhookItem,
      method: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing webhook_id", () => {
    const { webhook_id, ...rest } = validWebhookItem;
    const result = webhookItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing required event", () => {
    const { event, ...rest } = validWebhookItem;
    const result = webhookItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-string event", () => {
    const result = webhookItemSchema.safeParse({
      ...validWebhookItem,
      event: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listWebhooksResultSchema", () => {
  it("accepts a valid list result with webhooks", () => {
    const result = listWebhooksResultSchema.safeParse({
      webhooks: [validWebhookItem],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty list result", () => {
    const result = listWebhooksResultSchema.safeParse({
      webhooks: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-object input", () => {
    const result = listWebhooksResultSchema.safeParse([]);
    expect(result.success).toBe(false);
  });
});

describe("webhookItemSchema (detail)", () => {
  it("accepts a valid webhook detail object", () => {
    const result = webhookItemSchema.safeParse({
      webhook_id: 1,
      event: "candidate.created",
      endpoint: "https://example.com/hook",
      method: "POST",
      created_at: new Date("2025-01-15"),
      updated_at: new Date("2025-01-15"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts null optional fields", () => {
    const result = webhookItemSchema.safeParse({
      webhook_id: 1,
      event: "candidate.created",
      endpoint: "https://example.com/hook",
      method: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required webhook_id", () => {
    const { webhook_id, ...rest } = {
      webhook_id: 1,
      event: "candidate.created",
      endpoint: "https://example.com/hook",
      method: "POST",
      created_at: new Date("2025-01-15"),
      updated_at: new Date("2025-01-15"),
    };
    const result = webhookItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-number webhook_id", () => {
    const result = webhookItemSchema.safeParse({
      webhook_id: "abc",
      event: "candidate.created",
      endpoint: "https://example.com/hook",
    });
    expect(result.success).toBe(false);
  });
});

describe("createWebhookSchema", () => {
  it("accepts valid create input", () => {
    const result = createWebhookSchema.safeParse({
      event: "candidate.updated",
      endpoint: "https://hooks.example.com/callback",
    });
    expect(result.success).toBe(true);
  });

  it("accepts create input with optional method", () => {
    const result = createWebhookSchema.safeParse({
      event: "candidate.updated",
      endpoint: "https://hooks.example.com/callback",
      method: "PUT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty event", () => {
    const result = createWebhookSchema.safeParse({
      event: "",
      endpoint: "https://hooks.example.com/callback",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing event", () => {
    const result = createWebhookSchema.safeParse({
      endpoint: "https://hooks.example.com/callback",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing endpoint", () => {
    const result = createWebhookSchema.safeParse({
      event: "candidate.created",
    });
    expect(result.success).toBe(false);
  });
});

describe("webhookActionResponseSchema", () => {
  it("accepts a valid success response", () => {
    const result = webhookActionResponseSchema.safeParse({
      operation: "success",
      message: "Webhook created successfully",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid error response", () => {
    const result = webhookActionResponseSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = webhookActionResponseSchema.safeParse({
      message: "Webhook created successfully",
    });
    expect(result.success).toBe(false);
  });
});
