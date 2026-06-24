import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listExpensesSchema,
  expenseItemSchema,
  listExpensesResultSchema,
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  getExpenseSchema,
} from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockFindMany,
  mockCount,
  mockFindFirst,
  mockCreate,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

// ── Mock next/cache revalidatePath ───────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { listExpenses, getExpense, createExpense, updateExpense, deleteExpense } from "./actions";

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

describe("listExpensesSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listExpensesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts explicit page and limit", () => {
    const r = listExpensesSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(25);
      expect(r.data.page).toBe(2);
    }
  });

  it("rejects limit over 100", () => {
    const r = listExpensesSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExpenses action
// ---------------------------------------------------------------------------

describe("listExpenses action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        expense_uuid: "exp-001",
        title: "Office supplies",
        type: "operational",
        detail: null,
        amount: null,
        transaction_datetime: null,
        created_by: null,
        updated_by: null,
        created_at: new Date("2026-06-01"),
        updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listExpenses({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
    expect(result.expenses).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listExpenses({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty result when no expenses exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listExpenses({});

    expect(result.expenses).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listExpenses({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getExpense action
// ---------------------------------------------------------------------------

describe("getExpense action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an expense by UUID", async () => {
    const dbRow = {
      expense_uuid: "exp-001",
      title: "Office supplies",
      type: "operational",
      detail: null,
      amount: null,
      transaction_datetime: null,
      created_by: null,
      updated_by: null,
      created_at: new Date("2026-06-01"),
      updated_at: null,
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(dbRow);

    const result = await getExpense({ id: "exp-001" });
    expect(result).not.toBeNull();
    expect(result!.expense_uuid).toBe("exp-001");
  });

  it("returns null when expense not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    const result = await getExpense({ id: "nonexistent" });
    expect(result).toBeNull();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getExpense({ id: "exp-001" })).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// createExpense action
// ---------------------------------------------------------------------------

describe("createExpense action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an expense", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ expense_uuid: "new-uuid" });

    const result = await createExpense({
      title: "New expense",
      type: "travel",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "New expense",
        type: "travel",
      }),
    });
    expect(result.operation).toBe("success");
  });

  it("rejects empty title", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await createExpense({ title: "", type: "travel" });
    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      createExpense({ title: "Test", type: "travel" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updateExpense action
// ---------------------------------------------------------------------------

describe("updateExpense action", () => {
  const existingRecord = {
    expense_uuid: "exp-001",
    title: "Old title",
    type: "operational",
    detail: null,
    amount: null,
    transaction_datetime: null,
    created_by: null,
    updated_by: null,
    created_at: new Date("2026-01-01"),
    updated_at: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an expense by UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(existingRecord);
    mockUpdate.mockResolvedValue({ expense_uuid: "exp-001" });

    const result = await updateExpense({
      id: "exp-001",
      title: "Updated title",
      type: "travel",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { expense_uuid: "exp-001" },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { expense_uuid: "exp-001" },
      data: expect.objectContaining({ title: "Updated title" }),
    });
    expect(result.operation).toBe("success");
  });

  it("returns error when expense not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    const result = await updateExpense({
      id: "nonexistent",
      title: "Test",
      type: "travel",
    });
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects empty title", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateExpense({
      id: "exp-001",
      title: "",
      type: "travel",
    });
    expect(result.operation).toBe("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      updateExpense({
        id: "exp-001",
        title: "Test",
        type: "travel",
      }),
    ).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteExpense action
// ---------------------------------------------------------------------------

describe("deleteExpense action", () => {
  const existingRecord = {
    expense_uuid: "exp-001",
    title: "Test",
    type: "operational",
    detail: null,
    amount: null,
    transaction_datetime: null,
    created_by: null,
    updated_by: null,
    created_at: new Date("2026-01-01"),
    updated_at: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an expense by UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(existingRecord);
    mockDelete.mockResolvedValue({ expense_uuid: "exp-001" });

    const result = await deleteExpense({ id: "exp-001" });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { expense_uuid: "exp-001" },
    });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { expense_uuid: "exp-001" },
    });
    expect(result.operation).toBe("success");
  });

  it("returns error when expense not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    const result = await deleteExpense({ id: "nonexistent" });
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("rejects empty id", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await deleteExpense({ id: "" });
    expect(result.operation).toBe("error");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(deleteExpense({ id: "exp-001" })).rejects.toThrow("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
