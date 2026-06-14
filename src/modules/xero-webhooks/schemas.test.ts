import { describe, it, expect } from "vitest";
import {
  xeroWebhookEventItemSchema,
  listWebhookEventsResultSchema,
  processXeroWebhookResponseSchema,
} from "./schemas";

const validItem = () => ({
  webhook_id: 1,
  event: "INVOICE_PAID",
  created_at: null,
});

// ---------------------------------------------------------------------------
// xeroWebhookEventItemSchema
// ---------------------------------------------------------------------------

describe("xeroWebhookEventItemSchema", () => {
  it("accepts a valid item", () => {
    const r = xeroWebhookEventItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts null created_at", () => {
    const r = xeroWebhookEventItemSchema.safeParse({ ...validItem(), created_at: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing webhook_id", () => {
    const { webhook_id: _, ...rest } = validItem();
    expect(xeroWebhookEventItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing event", () => {
    const { event: _, ...rest } = validItem();
    expect(xeroWebhookEventItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive webhook_id", () => {
    expect(xeroWebhookEventItemSchema.safeParse({ ...validItem(), webhook_id: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWebhookEventsResultSchema
// ---------------------------------------------------------------------------

describe("listWebhookEventsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listWebhookEventsResultSchema.safeParse({
      events: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty events array", () => {
    expect(
      listWebhookEventsResultSchema.safeParse({ events: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// processXeroWebhookResponseSchema
// ---------------------------------------------------------------------------

describe("processXeroWebhookResponseSchema", () => {
  it("accepts a valid response", () => {
    expect(
      processXeroWebhookResponseSchema.safeParse({
        operation: "process",
        message: "Processed 5 events",
        processedCount: 5,
      }).success,
    ).toBe(true);
  });

  it("rejects missing processedCount", () => {
    expect(
      processXeroWebhookResponseSchema.safeParse({ operation: "process", message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects negative processedCount", () => {
    expect(
      processXeroWebhookResponseSchema.safeParse({
        operation: "process",
        message: "Done",
        processedCount: -1,
      }).success,
    ).toBe(false);
  });
});
