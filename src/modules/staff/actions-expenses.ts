"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExpenseRecord = {
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

export type ExpenseListResult = {
  expenses: ExpenseRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateExpenseResult = {
  operation: string;
  message: string;
  expenseUuid?: string;
};

// ---------------------------------------------------------------------------
// Schemas
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

export type ListExpensesParams = z.input<typeof listExpensesSchema>;

const getExpenseSchema = z.object({
  id: z.string().min(1),
});

export type GetExpenseParams = z.input<typeof getExpenseSchema>;

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

export type CreateExpenseParams = z.input<typeof createExpenseSchema>;

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

export type UpdateExpenseParams = z.input<typeof updateExpenseSchema>;

// ---------------------------------------------------------------------------
// Helpers
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

/**
 * Build a Prisma where clause from filter params.
 */
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

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List staff expense records with optional filters (staffId, category,
 * supplier, reimbursable) and pagination. Ordered by created_at descending.
 * Mirrors the legacy Yii2 StaffExpensesController::actionList().
 *
 * @param params - Optional filter and pagination parameters
 * @returns Paginated expense list with total count
 */
export async function listExpenses(
  params: ListExpensesParams = {},
): Promise<ExpenseListResult> {
  await requireCapability("staff_expense.read");

  const parsed = listExpensesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { staffId, category, supplier, reimbursable, dateFrom, dateTo, page = 1, limit = 20 } = parsed.data;
  const where = buildExpenseFilter({ staffId, category, supplier, reimbursable, dateFrom, dateTo });

  const [rows, total] = await Promise.all([
    prisma.staff_expenses.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        staff_expense_uuid: true,
        supplier: true,
        category: true,
        purchase_date: true,
        total_amount: true,
        currency: true,
        vat: true,
        reimbursable: true,
        description: true,
        file: true,
        staff_id: true,
        status: true,
        created_at: true,
      },
    }),
    prisma.staff_expenses.count({ where: where as any }),
  ]);

  const expenses: ExpenseRecord[] = rows.map((r) => ({
    staff_expense_uuid: r.staff_expense_uuid,
    supplier: r.supplier,
    category: r.category,
    purchase_date: r.purchase_date,
    total_amount: r.total_amount ? Number(r.total_amount) : null,
    currency: r.currency,
    vat: r.vat ? Number(r.vat) : null,
    reimbursable: r.reimbursable ?? false,
    description: r.description,
    file: r.file,
    staff_id: r.staff_id,
    status: r.status,
    created_at: r.created_at,
  }));

  return {
    expenses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single staff expense record by UUID. Returns null if not found.
 * Mirrors the legacy Yii2 StaffExpensesController::actionView().
 *
 * @param params - Object with `id` (expense UUID string)
 * @returns The expense record, or null if not found
 */
export async function getExpense(
  params: GetExpenseParams,
): Promise<ExpenseRecord | null> {
  await requireCapability("staff_expense.read");

  const parsed = getExpenseSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense ID");
  }

  const { id } = parsed.data;

  const expense = await prisma.staff_expenses.findFirst({
    where: {
      staff_expense_uuid: id,
    },
    select: {
      staff_expense_uuid: true,
      supplier: true,
      category: true,
      purchase_date: true,
      total_amount: true,
      currency: true,
      vat: true,
      reimbursable: true,
      description: true,
      file: true,
      staff_id: true,
      status: true,
      created_at: true,
    },
  });

  if (!expense) return null;

  return {
    staff_expense_uuid: expense.staff_expense_uuid,
    supplier: expense.supplier,
    category: expense.category,
    purchase_date: expense.purchase_date,
    total_amount: expense.total_amount ? Number(expense.total_amount) : null,
    currency: expense.currency,
    vat: expense.vat ? Number(expense.vat) : null,
    reimbursable: expense.reimbursable ?? false,
    description: expense.description,
    file: expense.file,
    staff_id: expense.staff_id,
    status: expense.status,
    created_at: expense.created_at,
  };
}

/**
 * Create a new staff expense record.
 * Generates a UUID prefixed with "expense_".
 * Mirrors the legacy Yii2 StaffExpensesController::actionCreate().
 *
 * @param data - Expense creation details
 * @returns Operation result with UUID on success, or error message
 */
export async function createExpense(
  data: CreateExpenseParams,
): Promise<CreateExpenseResult> {
  await requireCapability("staff_expense.write");

  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const {
    staffId,
    supplier,
    category,
    purchaseDate,
    totalAmount,
    currency,
    vat,
    reimbursable,
    description,
    file,
    status,
  } = parsed.data;

  try {
    const uuid = `expense_${crypto.randomUUID()}`;

    await prisma.staff_expenses.create({
      data: {
        staff_expense_uuid: uuid,
        staff_id: staffId,
        supplier: supplier ?? null,
        category: category ?? null,
        purchase_date: purchaseDate ? new Date(purchaseDate) : null,
        total_amount: totalAmount ?? null,
        currency: currency ?? null,
        vat: vat ?? null,
        reimbursable: reimbursable ?? false,
        description: description ?? null,
        file: file ?? null,
        status: status ?? "KWD",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Expense saved!",
      expenseUuid: uuid,
    };
  } catch (error) {
    return {
      operation: "error",
      message: error instanceof Error ? error.message : "Failed to save expense",
    };
  }
}

/**
 * Update an existing staff expense record.
 * Throws if the record is not found.
 * Mirrors the legacy Yii2 StaffExpensesController::actionUpdate().
 *
 * @param params - Object with `id` (expense UUID) and fields to update
 * @returns The updated expense record
 */
export async function updateExpense(
  params: UpdateExpenseParams,
): Promise<ExpenseRecord> {
  await requireCapability("staff_expense.write");

  const parsed = updateExpenseSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid update parameters");
  }

  const { id, ...fields } = parsed.data;

  // Verify the record exists
  const existing = await prisma.staff_expenses.findFirst({
    where: { staff_expense_uuid: id },
  });
  if (!existing) {
    throw new Error("Expense not found");
  }

  // Build update data — only include fields that were explicitly provided
  const updateData: Record<string, unknown> = {};
  if (fields.supplier !== undefined) updateData.supplier = fields.supplier;
  if (fields.category !== undefined) updateData.category = fields.category;
  if (fields.purchaseDate !== undefined) updateData.purchase_date = new Date(fields.purchaseDate);
  if (fields.totalAmount !== undefined) updateData.total_amount = fields.totalAmount;
  if (fields.currency !== undefined) updateData.currency = fields.currency;
  if (fields.vat !== undefined) updateData.vat = fields.vat;
  if (fields.reimbursable !== undefined) updateData.reimbursable = fields.reimbursable;
  if (fields.description !== undefined) updateData.description = fields.description;
  if (fields.file !== undefined) updateData.file = fields.file;
  if (fields.status !== undefined) updateData.status = fields.status;
  updateData.updated_at = new Date();

  const expense = await prisma.staff_expenses.update({
    where: { staff_expense_uuid: id },
    data: updateData as any,
    select: {
      staff_expense_uuid: true,
      supplier: true,
      category: true,
      purchase_date: true,
      total_amount: true,
      currency: true,
      vat: true,
      reimbursable: true,
      description: true,
      file: true,
      staff_id: true,
      status: true,
      created_at: true,
    },
  });

  return {
    staff_expense_uuid: expense.staff_expense_uuid,
    supplier: expense.supplier,
    category: expense.category,
    purchase_date: expense.purchase_date,
    total_amount: expense.total_amount ? Number(expense.total_amount) : null,
    currency: expense.currency,
    vat: expense.vat ? Number(expense.vat) : null,
    reimbursable: expense.reimbursable ?? false,
    description: expense.description,
    file: expense.file,
    staff_id: expense.staff_id,
    status: expense.status,
    created_at: expense.created_at,
  };
}