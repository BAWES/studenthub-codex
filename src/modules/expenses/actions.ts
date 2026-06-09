"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listExpensesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getExpenseSchema = z.object({
  expenseUuid: z.string().min(1, "Expense UUID is required"),
});

const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  detail: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive").optional(),
  transactionDatetime: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExpenseListItem = {
  expense_uuid: string;
  title: string;
  type: string;
  detail: string | null;
  amount: number | null;
  transaction_datetime: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListExpensesResult = {
  expenses: ExpenseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listExpenses
// ---------------------------------------------------------------------------

/**
 * List expenses with pagination.
 * Mirrors the legacy Yii2 Admin ExpenseController::actionList().
 */
export async function listExpenses(
  params: FormData | z.input<typeof listExpensesSchema> = {},
): Promise<ListExpensesResult> {
  await requireCapability("expense.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listExpensesSchema.safeParse(raw);
  if (!parsed.success) {
    return { expenses: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count(),
  ]);

  return {
    expenses: expenses.map((e: any): ExpenseListItem => ({
      expense_uuid: e.expense_uuid,
      title: e.title,
      type: e.type,
      detail: e.detail ?? null,
      amount: e.amount ? Number(e.amount) : null,
      transaction_datetime: e.transaction_datetime?.toISOString() ?? null,
      created_at: e.created_at?.toISOString() ?? null,
      updated_at: e.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getExpense
// ---------------------------------------------------------------------------

/**
 * Get a single expense by UUID.
 * Returns null if not found.
 */
export async function getExpense(
  expenseUuid: string,
): Promise<ExpenseListItem | null> {
  await requireCapability("expense.read");

  const parsed = getExpenseSchema.safeParse({ expenseUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense UUID");
  }

  const expense = await prisma.expense.findFirst({
    where: { expense_uuid: parsed.data.expenseUuid },
  });

  if (!expense) return null;

  const raw = expense as any;
  return {
    expense_uuid: raw.expense_uuid,
    title: raw.title,
    type: raw.type,
    detail: raw.detail ?? null,
    amount: raw.amount ? Number(raw.amount) : null,
    transaction_datetime: raw.transaction_datetime?.toISOString() ?? null,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// createExpense
// ---------------------------------------------------------------------------

/**
 * Create a new expense record.
 * Generates a UUID prefixed with "exp_".
 * Mirrors the legacy Yii2 Admin ExpenseController::actionCreate().
 */
export async function createExpense(
  data: z.input<typeof createExpenseSchema>,
): Promise<{ expense_uuid: string }> {
  await requireCapability("expense.write");

  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid expense data");
  }

  const { title, type, detail, amount, transactionDatetime } = parsed.data;

  const expense = await prisma.expense.create({
    data: {
      expense_uuid: `exp_${crypto.randomUUID()}`,
      title,
      type,
      detail: detail ?? null,
      amount: amount ?? null,
      transaction_datetime: transactionDatetime
        ? new Date(transactionDatetime)
        : null,
    } as any,
  });

  return { expense_uuid: expense.expense_uuid };
}
