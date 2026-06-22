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
  operationResultSchema,
  type ListExpensesParams,
  type GetExpenseParams,
  type CreateExpenseParams,
  type UpdateExpenseParams,
  type DeleteExpenseParams,
  type ExpenseItem,
  type ListExpensesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const expenseSelect = {
  expense_uuid: true,
  title: true,
  type: true,
  detail: true,
  amount: true,
  transaction_datetime: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
} as const;

function mapExpense(expense: any): ExpenseItem {
  return {
    expense_uuid: expense.expense_uuid,
    title: expense.title,
    type: expense.type,
    detail: expense.detail,
    amount: expense.amount ? expense.amount.toString() : null,
    transaction_datetime: expense.transaction_datetime,
    created_by: expense.created_by,
    updated_by: expense.updated_by,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Server actions
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

  const {
    type,
    title,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = parsed.data;

  const where: Record<string, unknown> = {};

  if (type) where.type = type;
  if (title) where.title = { contains: title } as any;
  if (startDate || endDate) {
    const transactionDatetime: Record<string, unknown> = {};
    if (startDate) transactionDatetime.gte = new Date(startDate);
    if (endDate) transactionDatetime.lte = new Date(endDate);
    where.transaction_datetime = transactionDatetime;
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: expenseSelect,
    }),
    prisma.expense.count({ where: where as any }),
  ]);

  const result = {
    expenses: expenses.map(mapExpense),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listExpensesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/expense] listExpenses output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single expense by UUID.
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

  const expense = await prisma.expense.findFirst({
    where: { expense_uuid: id },
    select: expenseSelect,
  });

  if (!expense) {
    // Validate output shape (null case)
    const nullOutputParsed = expenseItemSchema.nullable().safeParse(null);
    if (!nullOutputParsed.success) {
      console.error(
        "[modules/admin/expense] getExpense output validation failed:",
        nullOutputParsed.error.issues,
      );
    }
    return null;
  }

  const result = mapExpense(expense);

  // Validate output shape
  const outputParsed = expenseItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/expense] getExpense output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new expense.
 */
export async function createExpense(
  params: CreateExpenseParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = createExpenseSchema.safeParse(params);
  if (!parsed.success) {
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] createExpense output validation failed (input error):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }

  const { title, type, detail, amount, transactionDatetime } = parsed.data;

  try {
    await prisma.expense.create({
      data: {
        expense_uuid: crypto.randomUUID(),
        title,
        type,
        detail: detail ?? null,
        amount: amount ?? null,
        transaction_datetime: transactionDatetime ? new Date(transactionDatetime) : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const successResult = {
      operation: "success",
      message: "Expense created successfully",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] createExpense output validation failed:",
        outputParsed.error.issues,
      );
    }
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "We've faced a problem creating the Expense, please contact us for assistance.",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] createExpense output validation failed (catch):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }
}

/**
 * Update an existing expense.
 */
export async function updateExpense(
  params: UpdateExpenseParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = updateExpenseSchema.safeParse(params);
  if (!parsed.success) {
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update parameters",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] updateExpense output validation failed (input error):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }

  const { id, title, type, detail, amount } = parsed.data;

  const existing = await prisma.expense.findFirst({
    where: { expense_uuid: id },
  });

  if (!existing) {
    const notFoundResult = {
      operation: "error",
      message: "Expense not found",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(notFoundResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] updateExpense output validation failed (not found):",
        outputParsed.error.issues,
      );
    }
    return notFoundResult;
  }

  try {
    await prisma.expense.update({
      where: { expense_uuid: id },
      data: {
        title,
        type,
        detail: detail ?? existing.detail,
        amount: amount ?? existing.amount,
        updated_at: new Date(),
      },
    });

    const successResult = {
      operation: "success",
      message: "Expense successfully updated",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] updateExpense output validation failed:",
        outputParsed.error.issues,
      );
    }
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "We've faced a problem updating the Expense, please contact us for assistance.",
    };
    // Validate output shape
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] updateExpense output validation failed (catch):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }
}

// ---------------------------------------------------------------------------
// Delete expense
// ---------------------------------------------------------------------------

/**
 * Delete an expense by UUID.
 */
export async function deleteExpense(
  params: DeleteExpenseParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = deleteExpenseSchema.safeParse(params);
  if (!parsed.success) {
    const errorResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid delete parameters",
    };
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] deleteExpense output validation failed (input error):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }

  const { id } = parsed.data;

  const existing = await prisma.expense.findFirst({
    where: { expense_uuid: id },
  });

  if (!existing) {
    const notFoundResult = {
      operation: "error",
      message: "Expense not found",
    };
    const outputParsed = operationResultSchema.safeParse(notFoundResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] deleteExpense output validation failed (not found):",
        outputParsed.error.issues,
      );
    }
    return notFoundResult;
  }

  try {
    await prisma.expense.delete({
      where: { expense_uuid: id },
    });

    const successResult = {
      operation: "success",
      message: "Expense deleted successfully",
    };
    const outputParsed = operationResultSchema.safeParse(successResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] deleteExpense output validation failed:",
        outputParsed.error.issues,
      );
    }
    return successResult;
  } catch (error) {
    const errorResult = {
      operation: "error",
      message: "Failed to delete expense. Please try again.",
    };
    const outputParsed = operationResultSchema.safeParse(errorResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/expense] deleteExpense output validation failed (catch):",
        outputParsed.error.issues,
      );
    }
    return errorResult;
  }
}
