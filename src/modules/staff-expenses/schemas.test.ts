import { describe, it, expect } from "vitest";
import {
  staffExpenseItemSchema,
  listExpensesResultSchema,
  expenseActionResultSchema,
} from "./schemas";

const validItem = () => ({
  staff_expense_uuid: "se-001",
  supplier: "Stationery Co",
  category: null,
  purchase_date: new Date("2026-06-01"),
  total_amount: 50.75,
  currency: null,
  vat: null,
  reimbursable: true,
  description: "Office supplies",
  file: null,
  staff_id: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// staffExpenseItemSchema
// ---------------------------------------------------------------------------

describe("staffExpenseItemSchema", () => {
  it("accepts a valid item", () => {
    const r = staffExpenseItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = staffExpenseItemSchema.safeParse({
      ...validItem(),
      supplier: null,
      category: null,
      purchase_date: null,
      total_amount: null,
      currency: null,
      vat: null,
      description: null,
      file: null,
      staff_id: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing staff_expense_uuid", () => {
    const { staff_expense_uuid: _, ...rest } = validItem();
    expect(staffExpenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing reimbursable", () => {
    const { reimbursable: _, ...rest } = validItem();
    expect(staffExpenseItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-boolean reimbursable", () => {
    expect(staffExpenseItemSchema.safeParse({ ...validItem(), reimbursable: "yes" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExpensesResultSchema
// ---------------------------------------------------------------------------

describe("listExpensesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listExpensesResultSchema.safeParse({
      expenses: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty expenses array", () => {
    expect(
      listExpensesResultSchema.safeParse({ expenses: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// expenseActionResultSchema
// ---------------------------------------------------------------------------

describe("expenseActionResultSchema", () => {
  it("accepts success operation", () => {
    expect(expenseActionResultSchema.safeParse({ operation: "success", message: "Created" }).success).toBe(true);
  });

  it("accepts error operation", () => {
    expect(expenseActionResultSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(expenseActionResultSchema.safeParse({ operation: "unknown", message: "Bad" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(expenseActionResultSchema.safeParse({ operation: "success" }).success).toBe(false);
  });
});
