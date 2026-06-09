import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema tests for MailLogController server actions
//
// Schemas are not exported from actions.ts — these mirror the validation rules
// to test the pure validation layer in isolation.
// ---------------------------------------------------------------------------

const listMailLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(255).optional(),
});

const getMailLogSchema = z.object({
  mailUuid: z.string().min(1, "Mail UUID is required"),
});

// ---------------------------------------------------------------------------
// listMailLogsSchema tests
// ---------------------------------------------------------------------------

describe("listMailLogsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listMailLogsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.search).toBeUndefined();
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listMailLogsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts search term", () => {
    const result = listMailLogsSchema.safeParse({
      search: "admin@studenthub.local",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("admin@studenthub.local");
    }
  });

  it("rejects search longer than 255 chars", () => {
    const result = listMailLogsSchema.safeParse({
      search: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("accepts search at exactly 255 chars", () => {
    const result = listMailLogsSchema.safeParse({
      search: "a".repeat(255),
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listMailLogsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listMailLogsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listMailLogsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(listMailLogsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const result = listMailLogsSchema.safeParse({ page: "3", limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });
});

// ---------------------------------------------------------------------------
// getMailLogSchema tests
// ---------------------------------------------------------------------------

describe("getMailLogSchema", () => {
  it("accepts a valid mail UUID", () => {
    const result = getMailLogSchema.safeParse({
      mailUuid: "mail_abc123def456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mailUuid).toBe("mail_abc123def456");
    }
  });

  it("rejects empty mail UUID", () => {
    expect(getMailLogSchema.safeParse({ mailUuid: "" }).success).toBe(false);
  });

  it("rejects missing mail UUID", () => {
    expect(getMailLogSchema.safeParse({}).success).toBe(false);
  });
});
