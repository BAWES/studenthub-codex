import { describe, it, expect } from "vitest";
import {
  expenseItemSchema,
  expenseDetailSchema,
  listExpensesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// expenseItemSchema
// ---------------------------------------------------------------------------
describe("expenseItemSchema", () => {
  const valid = {
    expense_uuid: "exp-uuid-1",
    title: "Office supplies",
    type: "operational",
    detail: "Printer paper and ink",
    amount: 150.50,
    transaction_datetime: "2026-06-10T10:00:00.000Z",
    created_at: "2026-06-10T10:30:00.000Z",
    updated_at: "2026-06-10T10:30:00.000Z",
  };

  it("accepts a valid expense item", () => {
    expect(expenseItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
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

  it("rejects non-number amount", () => {
    expect(
      expenseItemSchema.safeParse({ ...valid, amount: "free" }).success,
    ).toBe(false);
  });

  it("rejects non-string title", () => {
    expect(
      expenseItemSchema.safeParse({ ...valid, title: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// expenseDetailSchema (nullable expenseItemSchema)
// ---------------------------------------------------------------------------
describe("expenseDetailSchema", () => {
  const valid = {
    expense_uuid: "exp-uuid-1",
    title: "Office supplies",
    type: "operational",
    detail: null,
    amount: null,
    transaction_datetime: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid expense detail", () => {
    expect(expenseDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null", () => {
    expect(expenseDetailSchema.safeParse(null).success).toBe(true);
  });

  it("rejects non-object non-null", () => {
    expect(expenseDetailSchema.safeParse("invalid").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExpensesResultSchema
// ---------------------------------------------------------------------------
describe("listExpensesResultSchema", () => {
  const valid = () => ({
    expenses: [
      {
        expense_uuid: "exp-uuid-1",
        title: "Office supplies",
        type: "operational",
        detail: null,
        amount: null,
        transaction_datetime: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listExpensesResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty expenses array", () => {
    expect(
      listExpensesResultSchema.safeParse({ ...valid(), expenses: [] }).success,
    ).toBe(true);
  });

  it("rejects missing expenses", () => {
    const { expenses: _, ...rest } = valid();
    expect(listExpensesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listExpensesResultSchema.safeParse({ ...valid(), total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(
      listExpensesResultSchema.safeParse({ ...valid(), limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-array expenses", () => {
    expect(
      listExpensesResultSchema.safeParse({ ...valid(), expenses: "not-array" }).success,
    ).toBe(false);
  });
});
