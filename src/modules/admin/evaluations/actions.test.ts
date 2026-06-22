import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockRevalidatePath, mockFindMany, mockCount, mockFindUnique, mockCreate, mockUpdate } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
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

// ---------------------------------------------------------------------------
// listEvaluations action
// ---------------------------------------------------------------------------

describe("listEvaluations action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
        candidate_id: 1,
        dept_id: null,
        start_date: new Date("2026-01-01"),
        end_date: new Date("2026-06-30"),
        staff_id: 10,
        created_at: new Date("2026-01-01"),
        updated_at: null,
        candidate: { candidate_name: "Ahmed" },
        staff: { staff_name: "Dr. Fatima" },
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listEvaluations({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 20,
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);

    expect(result.items[0]).toEqual({
      can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: 1,
      candidate_name: "Ahmed",
      dept_id: null,
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: "2026-06-30T00:00:00.000Z",
      staff_id: 10,
      staff_name: "Dr. Fatima",
      created_at: dbRows[0].created_at,
      updated_at: null,
    });
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listEvaluations({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("computes totalPages correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(55);

    const result = await listEvaluations({ page: 1, limit: 20 });

    expect(result.totalPages).toBe(3); // ceil(55/20) = 3
  });

  it("returns empty result when no evaluations exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listEvaluations({});

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("filters by search query", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

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
  });

  it("throws when session fails (requireCapability rejects)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listEvaluations({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getEvaluation action
// ---------------------------------------------------------------------------

describe("getEvaluation action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns evaluation when found", async () => {
    const dbRow = {
      can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: 1,
      dept_id: 789,
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-06-30"),
      staff_id: 10,
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-01-15"),
      candidate: { candidate_name: "Ahmed" },
      staff: { staff_name: "Dr. Fatima" },
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getEvaluation({ canEvalUuid: "550e8400-e29b-41d4-a716-446655440000" });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000" },
      include: {
        candidate: { select: { candidate_name: true } },
        staff: { select: { staff_name: true } },
      },
    });
    expect(result.evaluation).not.toBeNull();
    expect(result.evaluation!.can_eval_uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.evaluation!.candidate_name).toBe("Ahmed");
    expect(result.evaluation!.staff_name).toBe("Dr. Fatima");
  });

  it("returns null evaluation when not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getEvaluation({ canEvalUuid: "nonexistent-uuid" });

    expect(result.evaluation).toBeNull();
  });

  it("returns null on invalid UUID (schema rejection)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await getEvaluation({ canEvalUuid: "" });

    expect(result.evaluation).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getEvaluation({ canEvalUuid: "some-uuid" })).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// createEvaluation action
// ---------------------------------------------------------------------------

describe("createEvaluation action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an evaluation successfully", async () => {
    const createdRow = {
      can_eval_uuid: "newly-created-uuid",
      candidate_id: 123,
      dept_id: null,
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-06-30"),
      staff_id: 456,
      created_at: new Date("2026-06-15"),
      updated_at: new Date("2026-06-15"),
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue(createdRow);

    const result = await createEvaluation({
      candidateId: 123,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: 456,
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_id: 123,
          staff_id: 456,
        }),
      }),
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/evaluations");
    expect(result.success).toBe(true);
    expect(result.canEvalUuid).toBe("newly-created-uuid");
  });

  it("returns error for missing required fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await createEvaluation({
      candidateId: 123,
      startDate: "",
      endDate: "2026-06-30",
      staffId: 456,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      createEvaluation({
        candidateId: 123,
        startDate: "2026-01-01",
        endDate: "2026-06-30",
        staffId: 456,
      }),
    ).rejects.toThrow("Unauthorized");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updateEvaluation action
// ---------------------------------------------------------------------------

describe("updateEvaluation action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an evaluation successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ can_eval_uuid: "existing-uuid" });
    mockUpdate.mockResolvedValue({ can_eval_uuid: "existing-uuid" });

    const result = await updateEvaluation({
      canEvalUuid: "existing-uuid",
      startDate: "2026-07-01",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { can_eval_uuid: "existing-uuid" },
      select: { can_eval_uuid: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { can_eval_uuid: "existing-uuid" },
      data: expect.objectContaining({ updated_at: expect.any(Date) }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/evaluations");
    expect(result.success).toBe(true);
  });

  it("returns error when evaluation not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await updateEvaluation({
      canEvalUuid: "nonexistent-uuid",
      candidateId: 123,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Evaluation not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for missing canEvalUuid", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateEvaluation({
      canEvalUuid: "",
      candidateId: 123,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      updateEvaluation({
        canEvalUuid: "some-uuid",
        candidateId: 123,
      }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
