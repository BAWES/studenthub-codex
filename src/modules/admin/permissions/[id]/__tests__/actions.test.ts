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
    permission_section: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getPermissionSection } from "../actions";
import {
  getPermissionSectionSchema,
  getPermissionSectionResultSchema,
} from "../schemas";

describe("getPermissionSectionSchema (input validation)", () => {
  it("accepts a valid permission section UUID", () => {
    const result = getPermissionSectionSchema.safeParse({
      permissionUuid: "per_sec_001",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.permissionUuid).toBe("per_sec_001");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      getPermissionSectionSchema.safeParse({ permissionUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing permissionUuid", () => {
    expect(getPermissionSectionSchema.safeParse({}).success).toBe(false);
  });
});

describe("getPermissionSectionResultSchema (output validation)", () => {
  it("accepts a valid permission section", () => {
    const result = {
      permission_uuid: "per_sec_001",
      section_name: "Finance Management",
      created_at: new Date("2024-01-01"),
    };
    const parsed = getPermissionSectionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts null (not found)", () => {
    const parsed = getPermissionSectionResultSchema.safeParse(null);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(
      getPermissionSectionResultSchema.safeParse({
        section_name: "Test",
        created_at: new Date(),
      }).success,
    ).toBe(false);
  });
});

describe("getPermissionSection action", () => {
  const MOCK_SECTION = {
    permission_uuid: "per_sec_001",
    section_name: "Finance Management",
    created_at: new Date("2024-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns permission section when found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(MOCK_SECTION);

    const result = await getPermissionSection({
      permissionUuid: "per_sec_001",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { permission_uuid: "per_sec_001" },
    });
    expect(result).not.toBeNull();
    expect(result!.permission_uuid).toBe("per_sec_001");
    expect(result!.section_name).toBe("Finance Management");
  });

  it("returns null when not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getPermissionSection({
      permissionUuid: "per_sec_nonexistent",
    });

    expect(result).toBeNull();
  });

  it("throws on empty UUID (schema rejection)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    await expect(
      getPermissionSection({ permissionUuid: "" }),
    ).rejects.toThrow("Permission section UUID is required");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("throws on missing permissionUuid (schema rejection)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    await expect(getPermissionSection({} as any)).rejects.toThrow();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      getPermissionSection({ permissionUuid: "per_sec_001" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("propagates Prisma exception", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    await expect(
      getPermissionSection({ permissionUuid: "per_sec_001" }),
    ).rejects.toThrow("DB error");
  });
});
