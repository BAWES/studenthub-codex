import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffExpenseItemSchema = z.object({
  staff_expense_uuid: z.string(),
  supplier: z.string().nullable(),
  category: z.number().nullable(),
  purchase_date: z.date().nullable(),
  total_amount: z.number().nullable(),
  currency: z.number().nullable(),
  vat: z.number().nullable(),
  reimbursable: z.boolean(),
  description: z.string().nullable(),
  file: z.string().nullable(),
  staff_id: z.number().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type StaffExpenseItem = z.output<typeof staffExpenseItemSchema>;

export const listExpensesResultSchema = z.object({
  expenses: z.array(staffExpenseItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListExpensesResult = z.output<typeof listExpensesResultSchema>;

export const expenseActionResultSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

export type ExpenseActionResult = z.output<typeof expenseActionResultSchema>;
