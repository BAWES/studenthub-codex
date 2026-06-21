import { describe, it, expect } from "vitest";
import {
  listWebhooksSchema,
  createWebhookSchema,
  updateWebhookSchema,
  deleteWebhookSchema,
  webhookItemSchema,
  listWebhooksResultSchema,
  webhookActionResponseSchema,
} from "./schemas";
import type { WebhookItem, ListWebhooksResult } from "./schemas";

describe("listWebhooksSchema", () => {
  it("accepts empty params", () => { const r = listWebhooksSchema.safeParse({}); expect(r.success).toBe(true); if (r.success) { expect(r.data.page).toBe(1); expect(r.data.limit).toBe(50); } });
  it("accepts full filter", () => { const r = listWebhooksSchema.safeParse({ page: 2, limit: 25 }); expect(r.success).toBe(true); });
  it("rejects limit over 200", () => expect(listWebhooksSchema.safeParse({ limit: 999 }).success).toBe(false));
  it("rejects negative page", () => expect(listWebhooksSchema.safeParse({ page: -1 }).success).toBe(false));
});

describe("createWebhookSchema", () => {
  it("accepts valid input", () => { const r = createWebhookSchema.safeParse({ event: "candidate.created", endpoint: "https://example.com/hook" }); expect(r.success).toBe(true); });
  it("accepts with method", () => { const r = createWebhookSchema.safeParse({ event: "candidate.updated", endpoint: "https://example.com/hook", method: "POST" }); expect(r.success).toBe(true); });
  it("rejects empty event", () => expect(createWebhookSchema.safeParse({ event: "", endpoint: "https://example.com/hook" }).success).toBe(false));
  it("rejects missing endpoint", () => expect(createWebhookSchema.safeParse({ event: "test" }).success).toBe(false));
});

describe("updateWebhookSchema", () => {
  it("accepts valid update", () => expect(updateWebhookSchema.safeParse({ webhookId: 1, event: "updated.event", endpoint: "https://example.com/hook" }).success).toBe(true));
  it("rejects missing id", () => expect(updateWebhookSchema.safeParse({ event: "test", endpoint: "https://example.com/hook" }).success).toBe(false));
  it("rejects empty event", () => expect(updateWebhookSchema.safeParse({ webhook_id: 1, event: "", endpoint: "https://example.com/hook" }).success).toBe(false));
});

describe("deleteWebhookSchema", () => {
  it("accepts valid id", () => expect(deleteWebhookSchema.safeParse({ webhookId: 1 }).success).toBe(true));
  it("rejects missing id", () => expect(deleteWebhookSchema.safeParse({}).success).toBe(false));
});

describe("WebhookItem type", () => {
  it("has required shape", () => {
    const i: WebhookItem = { webhook_id: 1, event: "candidate.created", endpoint: "https://example.com/hook", method: "POST", created_at: new Date(), updated_at: null };
    expect(i.webhook_id).toBe(1);
  });
  it("accepts null method", () => {
    const i: WebhookItem = { webhook_id: 2, event: "test", endpoint: "https://example.com", method: null, created_at: null, updated_at: null };
    expect(i.method).toBeNull();
  });
});

describe("ListWebhooksResult", () => {
  it("has correct shape", () => {
    const r: ListWebhooksResult = { webhooks: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    expect(r.webhooks).toHaveLength(0);
    expect(r.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Output validation — webhookItemSchema
// ---------------------------------------------------------------------------

describe("webhookItemSchema (output validation)", () => {
  it("accepts a valid item", () => {
    const r = webhookItemSchema.safeParse({
      webhook_id: 1,
      event: "candidate.created",
      endpoint: "https://example.com/hook",
      method: "POST",
      created_at: new Date("2026-01-01"),
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts item with null method", () => {
    const r = webhookItemSchema.safeParse({
      webhook_id: 2,
      event: "test.event",
      endpoint: "https://example.com",
      method: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(webhookItemSchema.safeParse({ event: "test", endpoint: "https://example.com" }).success).toBe(false);
  });

  it("rejects empty event", () => {
    expect(webhookItemSchema.safeParse({ webhook_id: 1, event: "", endpoint: "https://example.com" }).success).toBe(false);
  });

  it("rejects invalid method", () => {
    expect(webhookItemSchema.safeParse({ webhook_id: 1, event: "test", endpoint: "https://example.com", method: "INVALID" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listWebhooksResultSchema
// ---------------------------------------------------------------------------

describe("listWebhooksResultSchema (output validation)", () => {
  const validResponse = {
    webhooks: [{ webhook_id: 1, event: "candidate.created", endpoint: "https://example.com/hook", method: "POST", created_at: new Date(), updated_at: null }],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid response", () => {
    const r = listWebhooksResultSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    const r = listWebhooksResultSchema.safeParse({ ...validResponse, webhooks: [], total: 0, totalPages: 0 });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(listWebhooksResultSchema.safeParse({ webhooks: [], page: 1, limit: 50, totalPages: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listWebhooksResultSchema.safeParse({ ...validResponse, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — webhookActionResponseSchema
// ---------------------------------------------------------------------------

describe("webhookActionResponseSchema (output validation)", () => {
  it("accepts success response", () => {
    const r = webhookActionResponseSchema.safeParse({ operation: "success", message: "Webhook created" });
    expect(r.success).toBe(true);
  });
  it("accepts error response", () => {
    const r = webhookActionResponseSchema.safeParse({ operation: "error", message: "Not found" });
    expect(r.success).toBe(true);
  });
  it("rejects missing operation", () => expect(webhookActionResponseSchema.safeParse({ message: "Msg" }).success).toBe(false));
  it("rejects empty operation", () => expect(webhookActionResponseSchema.safeParse({ operation: "", message: "Msg" }).success).toBe(false));
  it("rejects empty message", () => expect(webhookActionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(false));
});
