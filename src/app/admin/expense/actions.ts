"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { createExpenseSchema, updateExpenseSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Get expense detail for edit view
// ---------------------------------------------------------------------------

export async function getExpenseDetail(expenseUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  const expense = await prisma.expense.findUnique({
    where: { expense_uuid: expenseUuid },
    select: {
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
    },
  });

  return expense;
}

// ---------------------------------------------------------------------------
// Create expense
// ---------------------------------------------------------------------------

export async function createExpense(raw: FormData | Record<string, unknown>) {
  await requireRoleCapability("admin", "admin.system");

  const parsed = createExpenseSchema.parse(raw);
  const uuid = crypto.randomUUID();

  await prisma.expense.create({
    data: {
      expense_uuid: uuid,
      title: parsed.title,
      type: parsed.type,
      detail: parsed.detail || null,
      amount: parsed.amount ?? null,
      transaction_datetime: parsed.transaction_datetime
        ? new Date(parsed.transaction_datetime)
        : null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/admin/expense");
  return { uuid };
}

// ---------------------------------------------------------------------------
// Update expense
// ---------------------------------------------------------------------------

export async function updateExpense(
  expenseUuid: string,
  data: {
    title: string;
    type: string;
    detail?: string;
    amount?: number | null;
    transaction_datetime?: string | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");

  const parsed = updateExpenseSchema.parse(data);

  await prisma.expense.update({
    where: { expense_uuid: expenseUuid },
    data: {
      title: parsed.title,
      type: parsed.type,
      detail: parsed.detail || null,
      amount: parsed.amount ?? null,
      transaction_datetime: parsed.transaction_datetime
        ? new Date(parsed.transaction_datetime)
        : null,
      updated_at: new Date(),
    },
  });

  revalidatePath("/admin/expense");
}

// ---------------------------------------------------------------------------
// Delete expense
// ---------------------------------------------------------------------------

export async function deleteExpense(expenseUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.expense.delete({
    where: { expense_uuid: expenseUuid },
  });

  revalidatePath("/admin/expense");
}
