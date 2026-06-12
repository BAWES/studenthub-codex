import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStaffWorkspaceSchema, staffMetricSchema, staffWorkspaceListItemSchema, staffObjectOutputSchema, staffWorkspaceOutputSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getStaffWorkspaceSchema", () => {
  it("accepts a valid positive integer staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects a non-integer staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects a zero staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a missing staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a float staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 3.14 });
    expect(result.success).toBe(false);
  });

  it("rejects null staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: null });
    expect(result.success).toBe(false);
  });

  it("rejects boolean staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: true });
    expect(result.success).toBe(false);
  });

  it("rejects array staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: [1, 2] });
    expect(result.success).toBe(false);
  });

  it("rejects object staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: { id: 1 } });
    expect(result.success).toBe(false);
  });

  it("accepts a large positive integer staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 999999999 });
    expect(result.success).toBe(true);
  });

  it("rejects a string that looks like a number (no coercion)", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: "42" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty staffId object field", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: undefined });
    expect(result.success).toBe(false);
  });

  it("provides a readable error message for non-number", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("staffId must be a number");
    }
  });

  it("provides a readable error message for float", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 3.14 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("staffId must be an integer");
    }
  });

  it("provides a readable error message for negative", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("staffId must be positive");
    }
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

describe("staffMetricSchema (output validation)", () => {
  it("accepts a valid metric", () => {
    const r = staffMetricSchema.safeParse({
      label: "Candidates",
      value: 42,
      note: "Some note",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing label", () => {
    const r = staffMetricSchema.safeParse({ value: 42, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects empty label", () => {
    const r = staffMetricSchema.safeParse({ label: "", value: 42, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects negative value", () => {
    const r = staffMetricSchema.safeParse({ label: "Test", value: -1, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer value", () => {
    const r = staffMetricSchema.safeParse({ label: "Test", value: 3.14, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing note", () => {
    const r = staffMetricSchema.safeParse({ label: "Test", value: 0 });
    expect(r.success).toBe(false);
  });
});

describe("staffWorkspaceListItemSchema (output validation)", () => {
  it("accepts a valid list item with minimal fields", () => {
    const r = staffWorkspaceListItemSchema.safeParse({
      id: "req_1",
      title: "Software Engineer",
      subtitle: "Acme Corp",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a list item with all optional fields", () => {
    const r = staffWorkspaceListItemSchema.safeParse({
      id: 42,
      title: "Test",
      subtitle: "Sub",
      meta: "Meta",
      href: "/path",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = staffWorkspaceListItemSchema.safeParse({ title: "Test", subtitle: "Sub" });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    const r = staffWorkspaceListItemSchema.safeParse({ id: 1, title: "", subtitle: "Sub" });
    expect(r.success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const r = staffWorkspaceListItemSchema.safeParse({ id: 1, title: "Test" });
    expect(r.success).toBe(false);
  });
});

describe("staffObjectOutputSchema (output validation)", () => {
  it("accepts a full staff object", () => {
    const r = staffObjectOutputSchema.safeParse({
      staff_name: "Staff Member",
      staff_email: "staff@company.local",
      staff_job_title: "Talent Specialist",
      staff_salary: 1200,
      staff_salary_currency: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("accepts staff with nullable fields as null", () => {
    const r = staffObjectOutputSchema.safeParse({
      staff_name: "Member",
      staff_email: "m@c.local",
      staff_job_title: null,
      staff_salary: null,
      staff_salary_currency: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing staff_name", () => {
    const r = staffObjectOutputSchema.safeParse({
      staff_email: "m@c.local",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing staff_email", () => {
    const r = staffObjectOutputSchema.safeParse({
      staff_name: "Member",
    });
    expect(r.success).toBe(false);
  });
});

describe("staffWorkspaceOutputSchema (output validation)", () => {
  it("accepts a valid full workspace with staff data", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: {
        staff_name: "Staff Member",
        staff_email: "staff@company.local",
        staff_job_title: "Talent Specialist",
        staff_salary: 1200,
        staff_salary_currency: "KWD",
      },
      metrics: [
        { label: "Candidates", value: 5, note: "5 assigned" },
        { label: "Companies", value: 10, note: "Employer records" },
        { label: "Requests", value: 3, note: "Owned by staff" },
        { label: "Stories", value: 8, note: "Staff stories" },
      ],
      requests: [
        { id: "req_1", title: "Engineer", subtitle: "Acme" },
      ],
      stories: [
        { id: "story_1", title: "Story 1", subtitle: "Active" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid workspace with null staff", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: null,
      metrics: [
        { label: "Candidates", value: 0, note: "None" },
        { label: "Companies", value: 0, note: "None" },
        { label: "Requests", value: 0, note: "None" },
        { label: "Stories", value: 0, note: "None" },
      ],
      requests: [],
      stories: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects workspace with wrong number of metrics", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: null,
      metrics: [
        { label: "Candidates", value: 0, note: "None" },
      ],
      requests: [],
      stories: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with missing staff field", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      metrics: [
        { label: "A", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      requests: [],
      stories: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with invalid metric", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: null,
      metrics: [
        { label: "", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      requests: [],
      stories: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-object input", () => {
    const r = staffWorkspaceOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockCount = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_work_history: { findMany: mockFindMany, count: mockCount },
    staff: { findUnique: mockFindUnique },
    candidate: { count: mockCount },
    company: { count: mockCount },
    request: { count: mockCount, findMany: mockFindMany },
    story: { count: mockCount, findMany: mockFindMany },
    note: { count: mockCount },
    $transaction: mockTransaction,
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireCapability } = await import("@/modules/auth/session");
const workspace = await import("./actions");

const mockUser = {
  role: "staff" as const,
  id: "42",
  name: "Staff User",
  email: "staff@studenthub.ai",
  issuedAt: Date.now(),
};

function makeStaff(overrides: Record<string, unknown> = {}) {
  return {
    staff_name: "Staff Member",
    staff_email: "staff@company.local",
    staff_job_title: "Talent Specialist",
    staff_salary: 1200,
    staff_salary_currency: "KWD",
    ...overrides,
  };
}

describe("getStaffWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full workspace data for valid staff ID", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany
      .mockResolvedValueOnce([{ candidate_id: 1 }, { candidate_id: 2 }])
      .mockResolvedValueOnce([
        { request_uuid: "req_1", request_position_title: "Test Request", request_status: "pending", request_created_datetime: new Date(), company: { company_name: "Acme" } },
      ])
      .mockResolvedValueOnce([
        { story_uuid: "story_1", story_status: "active", story_last_updated_at: new Date(), request: { request_position_title: "Test Request" } },
      ]);
    mockFindUnique.mockResolvedValue(makeStaff());
    mockCount
      .mockResolvedValueOnce(5).mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3).mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2).mockResolvedValueOnce(4);
    mockTransaction.mockImplementation(async (fns: any[]) => Promise.all(fns));

    const result = await workspace.getStaffWorkspace(42);

    expect(requireCapability).toHaveBeenCalledWith("request.read.assigned");
    expect(result.staff).toBeDefined();
    expect(result.staff?.staff_name).toBe("Staff Member");
    expect(result.metrics).toHaveLength(4);
    expect(result.metrics[0].label).toBe("Candidates");
    expect(result.requests).toHaveLength(1);
    expect(result.stories).toHaveLength(1);
  });

  it("returns null staff when not found", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    mockFindUnique.mockResolvedValue(null);
    mockCount.mockResolvedValue(0);
    mockTransaction.mockImplementation(async (fns: any[]) => Promise.all(fns));

    const result = await workspace.getStaffWorkspace(999);

    expect(result.staff).toBeNull();
    expect(result.metrics).toHaveLength(4);
    expect(result.metrics.every((m: any) => m.value === 0)).toBe(true);
    expect(result.requests).toEqual([]);
    expect(result.stories).toEqual([]);
  });

  it("throws on invalid staff ID", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    await expect(workspace.getStaffWorkspace(-1)).rejects.toThrow();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("requires request.read.assigned capability", async () => {
    vi.mocked(requireCapability).mockRejectedValue(new Error("Unauthorized"));
    await expect(workspace.getStaffWorkspace(42)).rejects.toThrow("Unauthorized");
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
