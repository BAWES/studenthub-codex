import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (imported from actions.ts — inline duplicates for pure unit tests)
// ---------------------------------------------------------------------------

const listBlockedIpsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getBlockedIpSchema = z.object({
  ipUuid: z.string().min(1, "Blocked IP UUID is required"),
});

const createBlockedIpSchema = z.object({
  ip_address: z
    .string({ required_error: "IP address is required" })
    .min(1, "IP address is required")
    .max(45, "IP address must be at most 45 characters"),
  note: z
    .string()
    .max(255, "Note must be at most 255 characters")
    .optional(),
});

const updateBlockedIpSchema = z.object({
  ipUuid: z.string().min(1, "Blocked IP UUID is required"),
  ip_address: z
    .string({ required_error: "IP address is required" })
    .min(1, "IP address is required")
    .max(45),
  note: z
    .string()
    .max(255, "Note must be at most 255 characters")
    .optional(),
});

const deleteBlockedIpSchema = z.object({
  ipUuid: z.string().min(1, "Blocked IP UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BlockedIpListItem = {
  ip_uuid: string;
  ip_address: string | null;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListBlockedIpsResult = {
  records: BlockedIpListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Tests: listBlockedIpsSchema
// ---------------------------------------------------------------------------

describe("listBlockedIpsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listBlockedIpsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listBlockedIpsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listBlockedIpsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects limit under 1", () => {
    const result = listBlockedIpsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listBlockedIpsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listBlockedIpsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: getBlockedIpSchema
// ---------------------------------------------------------------------------

describe("getBlockedIpSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getBlockedIpSchema.safeParse({ ipUuid: "ip_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getBlockedIpSchema.safeParse({ ipUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getBlockedIpSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: createBlockedIpSchema
// ---------------------------------------------------------------------------

describe("createBlockedIpSchema", () => {
  it("accepts valid data with required fields only", () => {
    const result = createBlockedIpSchema.safeParse({
      ip_address: "192.168.1.1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ip_address).toBe("192.168.1.1");
      expect(result.data.note).toBeUndefined();
    }
  });

  it("accepts valid data with all fields", () => {
    const result = createBlockedIpSchema.safeParse({
      ip_address: "10.0.0.1",
      note: "Suspicious activity detected",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("Suspicious activity detected");
    }
  });

  it("rejects empty ip_address", () => {
    const result = createBlockedIpSchema.safeParse({
      ip_address: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ip_address", () => {
    const result = createBlockedIpSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects ip_address over 45 characters", () => {
    const result = createBlockedIpSchema.safeParse({
      ip_address: "a".repeat(46),
    });
    expect(result.success).toBe(false);
  });

  it("rejects note over 255 characters", () => {
    const result = createBlockedIpSchema.safeParse({
      ip_address: "192.168.1.1",
      note: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateBlockedIpSchema
// ---------------------------------------------------------------------------

describe("updateBlockedIpSchema", () => {
  it("accepts valid update data", () => {
    const result = updateBlockedIpSchema.safeParse({
      ipUuid: "ip_abc123",
      ip_address: "192.168.1.2",
      note: "Updated reason",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ipUuid).toBe("ip_abc123");
      expect(result.data.ip_address).toBe("192.168.1.2");
      expect(result.data.note).toBe("Updated reason");
    }
  });

  it("accepts update without optional note", () => {
    const result = updateBlockedIpSchema.safeParse({
      ipUuid: "ip_abc123",
      ip_address: "192.168.1.2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateBlockedIpSchema.safeParse({
      ipUuid: "",
      ip_address: "192.168.1.1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty ip_address", () => {
    const result = updateBlockedIpSchema.safeParse({
      ipUuid: "ip_abc123",
      ip_address: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ip_address", () => {
    const result = updateBlockedIpSchema.safeParse({
      ipUuid: "ip_abc123",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: deleteBlockedIpSchema
// ---------------------------------------------------------------------------

describe("deleteBlockedIpSchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteBlockedIpSchema.safeParse({ ipUuid: "ip_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteBlockedIpSchema.safeParse({ ipUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteBlockedIpSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Type shapes
// ---------------------------------------------------------------------------

describe("BlockedIpListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: BlockedIpListItem = {
      ip_uuid: "ip_abc123",
      ip_address: "192.168.1.1",
      note: "Suspicious activity",
      created_at: "2026-06-01T10:00:00.000Z",
      updated_at: "2026-06-01T10:00:00.000Z",
    };
    expect(mock.ip_uuid).toBe("ip_abc123");
    expect(mock.ip_address).toBe("192.168.1.1");
    expect(mock.note).toBe("Suspicious activity");
  });
});

describe("ListBlockedIpsResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListBlockedIpsResult = {
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.records).toHaveLength(0);
  });
});
