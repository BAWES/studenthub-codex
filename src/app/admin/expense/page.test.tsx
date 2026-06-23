import { describe, it, expect } from "vitest";
import {
  listExpensesSchema,
  getExpenseSchema,
  createExpenseSchema,
  updateExpenseSchema,
  expenseItemSchema,
  listExpensesResultSchema,
  operationResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/expense.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */
describe("admin expense page — data contract", () => {
  describe("listExpensesSchema", () => {
    it("parses with defaults", () => {
      const r = listExpensesSchema.safeParse({});
      expect(r.success).toBe(true);
    });

    it("accepts all filter parameters", () => {
      const r = listExpensesSchema.safeParse({
        type: "office",
        title: "Stationery",
        page: 1,
        limit: 50,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.type).toBe("office");
        expect(r.data.page).toBe(1);
      }
    });

    it("rejects negative page", () => {
      const r = listExpensesSchema.safeParse({ page: -1 });
      expect(r.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const r = listExpensesSchema.safeParse({ limit: 200 });
      expect(r.success).toBe(false);
    });

    it("accepts ISO datetime for startDate", () => {
      const r = listExpensesSchema.safeParse({
        startDate: "2026-06-01T00:00:00+03:00",
      });
      expect(r.success).toBe(true);
    });

    it("accepts date-only string for startDate", () => {
      const r = listExpensesSchema.safeParse({
        startDate: "2026-06-01",
      });
      expect(r.success).toBe(true);
    });
  });

  describe("getExpenseSchema", () => {
    it("validates with id", () => {
      const r = getExpenseSchema.safeParse({ id: "exp-001" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.id).toBe("exp-001");
      }
    });

    it("rejects empty id", () => {
      const r = getExpenseSchema.safeParse({ id: "" });
      expect(r.success).toBe(false);
    });
  });

  describe("createExpenseSchema", () => {
    it("validates with required fields only", () => {
      const r = createExpenseSchema.safeParse({
        title: "Office Supplies",
        type: "office",
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.title).toBe("Office Supplies");
        expect(r.data.type).toBe("office");
      }
    });

    it("accepts all optional fields", () => {
      const r = createExpenseSchema.safeParse({
        title: "Office Supplies",
        type: "office",
        detail: "Pens and paper",
        amount: "150.500",
        transactionDatetime: "2026-06-20T10:00:00.000Z",
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty title", () => {
      const r = createExpenseSchema.safeParse({ title: "", type: "office" });
      expect(r.success).toBe(false);
    });

    it("rejects invalid amount format", () => {
      const r = createExpenseSchema.safeParse({
        title: "Test",
        type: "office",
        amount: "not-a-number",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing title", () => {
      const r = createExpenseSchema.safeParse({ type: "office" });
      expect(r.success).toBe(false);
    });

    it("rejects missing type", () => {
      const r = createExpenseSchema.safeParse({ title: "Test" });
      expect(r.success).toBe(false);
    });
  });

  describe("updateExpenseSchema", () => {
    it("validates with required fields", () => {
      const r = updateExpenseSchema.safeParse({
        id: "exp-001",
        title: "Updated Title",
        type: "travel",
      });
      expect(r.success).toBe(true);
    });

    it("accepts optional detail", () => {
      const r = updateExpenseSchema.safeParse({
        id: "exp-001",
        title: "Updated",
        type: "travel",
        detail: "Updated detail",
        amount: "200.000",
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty id", () => {
      const r = updateExpenseSchema.safeParse({
        id: "",
        title: "text",
        type: "office",
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty title", () => {
      const r = updateExpenseSchema.safeParse({
        id: "exp-001",
        title: "",
        type: "office",
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty type", () => {
      const r = updateExpenseSchema.safeParse({
        id: "exp-001",
        title: "Title",
        type: "",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("expenseItemSchema", () => {
    it("validates a full expense entry", () => {
      const r = expenseItemSchema.safeParse({
        expense_uuid: "exp-001",
        title: "Office Supplies",
        type: "office",
        detail: "Pens and paper",
        amount: "150.500",
        transaction_datetime: new Date("2026-06-20"),
        created_by: 100,
        updated_by: null,
        created_at: new Date("2026-06-20"),
        updated_at: null,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.expense_uuid).toBe("exp-001");
        expect(r.data.title).toBe("Office Supplies");
      }
    });

    it("accepts null optional fields", () => {
      const r = expenseItemSchema.safeParse({
        expense_uuid: "exp-002",
        title: "Test",
        type: "travel",
        detail: null,
        amount: null,
        transaction_datetime: null,
        created_by: null,
        updated_by: null,
        created_at: null,
        updated_at: null,
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing required expense_uuid", () => {
      const r = expenseItemSchema.safeParse({
        title: "Test",
        type: "office",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing required title", () => {
      const r = expenseItemSchema.safeParse({
        expense_uuid: "exp-001",
        type: "office",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing required type", () => {
      const r = expenseItemSchema.safeParse({
        expense_uuid: "exp-001",
        title: "Test",
      });
      expect(r.success).toBe(false);
    });

    it("parses amount as string", () => {
      const r = expenseItemSchema.safeParse({
        expense_uuid: "exp-001",
        title: "Test",
        type: "office",
        amount: "150.500",
        detail: null,
        transaction_datetime: null,
        created_by: null,
        updated_by: null,
        created_at: null,
        updated_at: null,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(typeof r.data.amount).toBe("string");
      }
    });
  });

  describe("listExpensesResultSchema", () => {
    it("validates paginated result", () => {
      const r = listExpensesResultSchema.safeParse({
        expenses: [
          {
            expense_uuid: "exp-001",
            title: "Test",
            type: "office",
            detail: null,
            amount: null,
            transaction_datetime: null,
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
      });
      expect(r.success).toBe(true);
    });

    it("rejects negative total", () => {
      const r = listExpensesResultSchema.safeParse({
        expenses: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });

    it("rejects zero page", () => {
      const r = listExpensesResultSchema.safeParse({
        expenses: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("operationResultSchema", () => {
    it("validates success result", () => {
      const r = operationResultSchema.safeParse({
        operation: "success",
        message: "Expense created successfully",
      });
      expect(r.success).toBe(true);
    });

    it("validates error result", () => {
      const r = operationResultSchema.safeParse({
        operation: "error",
        message: "Failed to create expense",
      });
      expect(r.success).toBe(true);
    });
  });
});
