import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/admin/expense actions
// ---------------------------------------------------------------------------

export const listExpensesSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getExpenseSchema = z.object({
  id: z.string().min(1, "Invalid expense ID"),
});
export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  detail: z.string().optional(),
  amount: z
    .string()
    .regex(/^-?\d+(\.\d{1,3})?$/, "Amount must be a valid decimal number (up to 3 decimal places)")
    .optional(),
  transactionDatetime: z.string().datetime().optional(),
});
export const updateExpenseSchema = z.object({
  id: z.string().min(1, "Invalid expense ID"),
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  detail: z.string().optional(),
  amount: z
    .string()
    .regex(/^-?\d+(\.\d{1,3})?$/, "Amount must be a valid decimal number (up to 3 decimal places)")
    .optional(),
});
export const deleteExpenseSchema = z.object({
  id: z.string().min(1, "Invalid expense ID"),
});
export type ListExpensesParams = z.input<typeof listExpensesSchema>;
export type GetExpenseParams = z.input<typeof getExpenseSchema>;
export type CreateExpenseParams = z.input<typeof createExpenseSchema>;
export type UpdateExpenseParams = z.input<typeof updateExpenseSchema>;
export type DeleteExpenseParams = z.input<typeof deleteExpenseSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const expenseItemSchema = z.object({
  expense_uuid: z.string(),
  title: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  amount: z.string().nullable(),
  transaction_datetime: z.date().nullable(),
  created_by: z.number().int().nullable(),
  updated_by: z.number().int().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listExpensesResultSchema = z.object({
  expenses: z.array(expenseItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const operationResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type ExpenseItem = z.output<typeof expenseItemSchema>;
export type ListExpensesResult = z.output<typeof listExpensesResultSchema>;
