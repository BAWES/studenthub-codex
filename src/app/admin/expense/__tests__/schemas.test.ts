import { describe, it, expect } from "vitest";
import {
  expenseListItemSchema,
  expenseDetailSchema,
  expenseDetailResultSchema,
} from "../schemas";

const validExpenseRow = {
  expense_uuid: "abc-123-def-456",
  title: "Office supplies",
  type: "operational",
  detail: "Paper and printer toner",
  amount: 125.5,
  transaction_datetime: new Date("2026-06-01T10:00:00Z"),
  created_at: new Date("2026-06-01T10:00:00Z"),
  updated_at: new Date("2026-06-01T12:30:00Z"),
};

describe("expenseListItemSchema", () => {
  it("accepts a valid expense row with all fields", () => {
    const result = expenseListItemSchema.safeParse(validExpenseRow);
    expect(result.success).toBe(true);
  });

  it("accepts an expense with nullable fields", () => {
    const minimal = {
      expense_uuid: "abc-123",
      title: "Test expense",
      type: "other",
      detail: null,
      amount: null,
      transaction_datetime: null,
      created_at: null,
      updated_at: null,
    };
    const result = expenseListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing expense_uuid", () => {
    const result = expenseListItemSchema.safeParse({
      ...validExpenseRow,
      expense_uuid: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string title", () => {
    const result = expenseListItemSchema.safeParse({
      ...validExpenseRow,
      title: 123,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    const result = expenseListItemSchema.safeParse({
      ...validExpenseRow,
      amount: "not-a-number",
    });
    expect(result.success).toBe(false);
  });
});

describe("expenseDetailSchema", () => {
  it("accepts a valid expense detail object", () => {
    const result = expenseDetailSchema.safeParse({
      ...validExpenseRow,
      created_by: 1,
      updated_by: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-integer created_by", () => {
    const result = expenseDetailSchema.safeParse({
      ...validExpenseRow,
      created_by: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("expenseDetailResultSchema", () => {
  it("accepts a valid wrapped result", () => {
    const result = expenseDetailResultSchema.safeParse({
      expense: { ...validExpenseRow, created_by: 1, updated_by: 2 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty result", () => {
    const result = expenseDetailResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
