"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  staffExpenseItemSchema,
  listExpensesResultSchema,
  expenseActionResultSchema,
  type StaffExpenseItem,
  type ListExpensesResult,
  type ExpenseActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
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
// Types (input params)
// ---------------------------------------------------------------------------

export type ListExpensesParams = z.input<typeof listExpensesSchema>;
export type CreateExpenseParams = z.input<typeof createExpenseSchema>;
export type UpdateExpenseParams = z.input<typeof updateExpenseSchema>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// listExpenses
// ---------------------------------------------------------------------------

/**
 * List staff expenses with pagination and optional filters.
 * Filters by staff ID and/or category when provided.
 * Sorted by created_at descending (most recent first).
 * Mirrors the legacy Yii2 StaffExpensesController::actionList().
 */
export async function listExpenses(
  params: ListExpensesParams = {},
): Promise<ListExpensesResult> {
  await requireCapability("admin.read");

  const parsed = listExpensesSchema.safeParse(params);
  if (!parsed.success) {
    return { expenses: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { staffId, category, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (staffId !== undefined) {
    where.staff_id = staffId;
  }

  if (category !== undefined) {
    where.category = category;
  }

  const [expenses, total] = await Promise.all([
    prisma.staff_expenses.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.staff_expenses.count({ where: where as any }),
  ]);

  const result = {
    expenses: expenses.map((e) => ({
      staff_expense_uuid: e.staff_expense_uuid,
      supplier: e.supplier,
      category: e.category,
      purchase_date: e.purchase_date,
      total_amount: e.total_amount,
      currency: e.currency,
      vat: e.vat,
      reimbursable: e.reimbursable ?? false,
      description: e.description,
      file: e.file,
      staff_id: e.staff_id,
      created_at: e.created_at,
      updated_at: e.updated_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listExpensesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-expenses] listExpenses output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getExpense
// ---------------------------------------------------------------------------

/**
 * Get a single staff expense by UUID.
 * Returns null if not found.
 * Mirrors the legacy Yii2 StaffExpensesController::actionView().
 */
export async function getExpense(
  params: z.input<typeof getExpenseSchema>,
): Promise<StaffExpenseItem | null> {
  await requireCapability("admin.read");

  const parsed = getExpenseSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense UUID");
  }

  const { uuid } = parsed.data;

  const expense = await prisma.staff_expenses.findUnique({
    where: { staff_expense_uuid: uuid },
  });

  if (!expense) return null;

  const result = {
    staff_expense_uuid: expense.staff_expense_uuid,
    supplier: expense.supplier,
    category: expense.category,
    purchase_date: expense.purchase_date,
    total_amount: expense.total_amount,
    currency: expense.currency,
    vat: expense.vat,
    reimbursable: expense.reimbursable ?? false,
    description: expense.description,
    file: expense.file,
    staff_id: expense.staff_id,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
  };

  // Validate output shape
  const outputParsed = staffExpenseItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-expenses] getExpense output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createExpense
// ---------------------------------------------------------------------------

/**
 * Create a new staff expense record.
 * Requires the "admin.write" capability.
 * Returns { operation, message } on success or error.
 * Mirrors the legacy Yii2 StaffExpensesController::actionCreate().
 */
export async function createExpense(
  params: CreateExpenseParams,
): Promise<ExpenseActionResult> {
  await requireCapability("admin.write");

  const parsed = createExpenseSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid expense data",
    };
  }

  const now = new Date();

  try {
    await prisma.staff_expenses.create({
      data: {
        staff_expense_uuid: crypto.randomUUID(),
        supplier: parsed.data.supplier ?? null,
        category: parsed.data.category ?? null,
        purchase_date: parsed.data.purchaseDate
          ? new Date(parsed.data.purchaseDate)
          : null,
        total_amount: parsed.data.totalAmount ?? null,
        currency: parsed.data.currency ?? null,
        vat: parsed.data.vat ?? null,
        reimbursable: parsed.data.reimbursable ?? false,
        description: parsed.data.description ?? null,
        file: parsed.data.file ?? null,
        created_at: now,
        updated_at: now,
      },
    });

    return {
      operation: "success",
      message: "Staff expense created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create staff expense",
    };
  }
}

// ---------------------------------------------------------------------------
// updateExpense
// ---------------------------------------------------------------------------

/**
 * Update an existing staff expense record.
 * Only provided fields are updated.
 * Requires the "admin.write" capability.
 * Mirrors the legacy Yii2 StaffExpensesController::actionUpdate().
 */
export async function updateExpense(
  params: UpdateExpenseParams,
): Promise<ExpenseActionResult> {
  await requireCapability("admin.write");

  const parsed = updateExpenseSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid expense data",
    };
  }

  const { uuid, ...fields } = parsed.data;

  // Build update payload with only provided fields
  const updateData: Record<string, unknown> = { updated_at: new Date() };

  if (fields.supplier !== undefined) updateData.supplier = fields.supplier;
  if (fields.category !== undefined) updateData.category = fields.category;
  if (fields.purchaseDate !== undefined)
    updateData.purchase_date = new Date(fields.purchaseDate);
  if (fields.totalAmount !== undefined)
    updateData.total_amount = fields.totalAmount;
  if (fields.currency !== undefined) updateData.currency = fields.currency;
  if (fields.vat !== undefined) updateData.vat = fields.vat;
  if (fields.reimbursable !== undefined)
    updateData.reimbursable = fields.reimbursable;
  if (fields.description !== undefined)
    updateData.description = fields.description;
  if (fields.file !== undefined) updateData.file = fields.file;

  try {
    const expense = await prisma.staff_expenses.findUnique({
      where: { staff_expense_uuid: uuid },
    });

    if (!expense) {
      return {
        operation: "error",
        message: "Staff expense not found",
      };
    }

    await prisma.staff_expenses.update({
      where: { staff_expense_uuid: uuid },
      data: updateData as any,
    });

    return {
      operation: "success",
      message: "Staff expense updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to update staff expense",
    };
  }
}
