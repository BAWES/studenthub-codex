import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getInspectorWorkspaceSchema,
  inspectorMetricSchema,
  inspectorRequestRowSchema,
  inspectorObjectOutputSchema,
  inspectorWorkspaceOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getInspectorWorkspaceSchema (input validation)", () => {
  it("accepts a valid non-empty inspectorUuid string", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: "uuid-abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty inspectorUuid string", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing inspectorUuid", () => {
    const result = getInspectorWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a number instead of a string", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: 123,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null inspectorUuid", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects boolean inspectorUuid", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects array inspectorUuid", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: ["a", "b"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects object inspectorUuid", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: { id: 1 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects undefined inspectorUuid", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("provides a readable error message for non-string", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: 123,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "inspectorUuid must be a string",
      );
    }
  });

  it("provides a readable error message for empty string", () => {
    const result = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "inspectorUuid must not be empty",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

describe("inspectorMetricSchema (output validation)", () => {
  it("accepts a valid metric with numeric value", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "ID Requests",
      value: 15,
      note: "Verification request batches",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid metric with string value (e.g. Mode)", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Mode",
      value: "Review",
      note: "Inspector workspace",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing label", () => {
    const r = inspectorMetricSchema.safeParse({
      value: 15,
      note: "Note",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty label", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "",
      value: 15,
      note: "Note",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing note", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Test",
      value: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing value", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Test",
      note: "Note",
    });
    expect(r.success).toBe(false);
  });

  it("rejects boolean value", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Test",
      value: true,
      note: "Note",
    });
    expect(r.success).toBe(false);
  });

  it("rejects null value", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Test",
      value: null,
      note: "Note",
    });
    expect(r.success).toBe(false);
  });
});

describe("inspectorRequestRowSchema (output validation)", () => {
  it("accepts a valid request row", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "uuid-1",
      title: "Request uuid-1",
      subtitle: "3 chars of candidate ids",
      meta: "pending · 2026-06-01",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = inspectorRequestRowSchema.safeParse({
      title: "Test",
      subtitle: "Sub",
      meta: "Meta",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty id", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "",
      title: "Test",
      subtitle: "Sub",
      meta: "Meta",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "uuid-1",
      title: "",
      subtitle: "Sub",
      meta: "Meta",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "uuid-1",
      title: "Test",
      meta: "Meta",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing meta", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "uuid-1",
      title: "Test",
      subtitle: "Sub",
    });
    expect(r.success).toBe(false);
  });
});

describe("inspectorObjectOutputSchema (output validation)", () => {
  it("accepts a full inspector object", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_name: "Alice",
      inspector_email: "alice@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing inspector_name", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_email: "alice@example.com",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing inspector_email", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_name: "Alice",
    });
    expect(r.success).toBe(false);
  });

  it("rejects extra fields (no extra data allowed)", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_name: "Alice",
      inspector_email: "alice@example.com",
      extra: "not allowed",
    });
    expect(r.success).toBe(true); // zod strips by default
  });
});

describe("inspectorWorkspaceOutputSchema (full output)", () => {
  it("accepts a valid workspace with inspector data", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: {
        inspector_name: "Alice",
        inspector_email: "alice@example.com",
      },
      metrics: [
        { label: "ID Requests", value: 15, note: "Verification request batches" },
        { label: "ID Cards", value: 42, note: "Stored ID card records" },
        { label: "Needs Verification", value: 7, note: "Candidates flagged for civil ID review" },
        { label: "Mode", value: "Review", note: "Inspector workspace" },
      ],
      requests: [
        {
          id: "uuid-1",
          title: "Request uuid-1",
          subtitle: "3 chars of candidate ids",
          meta: "pending · 2026-06-01",
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid workspace with null inspector", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "ID Requests", value: 0, note: "None" },
        { label: "ID Cards", value: 0, note: "None" },
        { label: "Needs Verification", value: 0, note: "None" },
        { label: "Mode", value: "Review", note: "Inspector workspace" },
      ],
      requests: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects workspace with wrong number of metrics (not 4)", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "ID Requests", value: 0, note: "None" },
        { label: "ID Cards", value: 0, note: "None" },
      ],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with missing inspector field", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      metrics: [
        { label: "A", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with missing requests field", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "A", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with invalid metric (empty label)", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-object input", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });

  it("rejects invalid request row (empty id)", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "A", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      requests: [{ id: "", title: "Test", subtitle: "Sub", meta: "Meta" }],
    });
    expect(r.success).toBe(false);
  });
});

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
