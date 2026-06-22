import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockFindUnique } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockFindUnique: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tag: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getTag } from "../actions";
import { getTagSchema, getTagResultSchema } from "../schemas";

describe("getTagSchema (input validation)", () => {
  it("accepts a valid numeric tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(42);
    }
  });

  it("coerces string ID to number", () => {
    const result = getTagSchema.safeParse({ tagId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(99);
    }
  });

  it("rejects missing tagId", () => {
    const result = getTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero tagId", () => {
    const result = getTagSchema.safeParse({ tagId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative tagId", () => {
    const result = getTagSchema.safeParse({ tagId: -5 });
    expect(result.success).toBe(false);
  });
});

describe("getTagResultSchema (output validation)", () => {
  it("accepts a valid tag result with tag present", () => {
    const result = {
      tag: { tag_id: 1, tag: "JavaScript", created_at: new Date("2025-01-01"), updated_at: null },
    };
    const parsed = getTagResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts tag null (not found)", () => {
    const result = { tag: null };
    const parsed = getTagResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing tag field", () => {
    expect(getTagResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid tag data", () => {
    expect(getTagResultSchema.safeParse({ tag: { tag_id: 0, tag: "" } }).success).toBe(false);
  });
});

describe("getTag action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns tag when found", async () => {
    const dbRow = { tag_id: 42, tag: "TypeScript", created_at: new Date("2025-03-01"), updated_at: new Date("2025-03-15") };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getTag({ tagId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { tag_id: 42 } });
    expect(result.tag).not.toBeNull();
    expect(result.tag!.tag_id).toBe(42);
    expect(result.tag!.tag).toBe("TypeScript");
  });

  it("returns null tag when not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getTag({ tagId: 999 });

    expect(result.tag).toBeNull();
  });

  it("throws on invalid tag ID (schema rejection)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    await expect(getTag({ tagId: 0 })).rejects.toThrow("Tag ID is required");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getTag({ tagId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
