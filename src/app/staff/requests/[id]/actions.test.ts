import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStaffRequestDetailSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("getStaffRequestDetailSchema", () => {
  it("accepts a valid request UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({
        requestUuid: "req_abc-123-def",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getStaffRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: null }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("@/modules/workspace/request-detail-core", () => ({
  getRequestDetail: vi.fn(),
}));

const { requireRoleCapability } = await import("@/modules/auth/session");
const { getRequestDetail } = await import(
  "@/modules/workspace/request-detail-core"
);
const actions = await import("./actions");

const mockDetail = {
  request: { request_uuid: "req_test_001", title: "Test Request" },
  pipeline: [],
  applications: [],
  interviews: [],
  invitations: [],
  activities: [],
  notes: [],
  stories: [],
  skills: [],
  suggestions: [],
  matchedCandidates: [],
  totalMatched: 0,
} as unknown as Awaited<ReturnType<typeof getRequestDetail>>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireRoleCapability).mockResolvedValue({
    role: "staff" as const,
    id: "99",
    name: "Staff User",
    email: "staff@studenthub.ai",
    issuedAt: Date.now(),
  });
});

describe("getStaffRequestDetail", () => {
  it("returns request detail for valid UUID", async () => {
    vi.mocked(getRequestDetail).mockResolvedValue(mockDetail);

    const result = await actions.getStaffRequestDetail({
      requestUuid: "req_test_001",
    });

    expect(result).toEqual(mockDetail);
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "staff",
      "request.read.assigned",
    );
    expect(getRequestDetail).toHaveBeenCalledWith("req_test_001", 99);
  });

  it("throws on invalid UUID (empty string)", async () => {
    await expect(
      actions.getStaffRequestDetail({ requestUuid: "" }),
    ).rejects.toThrow();
    expect(getRequestDetail).not.toHaveBeenCalled();
  });

  it("throws on missing UUID", async () => {
    await expect(
      actions.getStaffRequestDetail({} as any),
    ).rejects.toThrow();
    expect(getRequestDetail).not.toHaveBeenCalled();
  });

  it("propagates errors from getRequestDetail", async () => {
    vi.mocked(getRequestDetail).mockRejectedValue(
      new Error("Request not found"),
    );

    await expect(
      actions.getStaffRequestDetail({ requestUuid: "req_missing" }),
    ).rejects.toThrow("Request not found");
  });
});
