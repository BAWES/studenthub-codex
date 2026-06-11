import { describe, it, expect } from "vitest";
import {
  listExpensesSchema,
  getExpenseSchema,
  createExpenseSchema,
  expenseItemSchema,
  expenseDetailSchema,
  listExpensesResultSchema,
  type ExpenseListItem,
  type ListExpensesResult,
} from "./schemas";

describe("listExpensesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listExpensesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listExpensesSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listExpensesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listExpensesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listExpensesSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});

describe("getExpenseSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getExpenseSchema.safeParse({ expenseUuid: "exp_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getExpenseSchema.safeParse({ expenseUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("createExpenseSchema", () => {
  it("accepts valid expense data", () => {
    const result = createExpenseSchema.safeParse({
      title: "Office supplies",
      type: "operational",
      detail: "Paper and pens",
      amount: 50.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createExpenseSchema.safeParse({
      title: "",
      type: "operational",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty type", () => {
    const result = createExpenseSchema.safeParse({
      title: "Office supplies",
      type: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal required fields only", () => {
    const result = createExpenseSchema.safeParse({
      title: "Office supplies",
      type: "operational",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive amount", () => {
    const result = createExpenseSchema.safeParse({
      title: "Test",
      type: "op",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("ExpenseListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: ExpenseListItem = {
      expense_uuid: "exp_abc123",
      title: "Office supplies",
      type: "operational",
      detail: "Paper and pens",
      amount: 50.5,
      transaction_datetime: "2025-06-01T10:00:00.000Z",
      created_at: "2025-06-01T10:00:00.000Z",
      updated_at: "2025-06-01T10:00:00.000Z",
    };
    expect(mock.expense_uuid).toBe("exp_abc123");
    expect(mock.title).toBe("Office supplies");
    expect(mock.type).toBe("operational");
    expect(mock.amount).toBe(50.5);
  });
});

describe("ListExpensesResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListExpensesResult = {
      expenses: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.expenses).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: expenseItemSchema
// ---------------------------------------------------------------------------

const validExpenseItem = {
  expense_uuid: "exp_abc123",
  title: "Office supplies",
  type: "operational",
  detail: "Paper and pens",
  amount: 50.5,
  transaction_datetime: "2025-06-01T10:00:00.000Z",
  created_at: "2025-06-01T10:00:00.000Z",
  updated_at: "2025-06-01T10:00:00.000Z",
};

describe("expenseItemSchema", () => {
  it("accepts a valid expense item", () => {
    const result = expenseItemSchema.parse(validExpenseItem);
    expect(result.expense_uuid).toBe("exp_abc123");
  });

  it("accepts nullable fields as null", () => {
    const result = expenseItemSchema.parse({
      ...validExpenseItem,
      detail: null,
      amount: null,
      transaction_datetime: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.detail).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.transaction_datetime).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { title, ...rest } = validExpenseItem;
    expect(() => expenseItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for amount field", () => {
    expect(() =>
      expenseItemSchema.parse({ ...validExpenseItem, amount: "not-a-number" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: expenseDetailSchema
// ---------------------------------------------------------------------------

describe("expenseDetailSchema", () => {
  it("accepts a valid expense item", () => {
    const result = expenseDetailSchema.parse(validExpenseItem);
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = expenseDetailSchema.parse(null);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listExpensesResultSchema
// ---------------------------------------------------------------------------

describe("listExpensesResultSchema", () => {
  it("accepts a valid result with expenses", () => {
    const result = listExpensesResultSchema.parse({
      expenses: [validExpenseItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.expenses.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listExpensesResultSchema.parse({
      expenses: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.expenses.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listExpensesResultSchema.parse({
        expenses: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});
