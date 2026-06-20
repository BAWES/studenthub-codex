import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: staff expense schema validation
//
// Testing schemas and filter construction separately avoids mocking
// "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listExpensesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  category: z.number().int().optional(),
  supplier: z.string().optional(),
  reimbursable: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getExpenseSchema = z.object({
  id: z.string().min(1),
});

const createExpenseSchema = z.object({
  staffId: z.number().int().positive(),
  supplier: z.string().optional(),
  category: z.number().int().optional(),
  purchaseDate: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.number().int().optional(),
  vat: z.number().min(0).optional(),
  reimbursable: z.boolean().optional(),
  description: z.string().optional(),
  file: z.string().optional(),
  status: z.string().optional(),
});

describe("listExpensesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listExpensesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
      expect(result.data.staffId).toBeUndefined();
      expect(result.data.category).toBeUndefined();
      expect(result.data.supplier).toBeUndefined();
      expect(result.data.reimbursable).toBeUndefined();
    }
  });

  it("accepts all optional params", () => {
    const result = listExpensesSchema.safeParse({
      staffId: 1,
      category: 5,
      supplier: "ACME Corp",
      reimbursable: true,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(1);
      expect(result.data.category).toBe(5);
      expect(result.data.supplier).toBe("ACME Corp");
      expect(result.data.reimbursable).toBe(true);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts date range params", () => {
    const result = listExpensesSchema.safeParse({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBe("2026-01-01");
      expect(result.data.dateTo).toBe("2026-06-30");
    }
  });

  it("rejects negative staffId", () => {
    const result = listExpensesSchema.safeParse({ staffId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero staffId", () => {
    const result = listExpensesSchema.safeParse({ staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page number", () => {
    const result = listExpensesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listExpensesSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listExpensesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("getExpenseSchema", () => {
  it("accepts a valid expense UUID string", () => {
    const result = getExpenseSchema.safeParse({ id: "staff_expense_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = getExpenseSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getExpenseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createExpenseSchema", () => {
  it("accepts valid expense creation params", () => {
    const result = createExpenseSchema.safeParse({
      staffId: 1,
      supplier: "ACME Corp",
      category: 5,
      purchaseDate: "2026-06-01",
      totalAmount: 150.50,
      currency: 1,
      vat: 7.5,
      reimbursable: true,
      description: "Office supplies",
    });
    expect(result.success).toBe(true);
  });

  it("accepts bare minimum params (staffId only)", () => {
    const result = createExpenseSchema.safeParse({
      staffId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts expense with file attachment", () => {
    const result = createExpenseSchema.safeParse({
      staffId: 1,
      supplier: "Tech Store",
      totalAmount: 999.99,
      file: "uploads/invoice.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative staffId", () => {
    const result = createExpenseSchema.safeParse({
      staffId: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero staffId", () => {
    const result = createExpenseSchema.safeParse({
      staffId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalAmount", () => {
    const result = createExpenseSchema.safeParse({
      staffId: 1,
      totalAmount: -50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative vat", () => {
    const result = createExpenseSchema.safeParse({
      staffId: 1,
      vat: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Filter builder (unit-testable pure function)
// ---------------------------------------------------------------------------

type ExpenseWhereInput = {
  staff_id?: number;
  category?: number;
  supplier?: { contains: string; mode: "insensitive" };
  reimbursable?: boolean;
  purchase_date?: {
    gte?: Date;
    lte?: Date;
  };
};

function buildExpenseFilter(params: {
  staffId?: number;
  category?: number;
  supplier?: string;
  reimbursable?: boolean;
  dateFrom?: string;
  dateTo?: string;
}): ExpenseWhereInput {
  const where: ExpenseWhereInput = {};

  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }

  if (params.category !== undefined) {
    where.category = params.category;
  }

  if (params.supplier && params.supplier.trim()) {
    where.supplier = { contains: params.supplier, mode: "insensitive" };
  }

  if (params.reimbursable !== undefined) {
    where.reimbursable = params.reimbursable;
  }

  if (params.dateFrom || params.dateTo) {
    where.purchase_date = {};
    if (params.dateFrom) {
      where.purchase_date.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      where.purchase_date.lte = new Date(params.dateTo);
    }
  }

  return where;
}

describe("buildExpenseFilter", () => {
  it("returns empty object when no filters", () => {
    const result = buildExpenseFilter({});
    expect(result).toEqual({});
  });

  it("adds staffId filter when provided", () => {
    const result = buildExpenseFilter({ staffId: 1 });
    expect(result).toEqual({ staff_id: 1 });
  });

  it("adds category filter when provided", () => {
    const result = buildExpenseFilter({ category: 5 });
    expect(result).toEqual({ category: 5 });
  });

  it("adds supplier partial match when provided", () => {
    const result = buildExpenseFilter({ supplier: "ACME" });
    expect(result.supplier).toEqual({ contains: "ACME", mode: "insensitive" });
  });

  it("ignores empty supplier string", () => {
    const result = buildExpenseFilter({ supplier: "" });
    expect(result).toEqual({});
  });

  it("ignores whitespace-only supplier", () => {
    const result = buildExpenseFilter({ supplier: "   " });
    expect(result).toEqual({});
  });

  it("adds reimbursable filter when true", () => {
    const result = buildExpenseFilter({ reimbursable: true });
    expect(result).toEqual({ reimbursable: true });
  });

  it("adds reimbursable filter when false", () => {
    const result = buildExpenseFilter({ reimbursable: false });
    expect(result).toEqual({ reimbursable: false });
  });

  it("combines all filters", () => {
    const result = buildExpenseFilter({
      staffId: 1,
      category: 5,
      supplier: "ACME",
      reimbursable: true,
    });
    expect(result).toEqual({
      staff_id: 1,
      category: 5,
      supplier: { contains: "ACME", mode: "insensitive" },
      reimbursable: true,
    });
  });

  it("adds purchase_date.gte when dateFrom provided", () => {
    const result = buildExpenseFilter({ dateFrom: "2026-01-01" });
    expect(result.purchase_date?.gte).toBeInstanceOf(Date);
    expect(result.purchase_date?.lte).toBeUndefined();
  });

  it("adds purchase_date.lte when dateTo provided", () => {
    const result = buildExpenseFilter({ dateTo: "2026-06-30" });
    expect(result.purchase_date?.lte).toBeInstanceOf(Date);
    expect(result.purchase_date?.gte).toBeUndefined();
  });

  it("adds both gte and lte when both dates provided", () => {
    const result = buildExpenseFilter({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(result.purchase_date?.gte).toBeInstanceOf(Date);
    expect(result.purchase_date?.lte).toBeInstanceOf(Date);
  });

  it("ignores purchase_date when no date range provided", () => {
    const result = buildExpenseFilter({});
    expect(result.purchase_date).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type ExpenseRecord = {
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
  status: string | null;
  created_at: Date | null;
};

type ExpenseListResult = {
  expenses: ExpenseRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ExpenseRecord shape", () => {
  it("defines the expected fields", () => {
    const mock: ExpenseRecord = {
      staff_expense_uuid: "staff_expense_abc",
      supplier: "ACME Corp",
      category: 5,
      purchase_date: new Date("2026-06-01"),
      total_amount: 150.50,
      currency: 1,
      vat: 7.5,
      reimbursable: true,
      description: "Office supplies",
      file: "uploads/invoice.pdf",
      staff_id: 1,
      status: "KWD",
      created_at: new Date("2026-06-01"),
    };
    expect(mock.staff_expense_uuid).toBe("staff_expense_abc");
    expect(mock.supplier).toBe("ACME Corp");
    expect(mock.category).toBe(5);
    expect(mock.total_amount).toBe(150.50);
    expect(mock.reimbursable).toBe(true);
    expect(mock.staff_id).toBe(1);
  });
});

describe("ExpenseListResult shape", () => {
  it("defines pagination fields", () => {
    const mock: ExpenseListResult = {
      expenses: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(mock.expenses).toEqual([]);
    expect(mock.total).toBe(0);
    expect(mock.page).toBe(1);
    expect(mock.limit).toBe(20);
    expect(mock.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// updateExpenseSchema
// ---------------------------------------------------------------------------

const updateExpenseSchema = z.object({
  id: z.string().min(1, "Expense UUID is required"),
  supplier: z.string().optional(),
  category: z.number().int().optional(),
  purchaseDate: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.number().int().optional(),
  vat: z.number().min(0).optional(),
  reimbursable: z.boolean().optional(),
  description: z.string().optional(),
  file: z.string().optional(),
  status: z.string().optional(),
});

describe("updateExpenseSchema", () => {
  it("accepts valid update params with all fields", () => {
    const result = updateExpenseSchema.safeParse({
      id: "expense_abc123",
      supplier: "New Supplier",
      category: 3,
      purchaseDate: "2026-06-15",
      totalAmount: 250.00,
      currency: 1,
      vat: 12.5,
      reimbursable: false,
      description: "Updated office supplies",
      status: "KWD",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only id and one field", () => {
    const result = updateExpenseSchema.safeParse({
      id: "expense_abc123",
      description: "Just updating the description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = updateExpenseSchema.safeParse({
      supplier: "ACME Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = updateExpenseSchema.safeParse({
      id: "",
      supplier: "ACME Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative vat", () => {
    const result = updateExpenseSchema.safeParse({
      id: "expense_abc",
      vat: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalAmount", () => {
    const result = updateExpenseSchema.safeParse({
      id: "expense_abc",
      totalAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero totalAmount", () => {
    const result = updateExpenseSchema.safeParse({
      id: "expense_abc",
      totalAmount: 0,
    });
    expect(result.success).toBe(false);
  });
});
