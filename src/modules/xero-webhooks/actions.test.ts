import { describe, it, expect } from "vitest";
import {
  listWebhookEventsSchema,
  getWebhookEventSchema,
} from "./schemas";
import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// listWebhookEventsSchema
// ---------------------------------------------------------------------------

describe("listWebhookEventsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listWebhookEventsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom pagination", () => {
    const result = listWebhookEventsSchema.safeParse({
      page: 3,
      limit: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(10);
    }
  });

  it("coerces string numbers", () => {
    const result = listWebhookEventsSchema.safeParse({
      page: "2",
      limit: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(15);
    }
  });

  it("rejects page 0", () => {
    const result = listWebhookEventsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listWebhookEventsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit 0", () => {
    const result = listWebhookEventsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const result = listWebhookEventsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWebhookEventSchema
// ---------------------------------------------------------------------------

describe("getWebhookEventSchema", () => {
  it("accepts positive integer ID", () => {
    const result = getWebhookEventSchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it("coerces string ID to number", () => {
    const result = getWebhookEventSchema.safeParse({ id: "55" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(55);
    }
  });

  it("rejects zero ID", () => {
    const result = getWebhookEventSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const result = getWebhookEventSchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    const result = getWebhookEventSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing ID", () => {
    const result = getWebhookEventSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests (from ./schemas.ts)
// ---------------------------------------------------------------------------

import {
  xeroWebhookEventItemSchema,
  listWebhookEventsResultSchema,
  processXeroWebhookResponseSchema,
  type XeroWebhookEventItem,
  type ListWebhookEventsResult,
  type ProcessXeroWebhookResponse,
} from "./schemas";

describe("xeroWebhookEventItemSchema (output)", () => {
  it("validates a complete event", () => {
    const mock: XeroWebhookEventItem = {
      webhook_id: 1,
      event: "xero_INVOICE CREATED",
      created_at: "2026-01-01T00:00:00Z",
    };
    const parsed = xeroWebhookEventItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.webhook_id).toBe(1);
      expect(parsed.data.event).toContain("xero_");
    }
  });

  it("allows null created_at", () => {
    const mock: XeroWebhookEventItem = {
      webhook_id: 2,
      event: "xero_CONTACT UPDATED",
      created_at: null,
    };
    const parsed = xeroWebhookEventItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.created_at).toBeNull();
  });

  it("rejects missing webhook_id", () => {
    const parsed = xeroWebhookEventItemSchema.safeParse({
      event: "xero_test",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("listWebhookEventsResultSchema (output)", () => {
  it("validates a complete list result", () => {
    const mock: ListWebhookEventsResult = {
      events: [
        {
          webhook_id: 1,
          event: "xero_INVOICE CREATED",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const parsed = listWebhookEventsResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.events).toHaveLength(1);
      expect(parsed.data.totalPages).toBe(1);
    }
  });

  it("validates empty events list", () => {
    const mock: ListWebhookEventsResult = {
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = listWebhookEventsResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
  });

  it("rejects negative totalPages", () => {
    const parsed = listWebhookEventsResultSchema.safeParse({
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("processXeroWebhookResponseSchema (output)", () => {
  it("validates a success response", () => {
    const mock: ProcessXeroWebhookResponse = {
      operation: "success",
      message: "Processed 3 Xero webhook events",
      processedCount: 3,
    };
    const parsed = processXeroWebhookResponseSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.processedCount).toBeGreaterThan(0);
    }
  });

  it("validates an error response", () => {
    const mock: ProcessXeroWebhookResponse = {
      operation: "error",
      message: "Signature mismatch",
      processedCount: 0,
    };
    const parsed = processXeroWebhookResponseSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.operation).toBe("error");
  });

  it("rejects negative processedCount", () => {
    const parsed = processXeroWebhookResponseSchema.safeParse({
      operation: "success",
      message: "done",
      processedCount: -1,
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// HMAC signature verification logic (mirrors verifySignature in actions.ts)
// ---------------------------------------------------------------------------

describe("HMAC signature verification", () => {
  function verifySignature(
    body: string,
    signature: string | null,
    key: string,
  ): boolean {
    if (!signature) return false;
    const generated = crypto
      .createHmac("sha256", key)
      .update(body, "utf8")
      .digest("base64");
    try {
      return crypto.timingSafeEqual(
        Buffer.from(generated),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  }

  const testKey = "test-webhook-secret-key";

  it("verifies a valid signature", () => {
    const body = JSON.stringify({ events: [] });
    const signature = crypto
      .createHmac("sha256", testKey)
      .update(body, "utf8")
      .digest("base64");
    expect(verifySignature(body, signature, testKey)).toBe(true);
  });

  it("rejects mismatched signature", () => {
    const body = JSON.stringify({ events: [{ eventType: "test" }] });
    const wrongBody = JSON.stringify({ events: [] });
    const signature = crypto
      .createHmac("sha256", testKey)
      .update(wrongBody, "utf8")
      .digest("base64");
    expect(verifySignature(body, signature, testKey)).toBe(false);
  });

  it("rejects null signature", () => {
    const body = '{"events":[]}';
    expect(verifySignature(body, null, testKey)).toBe(false);
  });

  it("rejects empty string signature", () => {
    const body = '{"events":[]}';
    expect(verifySignature(body, "", testKey)).toBe(false);
  });

  it("rejects signature with wrong key", () => {
    const body = '{"events":[]}';
    const signature = crypto
      .createHmac("sha256", "wrong-key")
      .update(body, "utf8")
      .digest("base64");
    expect(verifySignature(body, signature, testKey)).toBe(false);
  });

  it("handles same body with different keys producing different signatures", () => {
    const body = "hello";
    const sig1 = crypto
      .createHmac("sha256", "key-a")
      .update(body, "utf8")
      .digest("base64");
    const sig2 = crypto
      .createHmac("sha256", "key-b")
      .update(body, "utf8")
      .digest("base64");
    expect(sig1).not.toBe(sig2);
  });

  it("handles empty body with valid signature", () => {
    const body = "";
    const signature = crypto
      .createHmac("sha256", testKey)
      .update(body, "utf8")
      .digest("base64");
    expect(verifySignature(body, signature, testKey)).toBe(true);
  });
});
