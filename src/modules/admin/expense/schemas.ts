import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for listing expenses with filters and pagination.
 */
export const listExpensesSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
});

/**
 * Schema for getting a single expense by ID.
 */
export const getExpenseSchema = z.object({
  id: z.string().min(1, "Expense ID is required"),
});

/**
 * Schema for creating a new expense.
 */
export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(128),
  type: z.string().min(1, "Type is required").max(128),
  detail: z.string().optional(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,3})?$/, "Amount must be a valid number")
    .optional(),
  transactionDatetime: z.string().optional(),
});

/**
 * Schema for updating an existing expense.
 */
export const updateExpenseSchema = z.object({
  id: z.string().min(1, "Expense ID is required"),
  title: z.string().min(1, "Title is required").max(128),
  type: z.string().min(1, "Type is required").max(128),
  detail: z.string().optional(),
  amount: z.string().optional(),
});

/**
 * Schema for deleting an expense.
 */
export const deleteExpenseSchema = z.object({
  id: z.string().min(1, "Expense ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single expense item in API responses.
 */
export const expenseItemSchema = z.object({
  expense_uuid: z.string(),
  title: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  amount: z.string().nullable(),
  transaction_datetime: z.coerce.string().nullable(),
  created_by: z.number().int().nullable(),
  updated_by: z.number().int().nullable(),
  created_at: z.coerce.string().nullable(),
  updated_at: z.coerce.string().nullable(),
});

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

/**
 * Schema for the createExpense response.
 */
export const createExpenseResultSchema = z.object({
  expense_uuid: z.string(),
});

/**
 * Schema for operation result responses (create, update, delete).
 */
export const operationResultSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ExpenseItem = z.output<typeof expenseItemSchema>;
export type ListExpensesResult = z.output<typeof listExpensesResultSchema>;
export type CreateExpenseResult = z.output<typeof createExpenseResultSchema>;
export type OperationResult = z.output<typeof operationResultSchema>;

// Input param types
export type ListExpensesParams = z.input<typeof listExpensesSchema>;
export type GetExpenseParams = z.input<typeof getExpenseSchema>;
export type CreateExpenseParams = z.input<typeof createExpenseSchema>;
export type UpdateExpenseParams = z.input<typeof updateExpenseSchema>;
export type DeleteExpenseParams = z.input<typeof deleteExpenseSchema>;
