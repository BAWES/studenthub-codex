import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockFindUnique,
} = vi.hoisted(() => ({
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
    designation: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getDesignation } from "../actions";
import type { GetDesignationInput } from "../schemas";

// ---------------------------------------------------------------------------
// getDesignation — runtime
// ---------------------------------------------------------------------------

describe("getDesignation — runtime", () => {
  const VALID_INPUT: GetDesignationInput = { designationUuid: "des-uuid-1" };

  const MOCK_ROW = {
    designation_uuid: "des-uuid-1",
    designation_name_en: "Software Engineer",
    designation_name_ar: "مهندس برمجيات",
    designation_created_at: new Date("2026-01-01"),
    designation_updated_at: new Date("2026-06-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(MOCK_ROW);
  });

  it("returns a designation when found", async () => {
    const result = await getDesignation(VALID_INPUT);
    expect(result.designation).not.toBeNull();
    expect(result.designation!.designation_name_en).toBe("Software Engineer");
    expect(result.designation!.designation_name_ar).toBe("مهندس برمجيات");
  });

  it("returns null designation when not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getDesignation(VALID_INPUT);
    expect(result.designation).toBeNull();
  });

  it("calls requireCapability with admin.read", async () => {
    await getDesignation(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries Prisma by designation_uuid", async () => {
    await getDesignation(VALID_INPUT);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { designation_uuid: "des-uuid-1" },
    });
  });

  it("throws on empty designationUuid", async () => {
    await expect(getDesignation({ designationUuid: "" })).rejects.toThrow();
  });

  it("throws on missing designationUuid", async () => {
    await expect(getDesignation({} as GetDesignationInput)).rejects.toThrow();
  });
});
