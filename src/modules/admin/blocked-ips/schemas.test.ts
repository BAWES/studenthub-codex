import { describe, it, expect } from "vitest";
import {
  blockedIpListItemSchema,
  listBlockedIpsResultSchema,
  blockedIpUuidResultSchema,
} from "./schemas";

const validBlockedIpItem = () => ({
  ip_uuid: "uuid-1234-5678",
  ip_address: "192.168.1.1",
  note: "Suspicious activity detected",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-06-20T14:00:00Z",
});

const validBlockedIpItemNullables = () => ({
  ip_uuid: "uuid-9876-5432",
  ip_address: null,
  note: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// blockedIpListItemSchema
// ---------------------------------------------------------------------------

describe("blockedIpListItemSchema", () => {
  it("accepts a full blocked IP item with all fields", () => {
    const r = blockedIpListItemSchema.safeParse(validBlockedIpItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields all set to null", () => {
    const r = blockedIpListItemSchema.safeParse(validBlockedIpItemNullables());
    expect(r.success).toBe(true);
  });

  it("rejects missing all required fields (empty object)", () => {
    const r = blockedIpListItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for ip_uuid (number instead of string)", () => {
    const r = blockedIpListItemSchema.safeParse({
      ...validBlockedIpItem(),
      ip_uuid: 12345,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for ip_address (number instead of string)", () => {
    const r = blockedIpListItemSchema.safeParse({
      ...validBlockedIpItem(),
      ip_address: 999,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for note (boolean instead of string)", () => {
    const r = blockedIpListItemSchema.safeParse({
      ...validBlockedIpItem(),
      note: true,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for created_at (number instead of string)", () => {
    const r = blockedIpListItemSchema.safeParse({
      ...validBlockedIpItem(),
      created_at: 1234567890,
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable ip_uuid", () => {
    const r = blockedIpListItemSchema.safeParse({
      ...validBlockedIpItem(),
      ip_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty string for ip_address (nullable string)", () => {
    const r = blockedIpListItemSchema.safeParse({
      ...validBlockedIpItem(),
      ip_address: "",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listBlockedIpsResultSchema
// ---------------------------------------------------------------------------

describe("listBlockedIpsResultSchema", () => {
  it("accepts a full paginated result with blocked IP items", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [validBlockedIpItem(), validBlockedIpItemNullables()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listBlockedIpsResultSchema.safeParse({ records: [] });
    expect(r.success).toBe(false);
  });

  it("validates nested blocked IP items within paginated result", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [{ ...validBlockedIpItem(), ip_uuid: 12345 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects string for limit instead of number", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: "twenty",
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// blockedIpUuidResultSchema
// ---------------------------------------------------------------------------

describe("blockedIpUuidResultSchema", () => {
  it("accepts a valid result with ip_uuid", () => {
    const r = blockedIpUuidResultSchema.safeParse({
      ip_uuid: "new-uuid-here",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing ip_uuid", () => {
    const r = blockedIpUuidResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for ip_uuid (number instead of string)", () => {
    const r = blockedIpUuidResultSchema.safeParse({ ip_uuid: 999 });
    expect(r.success).toBe(false);
  });
});
