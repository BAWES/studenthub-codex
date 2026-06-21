"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateExpense, deleteExpense } from "../actions";

interface ExpenseDetail {
  expense_uuid: string;
  title: string;
  type: string;
  detail: string | null;
  amount: import("@prisma/client").Prisma.Decimal | null;
  transaction_datetime: Date | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  admin_expense_created_byToadmin: { admin_id: number; admin_name: string } | null;
  admin_expense_updated_byToadmin: { admin_id: number; admin_name: string } | null;
}

export function ExpenseDetailForm({
  expense,
}: {
  expense: ExpenseDetail;
}) {
  const [title, setTitle] = useState(expense.title);
  const [type, setType] = useState(expense.type);
  const [detail, setDetail] = useState(expense.detail ?? "");
  const [amount, setAmount] = useState(String(expense.amount ?? ""));

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("title", title);
    formData.set("type", type);

    await updateExpense(expense.expense_uuid, {
      title,
      type,
      detail: detail || undefined,
      amount: amount ? Number(amount) : undefined,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Expense</CardTitle>
          <CardDescription>
            Update the expense title, type, amount, and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KWD)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail">Detail</Label>
                <Input
                  id="detail"
                  name="detail"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground pt-2">
              <div>
                Created by: {expense.admin_expense_created_byToadmin?.admin_name ?? "System"}
              </div>
              <div>
                Updated by: {expense.admin_expense_updated_byToadmin?.admin_name ?? "System"}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-[#2e7d32] font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-[#d32f2f]/20">
        <CardHeader>
          <CardTitle className="text-[#d32f2f]">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this expense will permanently remove it. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteExpense(expense.expense_uuid);
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
