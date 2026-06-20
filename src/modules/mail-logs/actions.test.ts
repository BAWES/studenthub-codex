import { describe, it, expect } from "vitest";
import {
  listMailLogsSchema,
  getMailLogSchema,
  mailLogListItemSchema,
  listMailLogsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests for MailLogController server actions
//
// Tests avoid mocking "use server" dependencies (prisma, session) by
// testing Zod schemas — the pure validation layer — in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listMailLogsSchema tests (input)
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
// getMailLogSchema tests (input)
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

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("mailLogListItemSchema", () => {
  it("accepts a valid mail log list item with all fields", () => {
    const result = mailLogListItemSchema.safeParse({
      mail_uuid: "mail_abc123",
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      app: "admin",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = mailLogListItemSchema.safeParse({
      mail_uuid: "mail_def456",
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing mail_uuid", () => {
    const result = mailLogListItemSchema.safeParse({
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for mail_uuid", () => {
    const result = mailLogListItemSchema.safeParse({
      mail_uuid: 123,
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects number for created_at (must be string or null)", () => {
    const result = mailLogListItemSchema.safeParse({
      mail_uuid: "mail_xyz",
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: 12345,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listMailLogsResultSchema", () => {
  it("accepts a valid list result with records", () => {
    const result = listMailLogsResultSchema.safeParse({
      records: [
        {
          mail_uuid: "mail_001",
          from: "a@b.com",
          to: "c@d.com",
          subject: "Hello",
          app: "admin",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty records array", () => {
    const result = listMailLogsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const result = listMailLogsResultSchema.safeParse({
      records: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listMailLogsResultSchema.safeParse({
      records: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listMailLogsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = listMailLogsResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
