import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireRoleCapability,
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
  mockUpdate,
} = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_evaluation: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

import { listEvaluations, getEvaluation, createEvaluation, updateEvaluation } from "./actions";
import type { ListEvaluationsInput } from "./schemas";

// ---------------------------------------------------------------------------
// listEvaluations
// ---------------------------------------------------------------------------
describe("listEvaluations", () => {
  const SAMPLE_ROW = {
    can_eval_uuid: "eval-uuid-1",
    candidate_id: 1,
    dept_id: 2,
    candidate: { candidate_name: "Ahmed Al-Sabah" },
    staff: { staff_name: "Dr. Fatima" },
    staff_id: 3,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-06-01"),
    created_at: new Date("2026-01-01"),
  };

  const EXPECTED_ITEM = {
    uuid: "eval-uuid-1",
    candidateId: 1,
    candidateName: "Ahmed Al-Sabah",
    deptId: 2,
    staffId: 3,
    staffName: "Dr. Fatima",
    startDate: SAMPLE_ROW.start_date,
    endDate: SAMPLE_ROW.end_date,
    createdAt: SAMPLE_ROW.created_at,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([SAMPLE_ROW]);
    mockCount.mockResolvedValue(1);
  });

  it("calls requireRoleCapability with admin, admin.read", async () => {
    await listEvaluations({});
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.read");
  });

  it("queries with default pagination when no params given", async () => {
    await listEvaluations({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { created_at: "desc" },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({ where: {} });
  });

  it("queries with custom page and limit", async () => {
    await listEvaluations({ page: 3, limit: 10 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("includes search filter when provided", async () => {
    await listEvaluations({ search: "Ahmed" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { candidate: { candidate_name: { contains: "Ahmed" } } },
            { staff: { staff_name: { contains: "Ahmed" } } },
          ],
        },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { candidate: { candidate_name: { contains: "Ahmed" } } },
            { staff: { staff_name: { contains: "Ahmed" } } },
          ],
        },
      }),
    );
  });

  it("returns mapped items", async () => {
    const result = await listEvaluations({});
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(EXPECTED_ITEM);
  });

  it("returns pagination metadata", async () => {
    mockCount.mockResolvedValue(55);
    const result = await listEvaluations({ page: 3, limit: 20 });
    expect(result.total).toBe(55);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(3);
  });

  it("handles null candidate and staff names", async () => {
    const row = { ...SAMPLE_ROW, candidate: null, staff: null };
    mockFindMany.mockResolvedValue([row]);
    const result = await listEvaluations({});
    expect(result.items[0].candidateName).toBeNull();
    expect(result.items[0].staffName).toBeNull();
  });

  it("returns default empty result on invalid input", async () => {
    const result = await listEvaluations({ page: "invalid" } as unknown as ListEvaluationsInput);
    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  });

  it("returns empty result when no rows found", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    const result = await listEvaluations({});
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("includes all relation selects in query", async () => {
    await listEvaluations({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          candidate: { select: { candidate_name: true } },
          staff: { select: { staff_name: true } },
        },
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// getEvaluation
// ---------------------------------------------------------------------------
describe("getEvaluation", () => {
  const SAMPLE_ROW = {
    can_eval_uuid: "eval-uuid-1",
    candidate_id: 1,
    dept_id: 2,
    candidate: { candidate_name: "Ahmed Al-Sabah" },
    staff: { staff_name: "Dr. Fatima" },
    staff_id: 3,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-06-01"),
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-15"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(SAMPLE_ROW);
  });

  it("calls requireRoleCapability with admin, admin.read", async () => {
    await getEvaluation({ uuid: "eval-uuid-1" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.read");
  });

  it("returns evaluation detail when found", async () => {
    const result = await getEvaluation({ uuid: "eval-uuid-1" });
    expect(result.evaluation).toEqual({
      uuid: "eval-uuid-1",
      candidateId: 1,
      candidateName: "Ahmed Al-Sabah",
      deptId: 2,
      staffId: 3,
      staffName: "Dr. Fatima",
      startDate: SAMPLE_ROW.start_date,
      endDate: SAMPLE_ROW.end_date,
      createdAt: SAMPLE_ROW.created_at,
      updatedAt: SAMPLE_ROW.updated_at,
    });
  });

  it("returns null when not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getEvaluation({ uuid: "nonexistent" });
    expect(result.evaluation).toBeNull();
  });

  it("returns null on invalid input", async () => {
    const result = await getEvaluation({ uuid: "" });
    expect(result.evaluation).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createEvaluation
// ---------------------------------------------------------------------------
describe("createEvaluation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({ can_eval_uuid: "new-eval-uuid" });
  });

  it("calls requireRoleCapability with admin, admin.mutate", async () => {
    await createEvaluation({
      candidateId: 1,
      deptId: 2,
      staffId: 3,
      startDate: "2026-01-01",
      endDate: "2026-06-01",
    });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.mutate");
  });

  it("creates evaluation and returns uuid", async () => {
    const result = await createEvaluation({
      candidateId: 1,
      deptId: 2,
      staffId: 3,
      startDate: "2026-01-01",
      endDate: "2026-06-01",
    });
    expect(result.uuid).toBe("new-eval-uuid");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_id: 1,
          dept_id: 2,
          staff_id: 3,
        }),
      }),
    );
  });

  it("returns null uuid on invalid input", async () => {
    const result = await createEvaluation({
      candidateId: 0,
      deptId: 2,
      staffId: 3,
      startDate: "2026-01-01",
      endDate: "2026-06-01",
    });
    expect(result.uuid).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateEvaluation
// ---------------------------------------------------------------------------
describe("updateEvaluation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({});
  });

  it("calls requireRoleCapability with admin, admin.mutate", async () => {
    await updateEvaluation({ uuid: "eval-uuid-1", candidateId: 5 });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.mutate");
  });

  it("updates evaluation and returns success", async () => {
    const result = await updateEvaluation({ uuid: "eval-uuid-1", candidateId: 5 });
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { can_eval_uuid: "eval-uuid-1" },
      data: { candidate_id: 5 },
    });
  });

  it("returns false on invalid input", async () => {
    const result = await updateEvaluation({ uuid: "" });
    expect(result.success).toBe(false);
  });
});
