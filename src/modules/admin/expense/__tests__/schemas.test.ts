import { describe, it, expect } from "vitest";
import {
  expenseItemSchema,
  listExpensesResultSchema,
  createExpenseResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// expenseItemSchema
// ---------------------------------------------------------------------------
describe("expenseItemSchema", () => {
  const valid = {
    expense_uuid: "abc-123-def-456",
    title: "Office supplies",
    type: "operational",
    detail: "Monthly office supplies purchase",
    amount: 1500.5,
    transaction_datetime: "2026-06-01T10:00:00.000Z",
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-01T10:00:00.000Z",
  };

  it("accepts a valid expense item with all fields", () => {
    expect(expenseItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable detail, amount, and datetime fields as null", () => {
    expect(
      expenseItemSchema.safeParse({
        ...valid,
        detail: null,
        amount: null,
        transaction_datetime: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing expense_uuid", () => {
    const { expense_uuid: _, ...rest } = valid;
    expect(expenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(expenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(expenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string expense_uuid", () => {
    expect(
      expenseItemSchema.safeParse({ ...valid, expense_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExpensesResultSchema
// ---------------------------------------------------------------------------
describe("listExpensesResultSchema", () => {
  const validRecord = {
    expense_uuid: "abc-123",
    title: "Server costs",
    type: "infrastructure",
    detail: null,
    amount: 500,
    transaction_datetime: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid paginated result", () => {
    const result = listExpensesResultSchema.safeParse({
      records: [validRecord],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = listExpensesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listExpensesResultSchema.safeParse({
        records: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listExpensesResultSchema.safeParse({
        records: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createExpenseResultSchema
// ---------------------------------------------------------------------------
describe("createExpenseResultSchema", () => {
  it("accepts a valid expense_uuid result", () => {
    const result = createExpenseResultSchema.safeParse({
      expense_uuid: "new-uuid-789",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expense_uuid).toBe("new-uuid-789");
    }
  });

  it("rejects non-string expense_uuid", () => {
    expect(
      createExpenseResultSchema.safeParse({ expense_uuid: 42 }).success,
    ).toBe(false);
  });

  it("rejects missing expense_uuid", () => {
    expect(createExpenseResultSchema.safeParse({}).success).toBe(false);
  });
});
