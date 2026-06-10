import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFindUnique = vi.fn();
const mockCount = vi.fn();
const mockFindMany = vi.fn();
const mockTransaction = vi.fn();

const mockFormatDate = vi.fn((d: Date) => d?.toISOString()?.slice(0, 10) ?? "");

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    inspector: {
      findUnique: mockFindUnique,
    },
    candidate_id_request: {
      count: mockCount,
      findMany: mockFindMany,
    },
    candidate_id_card: {
      count: mockCount,
    },
    candidate: {
      count: mockCount,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: mockFormatDate,
}));

// Import after mocks
const { requireRoleCapability } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const actions = await import("./actions");

const mockUser = {
  role: "inspector" as const,
  id: "insp-1",
  name: "Test Inspector",
  email: "inspector@studenthub.local",
  issuedAt: Date.now(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getInspectorWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns inspector workspace data with metrics and requests", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const mockInspector = {
      inspector_name: "Alice",
      inspector_email: "alice@example.com",
    };

    mockTransaction.mockResolvedValue([
      mockInspector,
      15, // idRequests count
      42, // idCards count
      7, // needsVerification count
      [
        {
          cir_uuid: "uuid-1",
          status: "pending",
          candidate_ids: JSON.stringify([1, 2, 3]),
          created_at: new Date("2026-06-01"),
        },
        {
          cir_uuid: "uuid-2",
          status: "approved",
          candidate_ids: null,
          created_at: new Date("2026-05-15"),
        },
      ],
    ]);

    const result = await actions.getInspectorWorkspace("some-uuid");

    // Verify auth was called
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "inspector",
      "id_review.read",
    );

    // Verify transaction was called with correct inspector UUID
    expect(mockTransaction).toHaveBeenCalledOnce();

    // Inspector
    expect(result.inspector).toEqual(mockInspector);

    // Metrics
    expect(result.metrics).toHaveLength(4);
    expect(result.metrics[0]).toEqual({
      label: "ID Requests",
      value: 15,
      note: "Verification request batches",
    });
    expect(result.metrics[1]).toEqual({
      label: "ID Cards",
      value: 42,
      note: "Stored ID card records",
    });
    expect(result.metrics[2]).toEqual({
      label: "Needs Verification",
      value: 7,
      note: "Candidates flagged for civil ID review",
    });
    expect(result.metrics[3]).toEqual({
      label: "Mode",
      value: "Review",
      note: "Inspector workspace",
    });

    // Requests
    expect(result.requests).toHaveLength(2);
    expect(result.requests[0].id).toBe("uuid-1");
    expect(result.requests[0].title).toContain("Request uuid-1");
    expect(result.requests[0].meta).toContain("pending");
  });

  it("returns null inspector when no inspector found", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    mockTransaction.mockResolvedValue([
      null, // inspector not found
      0, // idRequests
      0, // idCards
      0, // needsVerification
      [], // recentIdRequests
    ]);

    const result = await actions.getInspectorWorkspace("nonexistent-uuid");
    expect(result.inspector).toBeNull();
    expect(result.requests).toHaveLength(0);
    expect(result.metrics[0].value).toBe(0);
  });

  it("handles empty candidate_ids gracefully", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    mockTransaction.mockResolvedValue([
      { inspector_name: "Bob", inspector_email: "bob@test.com" },
      1,
      2,
      0,
      [
        {
          cir_uuid: "uuid-3",
          status: "pending",
          candidate_ids: "",
          created_at: new Date("2026-06-10"),
        },
      ],
    ]);

    const result = await actions.getInspectorWorkspace("uuid-3");

    expect(result.requests[0].subtitle).toBe("No candidates");
  });

  it("throws when auth fails (missing capability)", async () => {
    vi.mocked(requireRoleCapability).mockRejectedValue(
      new Error("Forbidden: missing id_review.read"),
    );

    await expect(
      actions.getInspectorWorkspace("any-uuid"),
    ).rejects.toThrow("Forbidden");

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("propagates Prisma errors", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockTransaction.mockRejectedValue(
      new Error("Can't reach database"),
    );

    await expect(
      actions.getInspectorWorkspace("uuid"),
    ).rejects.toThrow("Can't reach database");
  });
});
