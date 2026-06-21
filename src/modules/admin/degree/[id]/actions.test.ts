import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDegreeSchema, getDegreeResultSchema } from "./schemas";

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
    degree: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getDegree } from "./actions";

describe("getDegreeSchema", () => {
  it("accepts a valid degree UUID", () => {
    const result = getDegreeSchema.safeParse({ degreeUuid: "deg-001" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degreeUuid).toBe("deg-001");
    }
  });

  it("rejects empty degree UUID", () => {
    const result = getDegreeSchema.safeParse({ degreeUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing degreeUuid", () => {
    const result = getDegreeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("getDegreeResultSchema", () => {
  it("accepts a valid degree result", () => {
    const result = getDegreeResultSchema.safeParse({
      degree: {
        degree_uuid: "deg-001",
        degree_group_uuid: null,
        degree_name_en: "Bachelor",
        degree_name_ar: null,
        degree_sort_order: 1,
        degree_created_at: new Date("2026-01-01"),
        degree_updated_at: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null degree (not found)", () => {
    const result = getDegreeResultSchema.safeParse({ degree: null });
    expect(result.success).toBe(true);
  });
});

describe("getDegree action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a degree by UUID", async () => {
    const dbRow = {
      degree_uuid: "deg-001",
      degree_group_uuid: null,
      degree_name_en: "Bachelor of Science",
      degree_name_ar: null,
      degree_sort_order: 1,
      degree_created_at: new Date("2026-01-01"),
      degree_updated_at: null,
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getDegree({ degreeUuid: "deg-001" });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-001" },
    });
    expect(result.degree).not.toBeNull();
    expect(result.degree?.degree_uuid).toBe("deg-001");
    expect(result.degree?.degree_name_en).toBe("Bachelor of Science");
  });

  it("returns null when degree not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getDegree({ degreeUuid: "nonexistent" });

    expect(result.degree).toBeNull();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      getDegree({ degreeUuid: "deg-001" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
