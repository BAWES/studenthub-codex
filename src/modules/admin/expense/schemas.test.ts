import { describe, it, expect } from "vitest";
import {
  expenseItemSchema,
  listExpensesResultSchema,
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  getExpenseSchema,
  listExpensesSchema,
  operationResultSchema,
} from "./schemas";
import type {
  ExpenseItem,
  ListExpensesResult,
} from "./schemas";

describe("listExpensesSchema", () => {
  it("accepts empty params", () => {
    const r = listExpensesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts explicit page and limit", () => {
    const r = listExpensesSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const r = listExpensesSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("accepts type filter", () => {
    const r = listExpensesSchema.safeParse({ type: "travel" });
    expect(r.success).toBe(true);
  });

  it("accepts title search", () => {
    const r = listExpensesSchema.safeParse({ title: "office" });
    expect(r.success).toBe(true);
  });

  it("accepts date range", () => {
    const r = listExpensesSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    expect(r.success).toBe(true);
  });
});

describe("expenseItemSchema", () => {
  const validItem = {
    expense_uuid: "exp-123",
    title: "Office supplies",
    type: "operational",
    detail: null,
    amount: "500.000",
    transaction_datetime: new Date("2026-06-01"),
    created_by: null,
    updated_by: null,
    created_at: new Date("2026-06-01"),
    updated_at: null,
  };

  it("accepts a valid expense item", () => {
    expect(expenseItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      expenseItemSchema.safeParse({
        ...validItem,
        detail: null,
        amount: null,
        transaction_datetime: null,
        created_by: null,
        updated_by: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing expense_uuid", () => {
    const { expense_uuid: _, ...rest } = validItem;
    expect(expenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(expenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validItem;
    expect(expenseItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listExpensesResultSchema", () => {
  const validResult = {
    expenses: [
      {
        expense_uuid: "exp-123",
        title: "Office supplies",
        type: "operational",
        detail: null,
        amount: "500.000",
        transaction_datetime: new Date("2026-06-01"),
        created_by: null,
        updated_by: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list result", () => {
    expect(listExpensesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty expenses array", () => {
    expect(
      listExpensesResultSchema.safeParse({
        ...validResult,
        expenses: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing expenses", () => {
    const { expenses: _, ...rest } = validResult;
    expect(listExpensesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listExpensesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });
});

describe("createExpenseSchema", () => {
  it("accepts valid creation input", () => {
    const r = createExpenseSchema.safeParse({
      title: "New expense",
      type: "travel",
    });
    expect(r.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const r = createExpenseSchema.safeParse({
      title: "New expense",
      type: "travel",
      detail: "Flight tickets",
      amount: "500.000",
      transactionDatetime: "2026-06-15T10:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty title", () => {
    const r = createExpenseSchema.safeParse({ title: "", type: "travel" });
    expect(r.success).toBe(false);
  });

  it("rejects empty type", () => {
    const r = createExpenseSchema.safeParse({ title: "Test", type: "" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid amount format", () => {
    const r = createExpenseSchema.safeParse({
      title: "Test",
      type: "travel",
      amount: "invalid",
    });
    expect(r.success).toBe(false);
  });

  it("accepts negative amount", () => {
    const r = createExpenseSchema.safeParse({
      title: "Test",
      type: "travel",
      amount: "-500.000",
    });
    expect(r.success).toBe(true);
  });
});

describe("updateExpenseSchema", () => {
  it("accepts valid update input", () => {
    const r = updateExpenseSchema.safeParse({
      id: "exp-123",
      title: "Updated",
      type: "operational",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty id", () => {
    const r = updateExpenseSchema.safeParse({
      id: "",
      title: "Updated",
      type: "operational",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    const r = updateExpenseSchema.safeParse({
      id: "exp-123",
      title: "",
      type: "operational",
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteExpenseSchema", () => {
  it("accepts valid id", () => {
    const r = deleteExpenseSchema.safeParse({ id: "exp-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty id", () => {
    const r = deleteExpenseSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });
});

describe("getExpenseSchema", () => {
  it("accepts valid id", () => {
    const r = getExpenseSchema.safeParse({ id: "exp-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty id", () => {
    const r = getExpenseSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });
});

describe("operationResultSchema", () => {
  it("accepts success result", () => {
    const r = operationResultSchema.safeParse({
      operation: "success",
      message: "Done",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = operationResultSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });
});
