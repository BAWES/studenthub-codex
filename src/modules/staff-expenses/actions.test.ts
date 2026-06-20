import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for pure unit testing)
// ---------------------------------------------------------------------------

const listExpensesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  category: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const getExpenseSchema = z.object({
  uuid: z.string().min(1, "Expense UUID is required"),
});

const createExpenseSchema = z.object({
  supplier: z.string().max(225).optional(),
  category: z.number().int().positive().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  totalAmount: z.number().nonnegative().optional(),
  currency: z.number().int().nonnegative().optional(),
  vat: z.number().nonnegative().optional(),
  reimbursable: z.boolean().optional().default(false),
  description: z.string().optional(),
  file: z.string().max(225).optional(),
});

const updateExpenseSchema = z.object({
  uuid: z.string().min(1, "Expense UUID is required"),
  supplier: z.string().max(225).optional(),
  category: z.number().int().positive().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  totalAmount: z.number().nonnegative().optional(),
  currency: z.number().int().nonnegative().optional(),
  vat: z.number().nonnegative().optional(),
  reimbursable: z.boolean().optional(),
  description: z.string().optional(),
  file: z.string().max(225).optional(),
});

// ---------------------------------------------------------------------------
// listExpensesSchema
// ---------------------------------------------------------------------------

describe("listExpensesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listExpensesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.staffId).toBeUndefined();
      expect(result.data.category).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listExpensesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts staffId filter", () => {
    const result = listExpensesSchema.safeParse({ staffId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(42);
    }
  });

  it("rejects limit over 100", () => {
    const result = listExpensesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listExpensesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getExpenseSchema
// ---------------------------------------------------------------------------

describe("getExpenseSchema", () => {
  it("accepts valid UUID", () => {
    const result = getExpenseSchema.safeParse({ uuid: "exp_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("exp_abc123");
    }
  });

  it("rejects empty string", () => {
    const result = getExpenseSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = getExpenseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createExpenseSchema
// ---------------------------------------------------------------------------

describe("createExpenseSchema", () => {
  it("accepts valid create payload with all fields", () => {
    const result = createExpenseSchema.safeParse({
      supplier: "ACME Supplies",
      category: 1,
      purchaseDate: "2026-06-09",
      totalAmount: 150.50,
      currency: 1,
      vat: 15.0,
      reimbursable: true,
      description: "Office supplies",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.supplier).toBe("ACME Supplies");
      expect(result.data.reimbursable).toBe(true);
    }
  });

  it("accepts empty create payload", () => {
    const result = createExpenseSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reimbursable).toBe(false);
    }
  });

  it("rejects invalid purchaseDate format", () => {
    const result = createExpenseSchema.safeParse({ purchaseDate: "06-09-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalAmount", () => {
    const result = createExpenseSchema.safeParse({ totalAmount: -10 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateExpenseSchema
// ---------------------------------------------------------------------------

describe("updateExpenseSchema", () => {
  it("requires uuid", () => {
    const result = updateExpenseSchema.safeParse({ supplier: "New Supplier" });
    expect(result.success).toBe(false);
  });

  it("accepts uuid with partial fields", () => {
    const result = updateExpenseSchema.safeParse({
      uuid: "exp_abc123",
      reimbursable: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("exp_abc123");
      expect(result.data.reimbursable).toBe(true);
    }
  });

  it("accepts uuid with all fields", () => {
    const result = updateExpenseSchema.safeParse({
      uuid: "exp_abc123",
      supplier: "New Supplier",
      totalAmount: 200.0,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type StaffExpenseItem = {
  staff_expense_uuid: string;
  supplier: string | null;
  category: number | null;
  purchase_date: Date | null;
  total_amount: number | null;
  currency: number | null;
  vat: number | null;
  reimbursable: boolean;
  description: string | null;
  file: string | null;
  staff_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListExpensesResult = {
  expenses: StaffExpenseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("StaffExpenseItem shape", () => {
  it("defines expected fields", () => {
    const item: StaffExpenseItem = {
      staff_expense_uuid: "exp_abc123",
      supplier: "ACME Supplies",
      category: 1,
      purchase_date: new Date("2026-06-09"),
      total_amount: 150.50,
      currency: 1,
      vat: 15.0,
      reimbursable: true,
      description: "Office supplies for June",
      file: null,
      staff_id: 42,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(item.staff_expense_uuid).toBe("exp_abc123");
    expect(item.supplier).toBe("ACME Supplies");
    expect(item.reimbursable).toBe(true);
    expect(item.total_amount).toBe(150.50);
  });

  it("accepts null optional fields", () => {
    const item: StaffExpenseItem = {
      staff_expense_uuid: "exp_def456",
      supplier: null,
      category: null,
      purchase_date: null,
      total_amount: null,
      currency: null,
      vat: null,
      reimbursable: false,
      description: null,
      file: null,
      staff_id: null,
      created_at: null,
      updated_at: null,
    };
    expect(item.staff_expense_uuid).toBe("exp_def456");
    expect(item.reimbursable).toBe(false);
  });
});

describe("ListExpensesResult shape", () => {
  it("accepts empty result", () => {
    const r: ListExpensesResult = {
      expenses: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
    expect(r.expenses).toHaveLength(0);
  });
});
