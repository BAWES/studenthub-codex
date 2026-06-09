import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: expense schema validation
// ---------------------------------------------------------------------------

const listExpensesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getExpenseSchema = z.object({
  expenseUuid: z.string().min(1, "Expense UUID is required"),
});

const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  detail: z.string().optional(),
  amount: z.coerce.number().positive().optional(),
  transactionDatetime: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExpenseListItem = {
  expense_uuid: string;
  title: string;
  type: string;
  detail: string | null;
  amount: number | null;
  transaction_datetime: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListExpensesResult = {
  expenses: ExpenseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
