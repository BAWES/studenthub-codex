import { describe, it, expect } from "vitest";
import {
  webhookListItemSchema,
  listWebhooksResultSchema,
  webhookGetResultSchema,
} from "./schemas";

describe("webhookListItemSchema", () => {
  const valid = {
    webhook_id: 1, event: "issue.created", endpoint: "https://hooks.example.com/callback",
    method: "POST", created_at: "2026-06-14T10:00:00.000Z",
    updated_at: "2026-06-14T10:00:00.000Z",
  };
  it("accepts a valid webhook item", () => {
    expect(webhookListItemSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts nullable fields as null", () => {
    expect(webhookListItemSchema.safeParse({
      ...valid, method: null, created_at: null, updated_at: null,
    }).success).toBe(true);
  });
  it("rejects missing webhook_id", () => {
    const { webhook_id: _, ...rest } = valid;
    expect(webhookListItemSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects missing event", () => {
    const { event: _, ...rest } = valid;
    expect(webhookListItemSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-positive webhook_id", () => {
    expect(webhookListItemSchema.safeParse({ ...valid, webhook_id: -1 }).success).toBe(false);
  });
});

describe("listWebhooksResultSchema", () => {
  const valid = () => ({
    webhooks: [{ webhook_id: 1, event: "test", endpoint: "https://ex.com",
                 method: null, created_at: null, updated_at: null }],
    total: 1, page: 1, limit: 20, totalPages: 1,
  });
  it("accepts a valid result", () => {
    expect(listWebhooksResultSchema.safeParse(valid()).success).toBe(true);
  });
  it("accepts empty array", () => {
    expect(listWebhooksResultSchema.safeParse({ ...valid(), webhooks: [] }).success).toBe(true);
  });
  it("rejects missing webhooks", () => {
    const { webhooks: _, ...rest } = valid();
    expect(listWebhooksResultSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-array webhooks", () => {
    expect(listWebhooksResultSchema.safeParse({ ...valid(), webhooks: "not-array" }).success).toBe(false);
  });
});

describe("webhookGetResultSchema", () => {
  it("accepts a valid webhook", () => {
    expect(webhookGetResultSchema.safeParse({
      webhook_id: 1, event: "test", endpoint: "https://ex.com",
      method: null, created_at: null, updated_at: null,
    }).success).toBe(true);
  });
  it("accepts null", () => {
    expect(webhookGetResultSchema.safeParse(null).success).toBe(true);
  });
});
