import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (moved from actions.ts)
// ---------------------------------------------------------------------------

export const listExpensesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getExpenseSchema = z.object({
  expenseUuid: z.string().min(1, "Expense UUID is required"),
});

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  detail: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive").optional(),
  transactionDatetime: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single expense item returned from listExpenses / getExpense.
 */
export const expenseItemSchema = z.object({
  expense_uuid: z.string(),
  title: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  amount: z.number().nullable(),
  transaction_datetime: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for getExpense result (item or null).
 */
export const expenseDetailSchema = expenseItemSchema.nullable();

/**
 * Schema for the listExpenses response.
 */
export const listExpensesResultSchema = z.object({
  expenses: z.array(expenseItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types (derived from schemas where possible, explicit where needed)
// ---------------------------------------------------------------------------

export type ExpenseListItem = z.output<typeof expenseItemSchema>;
export type ListExpensesResult = z.output<typeof listExpensesResultSchema>;
export type ListExpensesParams = z.input<typeof listExpensesSchema>;
export type GetExpenseParams = z.input<typeof getExpenseSchema>;
export type CreateExpenseParams = z.input<typeof createExpenseSchema>;
