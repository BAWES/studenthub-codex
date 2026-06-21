import { z } from "zod";

// ---------------------------------------------------------------------------
// Expense list item (for DataTable rows)
// ---------------------------------------------------------------------------

export const expenseListItemSchema = z.object({
  expense_uuid: z.string(),
  title: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  amount: z.number().nullable(),
  transaction_datetime: z.date().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type ExpenseListItem = z.infer<typeof expenseListItemSchema>;

// ---------------------------------------------------------------------------
// Expense detail (single record with admin joins)
// ---------------------------------------------------------------------------

export const expenseDetailSchema = z.object({
  expense_uuid: z.string(),
  title: z.string(),
  type: z.string(),
  detail: z.string().nullable(),
  amount: z.number().nullable(),
  transaction_datetime: z.date().nullable(),
  created_by: z.number().int().nullable(),
  updated_by: z.number().int().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type ExpenseDetail = z.infer<typeof expenseDetailSchema>;

// ---------------------------------------------------------------------------
// Wrapped detail result
// ---------------------------------------------------------------------------

export const expenseDetailResultSchema = z.object({
  expense: expenseDetailSchema,
});

export type ExpenseDetailResult = z.infer<typeof expenseDetailResultSchema>;

// ---------------------------------------------------------------------------
// Create / update input schemas
// ---------------------------------------------------------------------------

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(128, "Title must be at most 128 characters"),
  type: z.string().min(1, "Type is required").max(128, "Type must be at most 128 characters"),
  detail: z.string().optional().default(""),
  amount: z.coerce.number().optional(),
  transaction_datetime: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(128, "Title must be at most 128 characters"),
  type: z.string().min(1, "Type is required").max(128, "Type must be at most 128 characters"),
  detail: z.string().optional().default(""),
  amount: z.coerce.number().optional(),
  transaction_datetime: z.string().optional(),
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
