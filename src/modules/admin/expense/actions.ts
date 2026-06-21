"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listExpensesSchema,
  getExpenseSchema,
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  expenseItemSchema,
  listExpensesResultSchema,
  createExpenseResultSchema,
  operationResultSchema,
} from "./schemas";
import type {
  ListExpensesParams,
  GetExpenseParams,
  CreateExpenseParams,
  UpdateExpenseParams,
  DeleteExpenseParams,
  ExpenseItem,
  ListExpensesResult,
  OperationResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listExpenses
// ---------------------------------------------------------------------------

/**
 * List expenses with pagination and optional filters.
 */
export async function listExpenses(
  params: ListExpensesParams = {},
): Promise<ListExpensesResult> {
  await requireCapability("admin.read");

  const parsed = listExpensesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { type, title, page, limit, startDate } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, any> = {};

  if (type) {
    where.type = { contains: type };
  }

  if (title) {
    where.title = { contains: title };
  }

  if (startDate) {
    where.transaction_datetime = { gte: new Date(startDate) };
  }

  const [records, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { transaction_datetime: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  const expenses = records.map(toExpenseItem);

  const result: ListExpensesResult = {
    expenses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listExpensesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/expense] listExpenses output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getExpense
// ---------------------------------------------------------------------------

/**
 * Get a single expense by ID.
 * Returns null if not found.
 */
export async function getExpense(
  params: GetExpenseParams,
): Promise<ExpenseItem | null> {
  await requireCapability("admin.read");

  const parsed = getExpenseSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense ID");
  }

  const { id } = parsed.data;

  const record = await prisma.expense.findFirst({
    where: { expense_uuid: id },
  });

  if (!record) return null;

  const result = toExpenseItem(record);

  const outputParsed = expenseItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/expense] getExpense output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createExpense
// ---------------------------------------------------------------------------

/**
 * Create a new expense record.
 * Returns operation result compatible with the action-state form pattern.
 */
export async function createExpense(
  data: CreateExpenseParams,
): Promise<OperationResult & { expense_uuid?: string }> {
  await requireCapability("admin.write");

  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid expense data",
    };
  }

  const { title, type, detail, amount, transactionDatetime } = parsed.data;

  try {
    const expenseUuid = crypto.randomUUID();

    await prisma.expense.create({
      data: {
        expense_uuid: expenseUuid,
        title,
        type,
        detail: detail || null,
        amount: amount || null,
        transaction_datetime: transactionDatetime
          ? new Date(transactionDatetime)
          : null,
      },
    });

    const result = { expense_uuid: expenseUuid };

    const outputParsed = createExpenseResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] createExpense output validation failed:",
        outputParsed.error.issues,
      );
    }

    return {
      operation: "success",
      message: "Expense created successfully",
      expense_uuid: expenseUuid,
    };
  } catch (err) {
    console.error("[modules/admin/expense] createExpense error:", err);
    return {
      operation: "error",
      message: "Failed to create expense",
    };
  }
}

// ---------------------------------------------------------------------------
// updateExpense
// ---------------------------------------------------------------------------

/**
 * Update an existing expense record.
 */
export async function updateExpense(
  data: UpdateExpenseParams,
): Promise<OperationResult> {
  await requireCapability("admin.write");

  const parsed = updateExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid expense data",
    };
  }

  const { id, title, type, detail, amount } = parsed.data;

  try {
    const existing = await prisma.expense.findFirst({
      where: { expense_uuid: id },
    });

    if (!existing) {
      return {
        operation: "error",
        message: `Expense not found: ${id}`,
      };
    }

    const updateData: Record<string, any> = {};
    updateData.title = title;
    updateData.type = type;
    if (detail !== undefined) updateData.detail = detail || null;
    if (amount !== undefined) updateData.amount = amount || null;

    await prisma.expense.update({
      where: { expense_uuid: id },
      data: updateData,
    });

    return {
      operation: "success",
      message: "Expense updated successfully",
    };
  } catch (err) {
    console.error("[modules/admin/expense] updateExpense error:", err);
    return {
      operation: "error",
      message: "Failed to update expense",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteExpense
// ---------------------------------------------------------------------------

/**
 * Delete an expense record.
 */
export async function deleteExpense(
  params: DeleteExpenseParams,
): Promise<OperationResult> {
  await requireCapability("admin.write");

  const parsed = deleteExpenseSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid expense ID",
    };
  }

  const { id } = parsed.data;

  try {
    const existing = await prisma.expense.findFirst({
      where: { expense_uuid: id },
    });

    if (!existing) {
      return {
        operation: "error",
        message: `Expense not found: ${id}`,
      };
    }

    await prisma.expense.delete({
      where: { expense_uuid: id },
    });

    return {
      operation: "success",
      message: "Expense deleted successfully",
    };
  } catch (err) {
    console.error("[modules/admin/expense] deleteExpense error:", err);
    return {
      operation: "error",
      message: "Failed to delete expense",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toExpenseItem(record: Record<string, unknown>): ExpenseItem {
  return {
    expense_uuid: record.expense_uuid as string,
    title: record.title as string,
    type: record.type as string,
    detail: (record.detail as string) ?? null,
    amount: record.amount != null ? String(record.amount) : null,
    transaction_datetime:
      record.transaction_datetime instanceof Date
        ? record.transaction_datetime.toISOString()
        : null,
    created_by: (record.created_by as number) ?? null,
    updated_by: (record.updated_by as number) ?? null,
    created_at:
      record.created_at instanceof Date
        ? record.created_at.toISOString()
        : null,
    updated_at:
      record.updated_at instanceof Date
        ? record.updated_at.toISOString()
        : null,
  };
}
